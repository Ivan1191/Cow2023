var express = require('express');
var router = express.Router();
var auth = require('../auth');
var htA = require('../models/htA')
var htB = require('../models/htB')
var htC = require('../models/htC')
var htD = require('../models/htD');
var isLoggedIn = true;
var moment = require('moment');


function formatHtA(htAs, flag) {
    // flag=true: 溫度
    // flag=false: 濕度
    return new Promise(function (resolve, reject) {
        var datas = {}
        if (flag == true) {
            htAs.forEach((htA) => {
                // 處理溫溼度時區錯亂問題
                htA.create_at.setHours(htA.create_at.getHours() - 8);
                // 處理Obj格式問題 => { "小時：分鐘：秒" : 溫度 }
                // 如果是個位數就補0
                var hours = htA.create_at.getHours();
                if (hours < 10) {
                    hours = '0' + hours
                }
                var minutes = htA.create_at.getMinutes();
                if (minutes < 10) {
                    minutes = '0' + minutes
                }
                var seconds = htA.create_at.getSeconds();
                if (seconds < 10) {
                    seconds = '0' + seconds
                }
                datas[hours + ":" + minutes + ":" + seconds] = htA.temperature;
            })
        } else {
            var last0;
            htAs.forEach((htA) => {
                // 處理溫溼度時區錯亂問題
                htA.create_at.setHours(htA.create_at.getHours() - 8);
                // 處理Obj格式問題 => { "小時：分鐘：秒" : 溫度 }
                // 如果是個位數就補0
                var hours = htA.create_at.getHours();
                if (hours < 10) {
                    hours = '0' + hours
                }
                var minutes = htA.create_at.getMinutes();
                if (minutes < 10) {
                    minutes = '0' + minutes
                }
                var seconds = htA.create_at.getSeconds();
                if (seconds < 10) {
                    seconds = '0' + seconds
                }
                datas[hours + ":" + minutes + ":" + seconds] = htA.humidity;
            })
        }
        resolve(datas)
    });
}

function formatLineAll(hts) {
    return new Promise(function (resolve, reject) {
        var datas = {
            'labels': [],
            'T': [],
            'H': [],
        }
        hts.forEach((ht) => {
            // 處理溫溼度時區錯亂問題
            ht.create_at.setHours(ht.create_at.getHours() - 8);
            moment(ht.create_at).subtract(8, "hours").format('YYYY-MM-DD HH:mm:ss');
            // 處理Obj格式問題 => { "小時：分鐘：秒" : 溫度 }
            // 如果是個位數就補0
            var hours = ht.create_at.getHours();
            if (hours < 10) {
                hours = '0' + hours
            }
            var minutes = ht.create_at.getMinutes();
            if (minutes < 10) {
                minutes = '0' + minutes
            }
            var seconds = ht.create_at.getSeconds();
            if (seconds < 10) {
                seconds = '0' + seconds
            }
            // datas[hours + ":" + minutes + ":" + seconds] = htA.temperature;
            datas['labels'].push(moment(ht.create_at).format('YYYY-MM-DD HH:mm:ss'));
            datas['T'].push(ht.temperature);
            datas['H'].push(ht.humidity);

        })
        resolve(datas)
    });
}

router.get('/', function (req, res, next) {
    var date = new Date();
    res.render('temperature', {
        title: '可視化操作介面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        role: req.session.role,
        isLoggedIn: isLoggedIn,
        active: '/temperature',
        permissions: req.session.permissions,
        date: date.getFullYear() + "/" + (parseInt(date.getMonth()) + 1) + "/" + date.getDate(),
    });

});

router.post('/getA/temperature', function (req, res, next) {
    // console.log(req.body);
    htA.find({
        create_at: {
            $gte: new Date(req.body.starttime),
            $lte: new Date(req.body.endtime)
        }
    }, '-_id create_at temperature', {
        sort: {
            create_at: 1
        }
    }, function (err, htAs) {
        if (err) {
            console.error(err);
        } else {
            formatHtA(htAs, true).then((datas) => {
                res.send(datas);
            });
        }
    });
});

router.post('/getA/humidity', function (req, res, next) {
    // console.log(req.body);
    htA.find({
        create_at: {
            $gte: new Date(req.body.starttime),
            $lte: new Date(req.body.endtime)
        }
    }, '-_id create_at humidity', {
        sort: {
            create_at: 1
        }
    }, function (err, htAs) {
        if (err) {
            console.error(err);
        } else {
            formatHtA(htAs, false).then((datas) => {
                res.send(datas);
            });
        }
    });
});

router.post('/getB/temperature', function (req, res, next) {
    // console.log(req.body);
    htB.find({
        create_at: {
            $gte: new Date(req.body.starttime),
            $lte: new Date(req.body.endtime)
        }
    }, '-_id create_at temperature', {
        sort: {
            create_at: 1
        }
    }, function (err, htAs) {
        if (err) {
            console.error(err);
        } else {
            formatHtA(htAs, true).then((datas) => {
                res.send(datas);
            });
        }
    });
});

router.post('/getB/humidity', function (req, res, next) {
    // console.log(req.body);
    htB.find({
        create_at: {
            $gte: new Date(req.body.starttime),
            $lte: new Date(req.body.endtime)
        }
    }, '-_id create_at humidity', {
        sort: {
            create_at: 1
        }
    }, function (err, htAs) {
        if (err) {
            console.error(err);
        } else {
            formatHtA(htAs, false).then((datas) => {
                res.send(datas);
            });
        }
    });
});

router.post('/getC/temperature', function (req, res, next) {
    // console.log(req.body);
    htC.find({
        create_at: {
            $gte: new Date(req.body.starttime),
            $lte: new Date(req.body.endtime)
        }
    }, '-_id create_at temperature', {
        sort: {
            create_at: 1
        }
    }, function (err, htAs) {
        if (err) {
            console.error(err);
        } else {
            formatHtA(htAs, true).then((datas) => {
                res.send(datas);
            });
        }
    });
});

router.post('/getC/humidity', function (req, res, next) {
    // console.log(req.body);
    htC.find({
        create_at: {
            $gte: new Date(req.body.starttime),
            $lte: new Date(req.body.endtime)
        }
    }, '-_id create_at humidity', {
        sort: {
            create_at: 1
        }
    }, function (err, htAs) {
        if (err) {
            console.error(err);
        } else {
            formatHtA(htAs, false).then((datas) => {
                res.send(datas);
            });
        }
    });
});

router.post('/getD/temperature', function (req, res, next) {
    // console.log(req.body);
    htD.find({
        create_at: {
            $gte: new Date(req.body.starttime),
            $lte: new Date(req.body.endtime)
        }
    }, '-_id create_at temperature', {
        sort: {
            create_at: 1
        }
    }, function (err, htAs) {
        if (err) {
            console.error(err);
        } else {
            formatHtA(htAs, true).then((datas) => {
                res.send(datas);
            });
        }
    });
});

router.post('/getD/humidity', function (req, res, next) {
    // console.log(req.body);
    htD.find({
        create_at: {
            $gte: new Date(req.body.starttime),
            $lte: new Date(req.body.endtime)
        }
    }, '-_id create_at humidity', {
        sort: {
            create_at: 1
        }
    }, function (err, htAs) {
        if (err) {
            console.error(err);
        } else {
            formatHtA(htAs, false).then((datas) => {
                res.send(datas);
            });
        }
    });
});

router.post('/getTH', function (req, res, next) {
    // console.log(req.body);
    if (req.body.type == 'line') {
        switch (req.body.sensorID) {
            case 'A':
                // console.log('A');
                htA.find({
                    create_at: {
                        // $gte: new Date(req.body.starttime),
                        // $lte: new Date(req.body.endtime)
                        $gte: req.body.starttime,
                        $lte: req.body.endtime
                    }
                }, '-_id create_at temperature humidity', {
                    sort: {
                        create_at: 1
                    }
                }, function (err, htAs) {
                    if (err) {
                        console.error(err);
                    } else {
                        formatLineAll(htAs).then((datas) => {
                            res.send(datas);
                        });
                    }
                });
                break;
            case 'B':
                // console.log('B');
                htB.find({
                    create_at: {
                        // $gte: new Date(req.body.starttime),
                        // $lte: new Date(req.body.endtime)
                        $gte: req.body.starttime,
                        $lte: req.body.endtime
                    }
                }, '-_id create_at temperature humidity', {
                    sort: {
                        create_at: 1
                    }
                }, function (err, htBs) {
                    if (err) {
                        console.error(err);
                    } else {
                        formatLineAll(htBs).then((datas) => {
                            res.send(datas);
                        });
                    }
                });
                break;
            case 'C':
                // console.log('C');
                htC.find({
                    create_at: {
                        // $gte: new Date(req.body.starttime),
                        // $lte: new Date(req.body.endtime)
                        $gte: req.body.starttime,
                        $lte: req.body.endtime
                    }
                }, '-_id create_at temperature humidity', {
                    sort: {
                        create_at: 1
                    }
                }, function (err, htCs) {
                    if (err) {
                        console.error(err);
                    } else {
                        formatLineAll(htCs).then((datas) => {
                            res.send(datas);
                        });
                    }
                });
                break;
            case 'D':
                // console.log('D');
                htD.find({
                    create_at: {
                        // $gte: new Date(req.body.starttime),
                        // $lte: new Date(req.body.endtime)
                        $gte: req.body.starttime,
                        $lte: req.body.endtime
                    }
                }, '-_id create_at temperature humidity', {
                    sort: {
                        create_at: 1
                    }
                }, function (err, htDs) {
                    if (err) {
                        console.error(err);
                    } else {
                        formatLineAll(htDs).then((datas) => {
                            res.send(datas);
                        });
                    }
                });
                break;
            default:
                // console.log('[ERROR] No such sensorID!');
        }
    } else {
        // console.log("其他的");
        switch (req.body.sensorID) {
            case 'A':
                // console.log('A');
                htA.find({
                    create_at: {
                        // $gte: new Date(req.body.starttime),
                        // $lte: new Date(req.body.endtime)
                        $gte: req.body.starttime,
                        $lte: req.body.endtime
                    }
                }, '-_id create_at temperature humidity', {
                    sort: {
                        create_at: 1
                    }
                }, function (err, htAs) {
                    if (err) {
                        console.error(err);
                    } else {
                        // formatLineAll(htAs).then((datas) => {
                        res.send(htAs);
                        // });
                    }
                });
                break;
            case 'B':
                // console.log('B');
                htB.find({
                    create_at: {
                        // $gte: new Date(req.body.starttime),
                        // $lte: new Date(req.body.endtime)
                        $gte: req.body.starttime,
                        $lte: req.body.endtime
                    }
                }, '-_id create_at temperature humidity', {
                    sort: {
                        create_at: 1
                    }
                }, function (err, htBs) {
                    if (err) {
                        console.error(err);
                    } else {
                        // formatLineAll(htBs).then((datas) => {
                        res.send(htBs);
                        // });
                    }
                });
                break;
            case 'C':
                // console.log('C');
                htC.find({
                    create_at: {
                        // $gte: new Date(req.body.starttime),
                        // $lte: new Date(req.body.endtime)
                        $gte: req.body.starttime,
                        $lte: req.body.endtime
                    }
                }, '-_id create_at temperature humidity', {
                    sort: {
                        create_at: 1
                    }
                }, function (err, htCs) {
                    if (err) {
                        console.error(err);
                    } else {
                        // formatLineAll(htCs).then((datas) => {
                        res.send(htCs);
                        // });
                    }
                });
                break;
            case 'D':
                // console.log('D');
                htD.find({
                    create_at: {
                        // $gte: new Date(req.body.starttime),
                        // $lte: new Date(req.body.endtime)
                        $gte: req.body.starttime,
                        $lte: req.body.endtime
                    }
                }, '-_id create_at temperature humidity', {
                    sort: {
                        create_at: 1
                    }
                }, function (err, htDs) {
                    if (err) {
                        console.error(err);
                    } else {
                        // formatLineAll(htDs).then((datas) => {
                        res.send(htDs);
                        // });
                    }
                });
                break;
            default:
                // console.log('[ERROR] No such sensorID!');
        }
    }

});
module.exports = router;