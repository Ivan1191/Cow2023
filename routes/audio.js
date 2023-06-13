var express = require('express');
var router = express.Router();
var auth = require('../auth');
var EventA = require('../models/eventA');
var EventB = require('../models/eventB');
var htA = require('../models/htA');
var htB = require('../models/htB');
var AudioRaw = require('../models/audioRaw')
var audioClassManage = require('../models/audioClassManage');

var fs = require('fs');
var uuid = require('uuid');
var childExec = require('child_process').exec;
const {
    format
} = require('morgan');
var moment = require('moment-timezone');
const {relativeTimeThreshold} = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");
var isLoggedIn = true;
const audioTenPrefix = "D:/producedAudio/audioTen/";

//ffmpeg -y -i 20200810_081135_d.wav -i 20200810_081135_d.wav -filter_complex '[0:0][1:0]concat=n=2:v=0:a=1[out]' -map '[out]' output555.wav
//ffmpeg -y -i 20200810_081135_d.wav  -ss 10 -to 20 -c copy "output003.wav"
// filePath為絕對路徑
function getWavformDat(inputFilePath, outputFilePath) {
    return new Promise(function (resolve, reject) {
        var waveformExec = require('child_process').exec,
            child;
        //audiowaveform -i sample.mp3 -o sample.dat -b 8
        var waveformCommand = 'audiowaveform -i ' + inputFilePath + ' -o ' + outputFilePath + ' -b 8';
        child = waveformExec(waveformCommand, function (error, stdout, stderr) {
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            if (error !== null) {
                // console.log('waveformExec error: ' + error);
            }
            resolve(0);
        });
    });
}

// inputFilePath outputFilePath 均為絕對路徑
function cut(inputFilePath, startTime, endTime, outputFilePath) {
    return new Promise(function (resolve, reject) {
        var cutExec = require('child_process').exec,
            child;
        //var cutCommand = 'ffmpeg.exe -y -i ' + filePath + ' -ss ' + startTime + ' -to ' + endTime + ' -c copy "./public/audioCut/' + fileName + '_processed.wav"';
        var cutCommand = "ffmpeg.exe -y -i " + inputFilePath;
        if (startTime) {
            cutCommand += (" -ss " + startTime);
        }
        if (endTime) {
            cutCommand += (" -to " + endTime);
        }
        cutCommand += " -c copy ";
        cutCommand += outputFilePath;
        child = cutExec(cutCommand, function (error, stdout, stderr) {
            //console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            if (error !== null) {
                // console.log('cutExec error: ' + error);
            }
            resolve(0);
        });
    });
}

function checkifconcat(auidoList, starttime, endtime) {
    return new Promise(function (resolve, reject) {
        var flag = true;
        if (auidoList[auidoList.length - 1].endtime < endtime) {
            flag = false;
        }
        if (auidoList[0].starttime > starttime) {
            flag = false;
        }
        for (var i = 0; i < auidoList.length - 1; i++) {
            if (auidoList[i + 1].starttime - auidoList[i].endtime > 2000) {
                flag = false;
            }
        }
        resolve(flag)
    });
}

function getNewEvent(EventB, req) {
    return new Promise(function (resolve, reject) {
        var newevent = new EventB();
        newevent.tagDate = req.body["dateTime"];
        newevent.hard = req.body["bithStatus"];
        newevent.cowLabels = req.body["cowNo"];
        newevent.cowNumbers = req.body["bornNum"];
        newevent.dailyRecord = req.body["comment"];
        newevent.tagPointTime = req.body["tagPointTime"];
        resolve(newevent);
    });
}

function getFilePath(req) {
    return new Promise(function (resolve, reject) {
        var filePath = req.body["filePath"];
        resolve(filePath);
    });
}

function getTagPointTime(req) {
    return new Promise(function (resolve, reject) {
        var tagPointTime = req.body["tagPointTime"];
        resolve(tagPointTime);
    });
}

function removeDumpFile(loginId, filePath) {
    var fileName = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length - 4);
    var indexOfCow = filePath.indexOf("cow-mic");
    if (indexOfCow != -1) {
        fileName += "_" + filePath[indexOfCow + "cow-mic".length];
    }

    try {
        fs.unlinkSync('D:/producedAudio/tmp/' + loginId + '/waveform_' + fileName + '.dat',);
    } catch (e) {
    }
    ;
    try {
        fs.unlinkSync('D:/producedAudio/tmp/' + loginId + '/cutTmp_' + fileName + '.wav',);
    } catch (e) {
    }
    ;
    try {
        fs.unlinkSync('D:/producedAudio/tmp/' + loginId + '/cutTmpTmp_' + fileName + '.wav',);
    } catch (e) {
    }
    ;
    try {
        fs.unlinkSync('D:/producedAudio/tmp/' + loginId + '/' + fileName + '.lock',);
    } catch (e) {
    }
    ;

}

function getFullFilePath(filePath) {
    var producedAudioPath = "D:/producedAudio";
    var audioRawPath = "D:/test/wave";
    if (filePath[1] === "c") { //cow-mic1 or cow-mic2
        filePath = audioRawPath + filePath;
    } else //audioTen or tmp
    {
        filePath = producedAudioPath + filePath;
    }
    return filePath;
}

function getHalfFilePath(fullFilePath) {
    var fileName = fullFilePath;
    var producedAudioPathLen = "D:/producedAudio".length;
    var audioRawPathLen = "D:/test/wave".length;
    if (fileName.split('/')[1] === "producedAudio") { //from audioTen or tmp
        fileName = fileName.substring(producedAudioPathLen);
    } else { //from audioRaw
        fileName = fileName.substring(audioRawPathLen)
    }
    return fileName;
}

function getTmpFilePath(loginID, filePath, tmpNamePrefix, fileType) {
    var fileName = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length - 4);
    // 處理兩支麥克風因檔名可能相同問題
    var indexOfCow = filePath.indexOf("cow-mic");
    if (indexOfCow != -1) {
        fileName += "_" + filePath[indexOfCow + "cow-mic".length];
    }

    if (fileName.substring(0, "cutTmpTmp_".length) === "cutTmpTmp_") {
        fileName = fileName.substring("cutTmpTmp_".length);
    } else if (fileName.substring(0, "cutTmp_".length) === "cutTmp_") {
        fileName = fileName.substring("cutTmp_".length);
    }

    return "D:/producedAudio/tmp/" + loginID + "/" + tmpNamePrefix + fileName + fileType;
}

function makeAudioTenDir() {
    return new Promise(function (resolve, reject) {
        fs.exists('D:/producedAudio/audioTen', function (exists) {
            if (!exists) {
                fs.mkdir('D:/producedAudio/audioTen', function (err) {
                    if (err) {
                        // console.log(err)
                    }
                    resolve(0);
                });
            } else {
                resolve(0);
            }
        });

    });
}

function makeTmpDir() {
    return new Promise(function (resolve, reject) {
        fs.exists('D:/producedAudio/tmp', function (exists) {
            if (!exists) {
                fs.mkdir('D:/producedAudio/tmp', function (err) {
                    if (err) {
                        // console.log(err);
                    }
                    resolve(0);
                });
            } else {
                resolve(0);
            }
        });

    });
}

function makeCompleteDir() {
    return new Promise(function (resolve, reject) {
        fs.exists("D:/producedAudio", function (exists) {
            if (!exists) {
                fs.mkdir('D:/producedAudio', function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        fs.mkdir('D:/producedAudio/audioTen', function (err) {
                            if (err) {
                                console.error(err);
                            } else {
                                fs.mkdir('D:/producedAudio/tmp', function (err) {
                                    if (err) {
                                        console.error(err);
                                    }
                                    resolve(0);
                                });
                            }
                        });
                    }
                });
            } // end of not exist producedAudio
            else {
                makeAudioTenDir().then(() => {
                    makeTmpDir().then(() => {
                        resolve(0);
                    })
                });
            }
        });
    });
}

function makeUserDir(loginId) {
    return new Promise(function (resolve, reject) {
        fs.exists('D:/producedAudio/tmp/' + loginId, function (exists) {
            if (!exists) {
                fs.mkdir('D:/producedAudio/tmp/' + loginId, function (err) {
                    if (err) {
                        // console.log(err);
                    }
                    resolve(0);
                });
            } else {
                resolve(0);
            }
        });

    });
}

// 尋找時間點的前/後一共2小時範圍的關聯音檔
function findAudio3(tagTime, res, lr) {
    return new Promise(function (resolve, reject) {
        // var starttime = new Date(tagTime.getTime()-5*60*1000);
        // var endtime = new Date(tagTime.getTime()+5*60*1000);
        var starttime;
        var endtime;
        if (lr == 'l') {
            starttime = new Date(tagTime.getTime() - 1 * 60 * 60 * 1000 - 55 * 60 * 1000);
            endtime = new Date(tagTime.getTime() + 5 * 60 * 1000);
        } else if (lr == 'r') {
            starttime = new Date(tagTime.getTime() - 5 * 60 * 1000);
            endtime = new Date(tagTime.getTime() + 1 * 60 * 60 * 1000 + 55 * 60 * 1000);
        }

        AudioRaw.find({
                $or: [{
                    $and: [{
                        starttime: {
                            $lte: starttime
                        }
                    }, {
                        endtime: {
                            $gte: starttime
                        }
                    }]
                }, {
                    $and: [{
                        starttime: {
                            $lte: endtime
                        }
                    }, {
                        endtime: {
                            $gte: endtime
                        }
                    }]
                }, {
                    $and: [{
                        starttime: {
                            $gte: starttime
                        }
                    }, {
                        endtime: {
                            $lte: endtime
                        }
                    }]
                }]
            }, {}, {
                sort: {
                    "microid": 1,
                    "starttime": 1
                }
            },
            function (err, audios) {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        result: -1,
                        message: err
                    });
                    return;
                }
                resolve({
                    audios: audios,
                    starttime: starttime,
                    endtime: endtime,
                });
            });
    });
}

function findAudio(tagTime, res) {
    return new Promise(function (resolve, reject) {
        var starttime = new Date(tagTime.getTime() - 5 * 60 * 1000);
        var endtime = new Date(tagTime.getTime() + 5 * 60 * 1000);
        AudioRaw.find({
                $or: [{
                    $and: [{
                        starttime: {
                            $lte: starttime
                        }
                    }, {
                        endtime: {
                            $gte: starttime
                        }
                    }]
                }, {
                    $and: [{
                        starttime: {
                            $lte: endtime
                        }
                    }, {
                        endtime: {
                            $gte: endtime
                        }
                    }]
                }, {
                    $and: [{
                        starttime: {
                            $gte: starttime
                        }
                    }, {
                        endtime: {
                            $lte: endtime
                        }
                    }]
                }]
            }, {}, {
                sort: {
                    "microid": 1,
                    "starttime": 1
                }
            },
            function (err, audios) {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        result: -1,
                        message: err
                    });
                    return;
                }
                resolve({
                    audios: audios,
                    starttime: starttime,
                    endtime: endtime,
                });
                return;
            });
    });
}

function getAdjustTenMinAudio(fileNameList, startTime, endTime, filePath, loginID) {
    return new Promise(function (resolve, reject) {
        makeCompleteDir().then(() => {
            makeUserDir(loginID).then(() => {

                var outputFileName = "cutTmp_"
                filePath = getFullFilePath(filePath);
                var cutOutputFileName = getTmpFilePath(loginID, filePath, outputFileName, ".wav");
                var waveformOutputFileName = getTmpFilePath(loginID, cutOutputFileName, "waveform_", ".dat");
                var cutFilePath = getHalfFilePath(cutOutputFileName);
                var waveformPath = getHalfFilePath(waveformOutputFileName);

                var mark = uuid.v4();
                //concate
                var arrLen = fileNameList.length;
                var commandArray = ['-y'];
                var filter = "";
                for (var i = 0; i < arrLen; ++i) {
                    filter += ("[" + i.toString() + ":0]");
                }
                filter += ("concat=n=" + arrLen.toString() + ":v=0:a=1[out]");
                for (var i = 0; i < arrLen; ++i) {
                    commandArray.push('-i');
                    commandArray.push(fileNameList[i]);
                }
                commandArray.push('-filter_complex', filter, '-map', '[out]', "D:/producedAudio/tmp/output_" + mark + ".wav");

                var cutCommand = 'ffmpeg.exe -y -i D:/producedAudio/tmp/output_' + mark + '.wav  -ss ' + startTime + ' -to ' + endTime + ' -c copy ' + cutOutputFileName;

                // /*ffmpeg.exe -y -i 20200810_080808_a.wav -i 20200810_081135_a.wav -i 20200810_081450_a.wav -filter_complex '[0:0][1:0][2:0]concat=n=3:v=0:a=1[out]' -map '[out]' output5566.wav */
                var concateExec = require('child_process').execFile,
                    child;
                child = concateExec('ffmpeg.exe', commandArray, function (error, stdout, stderr) {
                    // console.log('stdout: ' + stdout);
                    // console.log('stderr: ' + stderr);
                    if (error !== null) {
                        // console.log('concateExec error: ' + error);
                    }
                    var cutExec = require('child_process').exec,
                        cutChild;
                    cutChild = cutExec(cutCommand, function (error, stdout, stderr) {
                        // console.log('stdout: ' + stdout);
                        // console.log('stderr: ' + stderr);
                        if (error !== null) {
                            // console.log('cutExec error: ' + error);
                        }
                        fs.unlink('D:/producedAudio/tmp/output_' + mark + '.wav', () => {
                        });
                        var a = cutOutputFileName.split('_');
                        a = a[0] + "Tmp_" + a[1];
                        fs.unlink(a, () => {
                        });

                        resolve({
                            cutOutputFileName: cutOutputFileName,
                            waveformOutputFileName: waveformOutputFileName,
                            filePathNew: cutFilePath,
                            waveformPath: waveformPath,
                            // startTimeNew: startTime
                        })

                    });
                });
            })
        })
    });
}

function getStartEndAudioInfo(starttime, endtime, res) {
    return new Promise(function (resolve, reject) {
        AudioRaw.find({
                $or: [{
                    $and: [{
                        starttime: {
                            $lte: starttime
                        }
                    }, {
                        endtime: {
                            $gte: starttime
                        }
                    }]
                }, {
                    $and: [{
                        starttime: {
                            $lte: endtime
                        }
                    }, {
                        endtime: {
                            $gte: endtime
                        }
                    }]
                }, {
                    $and: [{
                        starttime: {
                            $gte: starttime
                        }
                    }, {
                        endtime: {
                            $lte: endtime
                        }
                    }]
                }]
            }, {}, {
                sort: {
                    "microid": 1,
                    "starttime": 1
                }
            },
            function (err, audios) {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        result: -1,
                        message: err
                    });
                    return;
                }
                if (audios.length == 0) {
                    res.status(500).json({
                        result: -1,
                        message: "錯誤!: 找不到原始音檔資訊"
                    });
                } else {
                    var audioStart = audios[0];
                    var audioEnd = audios[audios.length - 1];
                    resolve({
                        audioStart: audioStart,
                        audioEnd: audioEnd,
                    });
                }
            });
    });
}

function parseStartEndAudioInfo(starttime, endtime, audioStart, audioEnd) {
    return new Promise(function (resolve, reject) {
        var audioStartTime = (new Date(starttime) - audioStart.starttime) / 1000;
        var audioEndTime = (new Date(endtime) - audioEnd.starttime) / 1000;
        resolve({
            audioStart: audioStart.audioname + "_" + audioStartTime.toString(),
            audioEnd: audioEnd.audioname + "_" + audioEndTime.toString(),
        });
    });
}

/* GET audio list page. */
router.get('/', function (req, res, next) {

    res.render('audio/index', {
        title: 'Web Audio Editor',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        active: '/audio',
        permissions: req.session.permissions,
        role: req.session.role,
    });
});

router.get('/edit', function (req, res, next) {
    var fileName = req.query.fileName;

    // get effective fileath
    var producedAudioPathLen = "D:/producedAudio".length;
    var audioRawPathLen = "D:/test/wave".length;
    if (fileName.split('/')[1] === "producedAudio") { //from audioTen or tmp
        fileName = fileName.substring(producedAudioPathLen);
    } else { //from audioRaw
        fileName = fileName.substring(audioRawPathLen)
    }
    // console.log(fileName);
    var microstring = fileName.split('/')[1];
    var micronum = microstring.split('c')[2];
    var micro = "";
    if (micronum === "1") {
        micro = "a";
    } else if (micronum === "2") {
        micro = "b";
    } else {
        micro = "c";
    }

    if (req.query._id != undefined && req.query._id != 'undefined') {
        if (req.query.active == '/pro') { // from eventB
            EventB.findById({
                _id: req.query._id
            }, function (err, event) {
                if (event.sourceId.length > 25) {
                    AudioRaw.findOne({filePath: event.sourceId}, function (err, audio) {
                        if (!fs.existsSync('D:/producedAudio/tmp/' + req.session.loginID + '/' + req.query._id + '.lock')) {
                            fs.writeFile('D:/producedAudio/tmp/' + req.session.loginID + '/' + req.query._id + '.lock', Date.now().toString(), () => {
                            });
                            res.render('audio/editor', {
                                title: 'Audio Editor',
                                loginID: req.session.loginID,
                                temperature: event.temperature,
                                humidity: event.humidity,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                fileName: fileName,
                                event: event,
                                active: req.query.active,
                                permissions: req.session.permissions,
                                role: req.session.role,
                                microId: event.microId,
                                zeroDate: event.zeroDate,
                                tenDate: event.tenDate,
                                source: audio,
                                sourceId: event.id,
                                type: "audio",
                            });
                        } else {
                            res.render('pro/index', {
                                title: '可視化操作介面',
                                loginID: req.session.loginID,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                active: '/pro',
                                permissions: req.session.permissions,
                                role: req.session.role,
                                errorMessage: '已有其他視窗開啟此事件'
                            });
                        }
                    });

                } else {
                    EventA.findById({_id: event.sourceId}, function (err, eventA) {
                        if (!fs.existsSync('D:/producedAudio/tmp/' + req.session.loginID + '/' + req.query._id + '.lock')) {
                            fs.writeFile('D:/producedAudio/tmp/' + req.session.loginID + '/' + req.query._id + '.lock', Date.now().toString(), () => {
                            });
                            res.render('audio/editor', {
                                title: 'Audio Editor',
                                loginID: req.session.loginID,
                                temperature: event.temperature,
                                humidity: event.humidity,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                fileName: fileName,
                                event: event,
                                active: req.query.active,
                                permissions: req.session.permissions,
                                role: req.session.role,
                                microId: event.microId,
                                zeroDate: event.zeroDate,
                                tenDate: event.tenDate,
                                source: eventA,
                                sourceId: event.id,
                                type: "event"
                            });
                        } else {
                            res.render('pro/index', {
                                title: '可視化操作介面',
                                loginID: req.session.loginID,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                active: '/pro',
                                permissions: req.session.permissions,
                                role: req.session.role,
                                errorMessage: '已有其他視窗開啟此事件'
                            });
                        }
                    });
                }
            });

        } else if (req.query.active == '/farm') { // from eventA
            EventA.findById({
                _id: req.query._id
            }, function (err, event) {
                var filetime = event.starttime;
                /// TODO: change this after they fix their humidity python program to correct timezone
                filetime.setHours(filetime.getHours() - 8);
                var microId = ((req.query.fileName).split('_')[1]).split('.')[0];

                if (microId === "a") {
                    htA.findOne({create_at: {"$lte": filetime}}, null, {sort: {create_at: -1}}, function (err, audiotime) {
                        // console.log("!!!!日期456!!!!" + audiotime);
                        // console.log("!!!!日期123!!!!" + filetime);
                        // console.log("!!!!溫度快出來!!!!" + audiotime.temperature);
                        if (audiotime != null) {
                            res.render('audio/editor', {
                                title: 'Audio Editor',
                                temperature: audiotime.temperature,
                                humidity: audiotime.humidity,
                                loginID: req.session.loginID,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                fileName: fileName,
                                event: event,
                                active: req.query.active,
                                permissions: req.session.permissions,
                                role: req.session.role,
                                microId: microId,
                                zeroDate: event.starttime,
                                tenDate: event.endtime,
                                sourceId: req.query._id,
                            });
                        } else {
                            res.render('audio/editor', {
                                title: 'Audio Editor',
                                temperature: "沒有溫度資料",
                                humidity: "沒有溫度資料",
                                loginID: req.session.loginID,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                fileName: fileName,
                                event: event,
                                active: req.query.active,
                                permissions: req.session.permissions,
                                role: req.session.role,
                                microId: microId,
                                zeroDate: event.starttime,
                                tenDate: event.endtime,
                                sourceId: req.query._id,
                            });
                        }
                    });
                } else {
                    htB.findOne({create_at: {"$lte": filetime}}, function (err, audiotime) {
                        // console.log("!!!!日期456!!!!" + audiotime);
                        if (audiotime != null) {
                            res.render('audio/editor', {
                                title: 'Audio Editor',
                                temperature: audiotime.temperature,
                                humidity: audiotime.humidity,
                                loginID: req.session.loginID,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                fileName: fileName,
                                event: event,
                                active: req.query.active,
                                permissions: req.session.permissions,
                                role: req.session.role,
                                microId: microId,
                                zeroDate: event.starttime,
                                tenDate: event.endtime,
                                sourceId: req.query._id,
                            });
                        } else {
                            res.render('audio/editor', {
                                title: 'Audio Editor',
                                temperature: "沒有溫度資料",
                                humidity: "沒有溫度資料",
                                loginID: req.session.loginID,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                fileName: fileName,
                                event: event,
                                active: req.query.active,
                                permissions: req.session.permissions,
                                role: req.session.role,
                                microId: microId,
                                zeroDate: event.starttime,
                                tenDate: event.endtime,
                                sourceId: req.query._id,
                            });
                        }
                    });
                }
            });

        }

    } else { // from audioRaw
        AudioRaw.findOne({'audioname': req.query.fileName.split('/')[5], 'microid': micro}, function (err, audio) {
            // console.log("出來喔!! " + req.query.fileName.split('/')[5]);
            // console.log("音檔!! " + audio);
            var filetime = audio.starttime;

            if (audio.microid === "a") {
                htA.findOne({create_at: {"$lte": filetime}}, function (err, audiotime) {
                    if (audiotime == null) {
                        res.render('audio/editor', {
                            title: 'Audio Editor',
                            temperature: NaN,
                            humidity: NaN,
                            loginID: req.session.loginID,
                            userName: req.session.userName,
                            isLoggedIn: isLoggedIn,
                            fileName: fileName,
                            active: req.query.active,
                            permissions: req.session.permissions,
                            role: req.session.role,
                            microId: audio.microid,
                            zeroDate: audio.starttime,
                            tenDate: audio.endtime,
                            sourceId: audio.filePath,
                            source: audio,
                        });
                    } else {
                        res.render('audio/editor', {
                            title: 'Audio Editor',
                            temperature: audiotime.temperature,
                            humidity: audiotime.humidity,
                            loginID: req.session.loginID,
                            userName: req.session.userName,
                            isLoggedIn: isLoggedIn,
                            fileName: fileName,
                            active: req.query.active,
                            permissions: req.session.permissions,
                            role: req.session.role,
                            microId: audio.microid,
                            zeroDate: audio.starttime,
                            tenDate: audio.endtime,
                            sourceId: audio.filePath,
                            source: audio,
                        });
                    }
                });
            } else if (audio.microid === "b") {
                htB.findOne({create_at: {"$lte": filetime}}, function (err, audiotime) {
                    if (audiotime == null) {
                        res.render('audio/editor', {
                            title: 'Audio Editor',
                            temperature: NaN,
                            humidity: NaN,
                            loginID: req.session.loginID,
                            userName: req.session.userName,
                            isLoggedIn: isLoggedIn,
                            fileName: fileName,
                            active: req.query.active,
                            permissions: req.session.permissions,
                            role: req.session.role,
                            microId: audio.microid,
                            zeroDate: audio.starttime,
                            tenDate: audio.endtime,
                            sourceId: audio.filePath,
                            source: audio,
                        });
                    } else {
                        res.render('audio/editor', {
                            title: 'Audio Editor',
                            temperature: audiotime.temperature,
                            humidity: audiotime.humidity,
                            loginID: req.session.loginID,
                            userName: req.session.userName,
                            isLoggedIn: isLoggedIn,
                            fileName: fileName,
                            active: req.query.active,
                            permissions: req.session.permissions,
                            role: req.session.role,
                            microId: audio.microid,
                            zeroDate: audio.starttime,
                            tenDate: audio.endtime,
                            sourceId: audio.filePath,
                            source: audio
                        });
                    }

                });
            } else if (audio.microid === "c") {
                res.render('audio/editor', {
                    title: 'Audio Editor',
                    temperature: NaN,
                    humidity: NaN,
                    loginID: req.session.loginID,
                    userName: req.session.userName,
                    isLoggedIn: isLoggedIn,
                    fileName: fileName,
                    active: req.query.active,
                    permissions: req.session.permissions,
                    role: req.session.role,
                    microId: audio.microid,
                    zeroDate: audio.starttime,
                    tenDate: audio.endtime,
                    sourceId: audio.filePath,
                    source: audio,
                });

            }
        });


        // res.render('audio/editor', {
        //     title: 'Audio Editor',
        //     loginID: req.session.loginID,
        //     userName: req.session.userName,
        //     isLoggedIn: isLoggedIn,
        //     fileName: fileName,
        //     active: req.query.active,
        //     permissions: req.session.permissions,
        //     role: req.session.role,
        // });
    }
});

router.get('/view', function (req, res, next) {
    var fileName = req.query.fileName;


    // get effective fileath
    var producedAudioPathLen = "D:/producedAudio".length;
    var audioRawPathLen = "D:/test/wave".length;
    if (fileName.split('/')[1] === "producedAudio") { //from audioTen or tmp
        fileName = fileName.substring(producedAudioPathLen);
    } else { //from audioRaw
        fileName = fileName.substring(audioRawPathLen)
    }
    // console.log(fileName);
    if (req.query._id != undefined && req.query._id != 'undefined') {
        if (req.query.active == '/pro') { // from eventB
            EventB.findById({
                _id: req.query._id
            }, function (err, event) {
                if (event.sourceId.length > 25) {
                    AudioRaw.findOne({filePath: event.sourceId}, function (err, audio) {
                        if (!fs.existsSync('D:/producedAudio/tmp/' + req.session.loginID + '/' + req.query._id + '.lock')) {
                            fs.writeFile('D:/producedAudio/tmp/' + req.session.loginID + '/' + req.query._id + '.lock', Date.now().toString(), () => {
                            });
                            res.render('audio/view', {
                                title: 'Audio Editor',
                                loginID: req.session.loginID,
                                temperature: event.temperature,
                                humidity: event.humidity,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                fileName: fileName,
                                event: event,
                                active: req.query.active,
                                permissions: req.session.permissions,
                                role: req.session.role,
                                microId: event.microId,
                                zeroDate: event.zeroDate,
                                tenDate: event.tenDate,
                                source: audio,
                                sourceId: event.id,
                                type: "audio"
                            });
                        } else {
                            res.render('pro/index', {
                                title: '可視化操作介面',
                                loginID: req.session.loginID,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                active: '/pro',
                                permissions: req.session.permissions,
                                role: req.session.role,
                                errorMessage: '已有其他視窗開啟此事件'
                            });
                        }
                    });

                } else {
                    EventA.findById({_id: event.sourceId}, function (err, eventA) {
                        if (!fs.existsSync('D:/producedAudio/tmp/' + req.session.loginID + '/' + req.query._id + '.lock')) {
                            fs.writeFile('D:/producedAudio/tmp/' + req.session.loginID + '/' + req.query._id + '.lock', Date.now().toString(), () => {
                            });
                            res.render('audio/view', {
                                title: 'Audio Editor',
                                loginID: req.session.loginID,
                                temperature: event.temperature,
                                humidity: event.humidity,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                fileName: fileName,
                                event: event,
                                active: req.query.active,
                                permissions: req.session.permissions,
                                role: req.session.role,
                                microId: event.microId,
                                zeroDate: event.zeroDate,
                                tenDate: event.tenDate,
                                source: eventA,
                                sourceId: event.id,
                                type: "event"
                            });
                        } else {
                            res.render('pro/index', {
                                title: '可視化操作介面',
                                loginID: req.session.loginID,
                                userName: req.session.userName,
                                isLoggedIn: isLoggedIn,
                                active: '/pro',
                                permissions: req.session.permissions,
                                role: req.session.role,
                                errorMessage: '已有其他視窗開啟此事件'
                            });
                        }
                    });
                }
            });
            // EventB.findById({
            //     _id: req.query._id
            // }, function (err, event) {
            //     if (!fs.existsSync('D:/producedAudio/tmp/' + req.session.loginID + '/' + req.query._id + '.lock')) {
            //         fs.writeFile('D:/producedAudio/tmp/' + req.session.loginID + '/' + req.query._id + '.lock', Date.now(), () => {
            //         });
            //         res.render('audio/view', {
            //             title: 'Audio Editor',
            //             loginID: req.session.loginID,
            //             temperature: event.temperature,
            //             humidity: event.humidity,
            //             userName: req.session.userName,
            //             isLoggedIn: isLoggedIn,
            //             fileName: fileName,
            //             event: event,
            //             active: req.query.active,
            //             permissions: req.session.permissions,
            //             role: req.session.role,
            //             microId: event.microId,
            //             zeroDate: event.zeroDate,
            //             tenDate: event.tenDate,
            //             tenDate: event.sourceId,
            //         });
            //     } else {
            //         res.render('pro/index', {
            //             title: '可視化操作介面',
            //             loginID: req.session.loginID,
            //             userName: req.session.userName,
            //             isLoggedIn: isLoggedIn,
            //             active: '/pro',
            //             permissions: req.session.permissions,
            //             role: req.session.role,
            //             errorMessage: '已有其他視窗開啟此事件'
            //         });
            //     }
            // });
        }
    }
});

router.post('/createEventB', function (req, res) {
    makeCompleteDir().then(() => {
        makeUserDir(req.body["loginID"]).then(() => {
            getStartEndAudioInfo(req.body['zeroDate'], req.body['tenDate'], res).then((data) => {
                parseStartEndAudioInfo(req.body['zeroDate'], req.body['tenDate'], data.audioStart, data.audioEnd).then((data) => {
                    var loginId = req.body["loginID"];
                    var inputFilePath = getFullFilePath(req.body["filePath"]);
                    var newevent = new EventB();
                    var outputFilePaht = "D:/producedAudio/audioTen/" + newevent.id + ".wav";
                    newevent.tagDate = req.body["tagDate"];
                    newevent.cowLabels = req.body["cowLabels"];
                    newevent.cowNumbers = req.body["cowNumbers"];
                    newevent.dailyRecord = req.body["dailyRecord"];
                    newevent.startPointTime = req.body["startPointTime"];
                    newevent.endPointTime = req.body["endPointTime"];
                    newevent.tagPointTime = req.body["tagPointTime"];
                    newevent.hard = req.body["hard"];
                    newevent.filePath = outputFilePaht;
                    newevent.fileName = newevent.id + ".wav";
                    newevent.createdTime = new Date();
                    newevent.lastModifiedTime = new Date();
                    newevent.createdAuthor = req.body["createdAuthor"];
                    newevent.lastModifiedAuthor = req.body["createdAuthor"];
                    newevent.microId = req.body['microId'];
                    newevent.temperature = req.body['temperature'];
                    newevent.humidity = req.body['humidity'];
                    newevent.zeroDate = new Date(req.body['zeroDate']);
                    newevent.tenDate = new Date(req.body['tenDate']);
                    newevent.audioStart = data.audioStart;
                    newevent.audioEnd = data.audioEnd;
                    newevent.sourceId = req.body["sourceId"];

                    // console.log("快點出來~~~" + newevent.temperature);

                    if (inputFilePath != outputFilePaht) {
                        cut(inputFilePath, "", "", outputFilePaht).then(() => {
                            removeDumpFile(req.body["loginID"], req.body["initFilePath"]);
                        });
                    }
                    // Add event
                    newevent.save(function (err) {
                        if (err) {
                            console.error(err);
                            res.status(500).json({
                                result: -1,
                                message: err
                            });
                            return;
                        }

                        res.redirect('/pro')
                    });
                });
            });
        })
    });
});

function getAudio(fileNameList, startTime, endTime, timeStamp, eventid) {
    makeCompleteDir().then(() => {
        var mark = uuid.v4();
        //concate
        var arrLen = fileNameList.length;
        var outputFileName = "D:/producedAudio/audioTen/";
        outputFileName += (eventid + ".wav");
        var commandArray = ['-y'];
        var filter = "";
        for (var i = 0; i < arrLen; ++i) {
            filter += ("[" + i.toString() + ":0]");
        }
        filter += ("concat=n=" + arrLen.toString() + ":v=0:a=1[out]");
        for (var i = 0; i < arrLen; ++i) {
            commandArray.push('-i');
            commandArray.push(fileNameList[i]);
        }
        commandArray.push('-filter_complex', filter, '-map', '[out]', "D:/producedAudio/tmp/output_" + mark + ".wav");

        var cutCommand = 'ffmpeg.exe -y -i D:/producedAudio/tmp/output_' + mark + '.wav  -ss ' + startTime + ' -to ' + endTime + ' -c copy ' + outputFileName;

        // /*ffmpeg.exe -y -i 20200810_080808_a.wav -i 20200810_081135_a.wav -i 20200810_081450_a.wav -filter_complex '[0:0][1:0][2:0]concat=n=3:v=0:a=1[out]' -map '[out]' output5566.wav */
        var concateExec = require('child_process').execFile,
            child;
        child = concateExec('ffmpeg.exe', commandArray, function (error, stdout, stderr) {
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            if (error !== null) {
                // console.log('concateExec error: ' + error);
            }
            var cutExec = require('child_process').exec,
                cutChild;
            cutChild = cutExec(cutCommand, function (error, stdout, stderr) {
                // console.log('stdout: ' + stdout);
                // console.log('stderr: ' + stderr);
                if (error !== null) {
                    // console.log('cutExec error: ' + error);
                }
                fs.unlink('D:/producedAudio/tmp/output_' + mark + '.wav', () => {
                });
            });
        });
    })
}

// update eventB
router.post('/updateEventB', function (req, res) {

    EventB.findById(req.body.id, function (err, eventB) {
        if (eventB.hard !== req.body.hard) {
            var neweventstarttime = req.body.tagDate;
            var neweventendtime;
            if (req.body.hard === "自然分娩") {
                neweventstarttime = moment(req.body.tagDate).subtract(60, 'minutes');
                neweventendtime = moment(req.body.tagDate);
                console.log("自然分娩");
            } else {
                neweventstarttime = moment(req.body.tagDate).subtract(30, 'minutes');
                neweventendtime = moment(req.body.tagDate);
                console.log("其他分娩");
            }
            var map = new Map();
            console.log("尋找原始音檔");
            AudioRaw.find({
                    $or: [{
                        $and: [{
                            starttime: {
                                $lte: neweventstarttime
                            }
                        }, {
                            endtime: {
                                $gte: neweventstarttime
                            }
                        }]
                    }, {
                        $and: [{
                            starttime: {
                                $lte: neweventendtime
                            }
                        }, {
                            endtime: {
                                $gte: neweventendtime
                            }
                        }]
                    }, {
                        $and: [{
                            starttime: {
                                $gte: neweventstarttime
                            }
                        }, {
                            endtime: {
                                $lte: neweventendtime
                            }
                        }]
                    }],
                    microid: eventB.microId
                }, {}, {
                    sort: {
                        "microid": 1,
                        "starttime": 1
                    }
                },
                function (err, audios) {
                    if (err) {
                        console.error(err);
                        res.status(500).json({
                            result: -1,
                            message: err
                        });
                        return;
                    }

                    // Add audio info into eventDB
                    console.log(audios);
                    var audioarray = [];
                    for (audio of audios) {
                        macroid = audio.microid;
                        var singleaudio = {
                            "audioname": audio.audioname,
                            "starttime": audio.starttime,
                            "endtime": audio.endtime,
                            "filePath": audio.filePath,
                            "duration": audio.duration,
                        }
                        if (!map.has(macroid)) {
                            audioarray = [];
                            audioarray.push(singleaudio);
                            map.set(audio.microid, audioarray)
                        } else {
                            audioarray.push(singleaudio);
                            map.set(audio.microid, audioarray);
                        }
                    }

                    if (map.size == 0) {
                        getStartEndAudioInfo(req.body['zeroDate'], req.body['tenDate']).then((data) => {
                            parseStartEndAudioInfo(req.body['zeroDate'], req.body['tenDate'], data.audioStart, data.audioEnd).then((data) => {
                                var inputFileName = getFullFilePath(req.body.filePath);
                                var outputFileName = 'D:/producedAudio/audioTen/' + req.body.id + ".wav";
                                var cutExec = require('child_process').exec;
                                var cutCommand = "ffmpeg.exe -y -i " + inputFileName + " -c copy " + outputFileName;
                                // 逃避未剪檔導致輸入等於輸出之問題 感謝無名氏提供<3
                                if (inputFileName === outputFileName) {
                                    cutCommand = "dir";
                                }
                                cutExec(cutCommand, function (error, stdout, stderr) {
                                    // console.log('stdout: ' + stdout); 必須被註解XD
                                    // console.log('stderr: ' + stderr);
                                    if (error !== null) {
                                        // console.log('cutExec error: ' + error);
                                        res.status(500).json({
                                            result: -1,
                                            //message: err
                                        });
                                        return;
                                    }
                                    EventB.findById(req.body.id, (err, event) => {
                                        let ID = req.body["loginID"];
                                        if (ID !== event.createdAuthor) {
                                            removeDumpFile(req.body["loginID"], req.body["initFilePath"]);
                                            res.redirect('/pro');
                                        } else {
                                            getFilePath(req).then((flag) => {
                                                getTagPointTime(req).then((flag) => {
                                                    removeDumpFile(req.body["loginID"], req.body["initFilePath"]);
                                                    EventB.findByIdAndUpdate(req.body.id, {
                                                        tagDate: req.body.tagDate,
                                                        hard: req.body.hard,
                                                        cowLabels: req.body.cowLabels,
                                                        cowNumbers: req.body.cowNumbers,
                                                        dailyRecord: req.body.dailyRecord,
                                                        tagPointTime: req.body.tagPointTime,
                                                        audioCat: req.body.hard,
                                                        temperature: req.body.temperature,
                                                        humidity: req.body.humidity,
                                                        lastModifiedAuthor: req.body.lastModifiedAuthor,
                                                        lastModifiedTime: new Date(),
                                                        zeroDate: req.body.zeroDate,
                                                        tenDate: req.body.tenDate,
                                                        audioStart: data.audioStart,
                                                        audioEnd: data.audioEnd,
                                                    }, function (err) {
                                                        if (err) {
                                                            console.error(err);
                                                            res.status(500).json({
                                                                result: -1,
                                                                message: err
                                                            });
                                                            return;
                                                        } else {
                                                            res.redirect('/pro');
                                                        }
                                                    });
                                                });
                                            });
                                        }
                                    })

                                });
                            });
                        });
                    }

                    map.forEach(function (value, key) {
                        var fileNameList = [];
                        checkifconcat(value, neweventstarttime, neweventendtime).then((flag) => {
                            if (flag == true) {
                                //接音檔
                                var totalduration = 0;
                                for (var i = 0; i < value.length; i++) {
                                    fileNameList.push(value[i].filePath);
                                    totalduration += parseInt(value[i].duration);
                                    // console.log("單一音檔的時間" + value[i].starttime-value[i].endtime)
                                }
                                // console.log("fileNameList= " + fileNameList);
                                var timeStamp = req.body.tagDate;
                                // console.log("第一個音檔的開始時間 " + value[0].starttime);
                                // console.log("timestamp的前五分鐘" + newevent.starttime);
                                var startTime = (neweventstarttime - value[0].starttime) / 1000;
                                // console.log("最後一個音檔的結束時間 " + value[value.length-1].endtime);
                                // console.log("timestamp的後五分鐘" + newevent.endtime);
                                var lastTime = (value[value.length - 1].endtime - neweventendtime) / 1000;
                                var endTime = totalduration - lastTime;
                                // console.log(lastTime)
                                // console.log(totalduration-startTime-lastTime)


                                // console.log("==========>  /event/A/create  開始  <==========")
                                // console.log("fileNameList : " + fileNameList);
                                // console.log("eventid : " + newevent.id);
                                // console.log("microid : " + key);
                                // console.log("startTime : " + startTime);
                                // console.log("endTime : " + endTime);
                                // console.log("timeStamp : " + timeStamp);
                                // console.log("==========>  /event/A/create  結束  <==========")

                                var outputFilePath = "D:/producedAudio/audioTen/" + eventB.id + ".wav";
                                fs.unlink(outputFilePath, () => {
                                });

                                getAudio(fileNameList, startTime, endTime, timeStamp, eventB.id)
                                getStartEndAudioInfo(neweventstarttime, neweventendtime, res).then((data) => {
                                    parseStartEndAudioInfo(neweventstarttime, neweventendtime, data.audioStart, data.audioEnd).then((data) => {
                                        EventB.findByIdAndUpdate(req.body.id, {
                                            tagDate: req.body.tagDate,
                                            hard: req.body.hard,
                                            cowLabels: req.body.cowLabels,
                                            cowNumbers: req.body.cowNumbers,
                                            dailyRecord: req.body.dailyRecord,
                                            tagPointTime: "",
                                            audioCat: req.body.hard,
                                            temperature: req.body.temperature,
                                            humidity: req.body.humidity,
                                            lastModifiedAuthor: req.body.lastModifiedAuthor,
                                            lastModifiedTime: new Date(),
                                            zeroDate: neweventstarttime,
                                            tenDate: neweventendtime,
                                            audioStart: data.audioStart,
                                            audioEnd: data.audioEnd,
                                            filePath: outputFilePath,
                                            fileName: eventB.id + ".wav",
                                        }, function (err) {
                                            if (err) {
                                                console.error(err);
                                                res.status(500).json({
                                                    result: -1,
                                                    message: err
                                                });
                                                return;
                                            } else {
                                                // console.log( req.body["initFilePath"]);
                                                removeDumpFile(req.body["loginID"], req.body["initFilePath"]);
                                                res.redirect('/pro');
                                            }
                                        });
                                    })
                                })
                            }
                        });
                    });
                }
            );
        } else {


            getStartEndAudioInfo(req.body['zeroDate'], req.body['tenDate']).then((data) => {
                parseStartEndAudioInfo(req.body['zeroDate'], req.body['tenDate'], data.audioStart, data.audioEnd).then((data) => {
                    var inputFileName = getFullFilePath(req.body.filePath);
                    var outputFileName = 'D:/producedAudio/audioTen/' + req.body.id + ".wav";
                    var cutExec = require('child_process').exec;
                    var cutCommand = "ffmpeg.exe -y -i " + inputFileName + " -c copy " + outputFileName;
                    // 逃避未剪檔導致輸入等於輸出之問題 感謝無名氏提供<3
                    if (inputFileName === outputFileName) {
                        cutCommand = "dir";
                    }
                    cutExec(cutCommand, function (error, stdout, stderr) {
                        // console.log('stdout: ' + stdout); 必須被註解XD
                        // console.log('stderr: ' + stderr);
                        if (error !== null) {
                            // console.log('cutExec error: ' + error);
                            res.status(500).json({
                                result: -1,
                                //message: err
                            });
                            return;
                        }
                        EventB.findById(req.body.id, (err, event) => {
                            let ID = req.body["loginID"];
                            if (ID !== event.createdAuthor) {
                                removeDumpFile(req.body["loginID"], req.body["initFilePath"]);
                                res.redirect('/pro');
                            } else {
                                getFilePath(req).then((flag) => {
                                    getTagPointTime(req).then((flag) => {
                                        removeDumpFile(req.body["loginID"], req.body["initFilePath"]);
                                        EventB.findByIdAndUpdate(req.body.id, {
                                            tagDate: req.body.tagDate,
                                            hard: req.body.hard,
                                            cowLabels: req.body.cowLabels,
                                            cowNumbers: req.body.cowNumbers,
                                            dailyRecord: req.body.dailyRecord,
                                            tagPointTime: req.body.tagPointTime,
                                            audioCat: req.body.hard,
                                            temperature: req.body.temperature,
                                            humidity: req.body.humidity,
                                            lastModifiedAuthor: req.body.lastModifiedAuthor,
                                            lastModifiedTime: new Date(),
                                            zeroDate: req.body.zeroDate,
                                            tenDate: req.body.tenDate,
                                            audioStart: data.audioStart,
                                            audioEnd: data.audioEnd,
                                        }, function (err) {
                                            if (err) {
                                                console.error(err);
                                                res.status(500).json({
                                                    result: -1,
                                                    message: err
                                                });
                                                return;
                                            } else {
                                                res.redirect('/pro');
                                            }
                                        });
                                    });
                                });
                            }
                        })

                    });
                });
            });
        }
    });

});

router.post('/listAudioRawAll', function (req, res) {
    // console.log(req.body.filepath, "===listAudioRawAll===");
    AudioRaw.find({ "filePath": { $regex: new RegExp(req.body.filepath, 'i') } }, function (err, audios) {
        res.send(audios);
    });
});

router.post('/audioClassManageSelect', function (req, res) {
    audioClassManage.find({}, function (err, rows) {
        res.status(201).json({
            result: 1,
            message: 'get audioClassManageSelect successfully',
            rows: rows,
        });
    });
});

router.post('/deleteAudioRaw', function (req, res) {
    AudioRaw.findByIdAndDelete(req.body.id, function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        } else {
            res.status(200).json({
                result: 1,
                message: '刪除原始音檔紀錄成功！'
            });
        }
    });
});

router.post('/cut', function (req, res) {
    makeCompleteDir().then(() => {
        makeUserDir(req.body["loginID"]).then(() => {
            var startTime = req.body["startPointTime"];
            var endTime = req.body["endPointTime"];
            var filePath = req.body["filePath"];
            var loginID = req.body["loginID"];
            var outputFileName = "cutTmp_"
            var checkTmp = filePath.split('/')[3];
            if (checkTmp) {
                if (checkTmp.substring(0, outputFileName.length) == outputFileName) {
                    outputFileName = "cutTmpTmp_";
                }
            }
            filePath = getFullFilePath(filePath);
            var cutOutputFileName = getTmpFilePath(loginID, filePath, outputFileName, ".wav");
            var waveformOutputFileName = getTmpFilePath(loginID, cutOutputFileName, "waveform_", ".dat");
            var cutFilePath = getHalfFilePath(cutOutputFileName);
            var waveformPath = getHalfFilePath(waveformOutputFileName);
            cut(filePath, startTime, endTime, cutOutputFileName).then(() => {
                getWavformDat(cutOutputFileName, waveformOutputFileName).then(() => {
                    res.status(201).json({
                        result: 1,
                        filePathNew: cutFilePath,
                        wavefromPath: waveformPath,
                        startTimeNew: startTime,
                        endTimeNew: endTime,
                        // startTimeNew: startTime
                    });
                });
            });
        })
    });
})

router.post('/waveform', function (req, res) {
    makeCompleteDir().then(() => {
        makeUserDir(req.body["loginID"]).then(() => {
            var filePath = getFullFilePath(req.body["filePath"]);
            var outputFilePath = getTmpFilePath(req.body["loginID"], filePath, "waveform_", ".dat");
            var waveformPath = getHalfFilePath(outputFilePath);
            getWavformDat(filePath, outputFilePath).then(() => {
                res.status(201).json({
                    result: 1,
                    wavefromPath: waveformPath,
                });
            });
        })
    });
});

router.post('/clearCurrentTmp', function (req, res) {
    var filePath = req.body["filePath"];
    var fileName = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length - 4);
    var checkTmp = filePath.split('/')[1];
    if (checkTmp) {
        if (checkTmp.substring(0, "cow-mic".length) === "cow-mic") {
            fileName += "_" + filePath.split('/')[1]["cow-mic".length];
        }
    }
    try {
        fs.unlinkSync('D:/producedAudio/tmp/' + req.session.loginID + '/waveform_' + fileName + '.dat',);
    } catch (e) {
    }
    ;
    try {
        fs.unlinkSync('D:/producedAudio/tmp/' + req.session.loginID + '/cutTmp_' + fileName + '.wav',);
    } catch (e) {
    }
    ;
    try {
        fs.unlinkSync('D:/producedAudi+ req.sessiono/tmp/'.loginID + '/cutTmpTmp_' + fileName + '.wav',);
    } catch (e) {
    }
    ;
    try {
        fs.unlinkSync('D:/producedAudio/tmp/' + req.session.loginID + '/' + fileName + '.lock');
    } catch (e) {
    }
    ;
    res.status(201).json({
        result: 1,
        message: 'successful'
    });
});

router.post('/loadLeft', function (req, res) {
    // findAudio(new Date(new Date(req.body['zeroDate']).getTime()-5*60*1000), res, 'l').then((datas)=>{
    findAudio3(new Date(new Date(req.body['zeroDate']).getTime() - 5 * 60 * 1000 - 1 * 1000), res, 'l').then((datas) => {
        var fileNameList = [];
        var fileNameListLastStarttime = "";
        var fileNameListFirstEndtime = "";
        var totaltime = 0;
        if (datas.audios.length != 0) {
            for (var i = datas.audios.length - 1; i > -1; i--) {
                // if(datas.audios[i].endtime < new Date(datas.endtime.getTime()-10*60*1000)){
                if (totaltime > 600) {
                    break;
                } else {
                    fileNameList.push(datas.audios[i].filePath);
                    totaltime += parseInt(datas.audios[i].duration);
                    fileNameListLastStarttime = datas.audios[i].starttime;
                }
            }
            fileNameListFirstEndtime = datas.audios[datas.audios.length - 1].endtime;
        }
        fileNameList.reverse();
        if (fileNameList.length != 0) {
            var starttime;
            var endtime;
            starttime = (totaltime * 1000 - (fileNameListFirstEndtime - datas.endtime) - 10 * 60 * 1000) / 1000;
            endtime = (totaltime * 1000 - (fileNameListFirstEndtime - datas.endtime)) / 1000;
            // starttime = fileNameListLastStarttime;
            // endtime = ;
            getAdjustTenMinAudio(fileNameList, starttime, endtime, req.body.filePath, req.body.loginID).then((datas1) => {
                // console.log(datas1);
                getWavformDat(datas1.cutOutputFileName, datas1.waveformOutputFileName).then(() => {
                    res.status(200).json({
                        result: 1,
                        filePathNew: datas1.filePathNew,
                        wavefromPath: datas1.waveformPath,
                        // startTimeNew: new Date(new Date(req.body['zeroDate']).getTime()+10*60*1000),
                        startTimeNew: new Date(fileNameListLastStarttime.getTime() + starttime * 1000),
                        endTimeNew: totaltime - endtime > 0 ? new Date(fileNameListFirstEndtime.getTime() - (totaltime - endtime) * 1000) : fileNameListFirstEndtime
                    });
                });
            });
        } else {
            res.status(201).json({
                result: -1,
                msg: "無法取得音檔!"
            });
        }
    });
});

router.post('/loadRight', function (req, res) {
    // findAudio(new Date(new Date(req.body['tenDate']).getTime()+5*60*1000), res, 'r').then((datas)=>{
    findAudio3(new Date(new Date(req.body['tenDate']).getTime() + 5 * 60 * 1000 + 1 * 1000), res, 'r').then((datas) => {
        var fileNameList = [];
        var fileNameListFirstStarttime = "";
        var fileNameListLastEndtime = "";
        var totaltime = 0;
        if (datas.audios.length != 0) {
            for (var i = 0; i < datas.audios.length; i++) {
                // if(datas.audios[i].starttime > new Date(datas.starttime.getTime()+10*60*1000)){
                if (totaltime > 600) {
                    break;
                } else {
                    fileNameList.push(datas.audios[i].filePath);
                    totaltime += parseInt(datas.audios[i].duration);
                    fileNameListLastEndtime = datas.audios[i].endtime;
                }
            }
            fileNameListFirstStarttime = datas.audios[0].starttime;
        }
        if (fileNameList.length != 0) {
            var starttime;
            var endtime;
            starttime = (datas.starttime - datas.audios[0].starttime) / 1000;
            endtime = (datas.starttime - datas.audios[0].starttime + 10 * 60 * 1000) / 1000;
            getAdjustTenMinAudio(fileNameList, starttime, endtime, req.body.filePath, req.body.loginID).then((datas1) => {
                // console.log(datas1);
                getWavformDat(datas1.cutOutputFileName, datas1.waveformOutputFileName).then(() => {
                    res.status(200).json({
                        result: 1,
                        filePathNew: datas1.filePathNew,
                        wavefromPath: datas1.waveformPath,
                        // startTimeNew: new Date(new Date(req.body['zeroDate']).getTime()+10*60*1000),
                        startTimeNew: new Date(fileNameListFirstStarttime.getTime() + starttime * 1000),
                        endTimeNew: totaltime - endtime > 0 ? new Date(fileNameListLastEndtime.getTime() - (totaltime - endtime) * 1000) : fileNameListLastEndtime
                    });
                });
            });
        } else {
            res.status(201).json({
                result: -1,
                msg: "無法取得音檔!"
            });
        }
    });
});

router.post('/filter', function (req, res) {
    var filePath = req.body["filePath"];
    var loginID = req.body["loginID"];
    var filterType = req.body["filterType"];
    var outputFileName = "cutTmp_"
    filePath = getFullFilePath(filePath);
    var cutOutputFileName = getTmpFilePath(loginID, filePath, outputFileName, ".wav");
    var waveformOutputFileName = getTmpFilePath(loginID, cutOutputFileName, "waveform_", ".dat");
    var cutFilePath = getHalfFilePath(cutOutputFileName);
    var waveformPath = getHalfFilePath(waveformOutputFileName);

    command = "start D://api/" + filterType + ".exe " + filePath + " " + cutOutputFileName;
    cutChild = childExec(command, function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        if (error !== null) {
            // console.log('cutExec error: ' + error);
            res.status(201).json({
                result: -1
            });
        } else {
            var a = cutOutputFileName.split('_');
            a = a[0] + "Tmp_" + a[1];
            fs.unlink(a, () => {
            });
            getWavformDat(cutOutputFileName, waveformOutputFileName).then(() => {
                res.status(201).json({
                    result: 1,
                    filePathNew: cutFilePath,
                    wavefromPath: waveformPath,
                });
            });
        }
    });


});

module.exports = router;
