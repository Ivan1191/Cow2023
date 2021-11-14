var express = require('express');
var uuid = require('uuid');
var fs = require('fs');
var router = express.Router();
var auth = require('../auth');
var EventA = require('../models/eventA');
var AudioTen = require('../models/audioTen');
var AudioRaw = require('../models/audioRaw');
const audioTenPrefix = 'D:/producedAudio/audioTen/';
const {
    format
} = require('morgan');
var moment = require('moment-timezone');
var isLoggedIn = true;

function checkifconcat(audioList, starttime, endtime) {
    return new Promise(function (resolve, reject) {
        var flag = true;
        if (audioList[audioList.length - 1].endtime < endtime) {
            flag = false;
        }
        if (audioList[0].starttime > starttime) {
            flag = false;
        }
        for (var i = 0; i < audioList.length - 1; i++) {
            if (audioList[i + 1].starttime - audioList[i].endtime > 2000) {
                flag = false;
            }
        }
        resolve(flag)
    });
}

function getTenMinAudio(fileNameList, startTime, endTime, timeStamp, eventid, microid) {
    makeCompleteDir().then(() => {
        var mark = uuid.v4();
        //concate
        var arrLen = fileNameList.length;
        var outputFileName = "D:/producedAudio/audioTen/";
        outputFileName += (eventid + "_" + microid + ".wav");
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
                fs.unlink('D:/producedAudio/tmp/output_' + mark + '.wav', () => {});
            });
        });
    })
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

/* GET farm event list page. */
moment.tz.setDefault("Asia/Taipei");
router.get('/', function (req, res, next) {
    // console.log(req.session);
    res.render('farm/index', {
        title: '可視化操作介面',
        loginID: req.session.loginID,
        isLoggedIn: isLoggedIn,
        userName: req.session.userName,
        permissions: req.session.permissions,
        active: '/farm',
        role: req.session.role,
        errorMessage: '',
    });

});

/* GET farm event create page. */
router.get('/create', function (req, res, next) {

    res.render('farm/create', {
        title: '可視化操作介面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        permissions: req.session.permissions,
        active: '/farm',
        role: req.session.role,
    });

});

/* GET farm event edit page. */
router.get('/edit', function (req, res, next) {

    var id = req.query.id;
    // console.log(id);

    EventA.findById(id, function (err, eventA) {
        // console.log(err);
        // console.log(eventA);
        if (!eventA) {
            res.redirect(204, '/farm');
        } else {
            // console.log(eventA);
            var eventAObj = {
                id: eventA._id,
                hard: eventA.hard,
                tagDate: moment(eventA.tagDate).format('YYYY-MM-DD HH:mm:ss'),
                cowLabels: eventA.cowLabels,
                cowNumbers: eventA.cowNumbers,
                dailyRecord: eventA.dailyRecord,
                active: '/farm',
                role: req.session.role,
                lastModifiedAuthor: req.session.loginID,
                lastModifiedTime: new Date(),
            };
            // console.log(eventAObj);
            if (req.session.loginID === eventA.createdAuthor) {
                res.render('farm/edit', {
                    title: '可視化操作介面',
                    loginID: req.session.loginID,
                    userName: req.session.userName,
                    isLoggedIn: isLoggedIn,
                    eventA: eventAObj,
                    permissions: req.session.permissions,
                    active: '/farm',
                    role: req.session.role,
                });
            } else {
                res.render('farm', {
                    title: '可視化操作介面',
                    loginID: req.session.loginID,
                    isLoggedIn: isLoggedIn,
                    userName: req.session.userName,
                    permissions: req.session.permissions,
                    active: '/farm',
                    role: req.session.role,
                    errorMessage: '使用者身分不相符',
                })
            }
        }
    });
});

// update eventA
router.post('/updateEventA', function (req, res) {

    EventA.findById(req.body.id,function(err,eventA){
        var neweventstarttime = eventA.starttime;
        var neweventendtime = eventA.endtime;
        if(eventA.hard !== req.body.hard ){
            if(req.body.hard === "自然分娩")
            {
                neweventstarttime = moment(eventA.tagDate).subtract(60, 'minutes');
                neweventendtime = moment(eventA.tagDate);
            }else
            {
                neweventstarttime = moment(eventA.tagDate).subtract(30, 'minutes');
                neweventendtime = moment(eventA.tagDate);
            }
            if (eventA.audiocut.length !== 0) {
                eventA.audiocut.forEach(function (value, key, map1) {
                    if (typeof value == 'string') {
                        try {
                            fs.unlinkSync(value);
                            AudioTen.deleteOne({ eventId: req.body.id }, function (err) {
                              if (err) return handleError(err);
                            });
                             //console.log("刪除場分娩事件紀錄音檔成功!")
                        } catch (err) {
                            console.error(err)
                        }
                    }
                });
            }
            var map = new Map();
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

                    // Add audio info into eventDB
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

                    EventA.findByIdAndUpdate(req.body.id, {
                        hard: req.body.hard,
                        cowLabels: req.body.cowLabels,
                        cowNumbers: req.body.cowNumbers,
                        starttime:neweventstarttime,
                        endtime:neweventendtime,
                        audiocut:map,
                        dailyRecord: req.body.dailyRecord,
                        lastModifiedAuthor: req.body.lastModifiedAuthor,
                        lastModifiedTime: new Date(),
                        finish:false
                    }, function (err) {
                        if (err) {
                            console.error(err);
                            res.status(500).json({
                                result: -1,
                                message: err
                            });
                            return;
                        } else {
                            map.forEach(function (value, key, map1) {
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
                                        var timeStamp = eventA.tagDate;
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
                                        getTenMinAudio(fileNameList, startTime, endTime, timeStamp, eventA.id, key)
            
                                        // 新增前後10分鐘的音檔至DB
                                        var newaudioTen = new AudioTen();
                                        newaudioTen.audioName = eventA.id + "_" + key + ".wav";
                                        newaudioTen.eventId = eventA.id;
                                        newaudioTen.microId = key;
                                        newaudioTen.filePath = audioTenPrefix + eventA.id + "_" + key + ".wav";
            
                                        newaudioTen.save(function (err) {
                                            if (err) {
                                                console.error(err);
                                                res.status(500).json({
                                                    result: -1,
                                                    message: err
                                                });
                                                return;
                                            }
            
                                            // console.log("成功新增事件前後五分鐘之音檔至資料庫audioTen")
                                            // console.log("新增之音檔資訊: --------------------")
                                            // console.log(newaudioTen)
                                            // console.log("------------結束音檔資訊------------")
                                            map.set(key, newaudioTen.filePath);
                                            // console.log(newevent.id)
                                            EventA.findByIdAndUpdate(eventA.id, {
                                                "audiocut": map
                                            }, function (err, doc) {
                                                if (err) {
                                                    console.error(err);
                                                    res.status(500).json({
                                                        result: -1,
                                                        message: err
                                                    });
                                                    return;
                                                }
                                                // console.log(doc)
                                            });
                                        })
                                    }
                                });
                            });
                            res.redirect('/farm');
                        }
                    });    
                });
        }else{
            EventA.findByIdAndUpdate(req.body.id, {
                hard: req.body.hard,
                cowLabels: req.body.cowLabels,
                cowNumbers: req.body.cowNumbers,
                dailyRecord: req.body.dailyRecord,
                lastModifiedAuthor: req.body.lastModifiedAuthor,
                lastModifiedTime: new Date()
            }, function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        result: -1,
                        message: err
                    });
                    return;
                } else {
                    res.redirect('/farm');
                }
            });
        }
    });
});

// delete eventA
router.post('/deleteEventA', function (req, res) {
    EventA.findByIdAndDelete(req.body.id, function (err, event) {
        if (err) {
            console.error(err);
            return res.status(500).json({
                result: -1,
                message: err
            });
        } else {
            if (event && event.audiocut.length !== "undefined")
                // 刪除事件音檔
                if (event.audiocut.length !== 0) {
                    event.audiocut.forEach(function (value, key, map1) {
                        if (typeof value == 'string') {
                            try {
                                fs.unlinkSync(value);
                                AudioTen.deleteOne({ eventId: req.body.id }, function (err) {
                                  if (err) return handleError(err);
                                });
                                 //console.log("刪除場分娩事件紀錄音檔成功!")
                            } catch (err) {
                                console.error(err)
                            }
                        }
                    });
                }
            return res.status(200).json({
                result: 1,
                message: '刪除現場分娩事件紀錄成功！'
            });
        }
    });
});


router.post('/createEventA', function (req, res) {
    // console.log(req);
    var newevent = new EventA();

    newevent.tagDate = req.body["tagDate"];
    newevent.starttime = req.body["tagDate"];
    newevent.endtime = req.body["tagDate"];
    newevent.hard = req.body["hard"];
    newevent.cowLabels = req.body["cowLabels"];
    newevent.cowNumbers = req.body["cowNumbers"];
    newevent.dailyRecord = req.body["dailyRecord"];
    newevent.finish = false;
    if(newevent.hard === "自然分娩")
    {
        newevent.starttime = moment(req.body['tagDate']).subtract(60, 'minutes');
        newevent.endtime = moment(req.body['tagDate']);
    }else
    {
        newevent.starttime = moment(req.body['tagDate']).subtract(30, 'minutes');
        newevent.endtime = moment(req.body['tagDate']);
    }

    newevent.createdTime = newevent.lastModifiedTime = new Date();
    newevent.createdAuthor = newevent.lastModifiedAuthor = req.body["createdAuthor"]

    // console.log(newevent.audiocut)
    var map = new Map();
    AudioRaw.find({
            $or: [{
                $and: [{
                    starttime: {
                        $lte: newevent.starttime
                    }
                }, {
                    endtime: {
                        $gte: newevent.starttime
                    }
                }]
            }, {
                $and: [{
                    starttime: {
                        $lte: newevent.endtime
                    }
                }, {
                    endtime: {
                        $gte: newevent.endtime
                    }
                }]
            }, {
                $and: [{
                    starttime: {
                        $gte: newevent.starttime
                    }
                }, {
                    endtime: {
                        $lte: newevent.endtime
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

            // Add audio info into eventDB
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
            newevent.audiocut = map;
            newevent.save(function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        result: -1,
                        message: err
                    });
                    return;
                }
                // console.log(newevent.audiocut)
                // Iterate map entries and modify
                newevent.audiocut.forEach(function (value, key, map1) {
                    var fileNameList = [];
                    checkifconcat(value, newevent.starttime, newevent.endtime).then((flag) => {
                        if (flag == true) {
                            //接音檔
                            var totalduration = 0;
                            for (var i = 0; i < value.length; i++) {
                                fileNameList.push(value[i].filePath);
                                totalduration += parseInt(value[i].duration);
                                // console.log("單一音檔的時間" + value[i].starttime-value[i].endtime)
                            }
                            // console.log("fileNameList= " + fileNameList);
                            var timeStamp = newevent.tagDate;
                            // console.log("第一個音檔的開始時間 " + value[0].starttime);
                            // console.log("timestamp的前五分鐘" + newevent.starttime);
                            var startTime = (newevent.starttime - value[0].starttime) / 1000;
                            // console.log("最後一個音檔的結束時間 " + value[value.length-1].endtime);
                            // console.log("timestamp的後五分鐘" + newevent.endtime);
                            var lastTime = (value[value.length - 1].endtime - newevent.endtime) / 1000;
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
                            getTenMinAudio(fileNameList, startTime, endTime, timeStamp, newevent.id, key)

                            // 新增前後10分鐘的音檔至DB
                            var newaudioTen = new AudioTen();
                            newaudioTen.audioName = newevent.id + "_" + key + ".wav";
                            newaudioTen.eventId = newevent.id;
                            newaudioTen.microId = key;
                            newaudioTen.filePath = audioTenPrefix + newevent.id + "_" + key + ".wav";

                            newaudioTen.save(function (err) {
                                if (err) {
                                    console.error(err);
                                    res.status(500).json({
                                        result: -1,
                                        message: err
                                    });
                                    return;
                                }

                                // console.log("成功新增事件前後五分鐘之音檔至資料庫audioTen")
                                // console.log("新增之音檔資訊: --------------------")
                                // console.log(newaudioTen)
                                // console.log("------------結束音檔資訊------------")
                                map1.set(key, newaudioTen.filePath);
                                // console.log(newevent.id)
                                EventA.findByIdAndUpdate(newevent.id, {
                                    "audiocut": map1
                                }, function (err, doc) {
                                    if (err) {
                                        console.error(err);
                                        res.status(500).json({
                                            result: -1,
                                            message: err
                                        });
                                        return;
                                    }
                                    // console.log(doc)
                                });
                            })
                        }
                    });
                });
                res.redirect('/farm');
            });
        });
});


/* POST fetch audio files of event A */
router.post('/select_file', function (req, res, next) {
    var fileObj = JSON.parse(req.body.fileList)
    var newFileList = []
    for(var i=0;i<fileObj.length;i++)
    {
        if(typeof fileObj[i] === 'string')
        {
            newFileList.push(fileObj[i])
        }
    }
    
    if(newFileList.length == 0)
    {
        res.status(404).send({
            result: 0,
            message: "音檔缺失"
        });
        return;
    }else{
        res.render('farm/modals/audio', {
            fileList: newFileList
        });
    }
});

// list eventA
router.post('/listEventA', function (req, res) {
    EventA.find({}, function (err, events) {
        res.send(events);
    });
});

router.post('/checkFileExist', function (req, res, next) {
    try {
        // console.log("--------------------------------------------**********************************");
        // console.log(req.body.fileName);
        fs.exists(req.body.fileName, function (exists) {
            if (exists) {
                res.status(200).json({
                    result: 1,
                    message: 'successful'
                });
            } else {
                res.status(500).json({
                    result: -1,
                    message: "檔案尚準備中"
                });
            }
        });
    } catch (error) {
        // console.log(error);
    }

});

module.exports = router;