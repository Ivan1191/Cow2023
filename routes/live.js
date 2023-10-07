var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var auth = require('../auth');
var camerafield = require('../models/camerafield');
var isLoggedIn = true;
var moment = require('moment');
var fs = require('fs');

module.exports = router;

const Stream = require('node-rtsp-stream');
const {scheduleJob} = require('node-schedule');

camerafield.find({}, function (err, rows) {
    // console.log(rows, "||||||||||");
    var i = 0;
    rows.forEach(function (row) {
        var options = {
            name: row.name,
            streamUrl: row.streamUrl,
            wsPort: row.wsPort,
            ffmpegOptions: {
                '-stats': '',
                '-rtsp_transport': 'tcp',
                '-initial_pause': 1,
                '-r': 30,
                '-loglevel': 'error',
            }
        };
        stream = new Stream(options);
        // console.log(stream,"|||||||||||");
        i++;
    })
});

// 以下為舊版方式 2023/06/02 保留用作參考。
// const options = {
//     name: 'streamName',
//     // streamUrl: 'rtsp://admin:admin@192.168.11.21',
//     streamUrl: 'rtsp://admin:admin@192.168.12.61:55461',
//     // streamUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4', //失效
//     wsPort: 3333,
//     ffmpegOptions: {
//         '-stats': '', // an option with no neccessary value uses a blank string
//         '-rtsp_transport': 'tcp',
//         '-initial_pause': 1,
//         //'-c':'copy',
//         //'-bufsize': 640000,
//         //'-maxrate': 480000,
//         //'-pix_fmt': 'yuv420p',
//         '-r': 30,
//         //'-g': 60,
//
//         '-progress': 'pro1.log',
//         '-loglevel': 'error',
//         //'-nostats': '',
//         //'-reset_timestamps' : 1,
//         //'-timeout': -1,
//     }
// }
// stream = new Stream(options)
//
// const options1 = {
//     name: 'streamName2',
//     // streamUrl: 'rtsp://admin:admin@192.168.11.22',
//     streamUrl: 'rtsp://admin:admin@192.168.12.62:55462',
//     // streamUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4', //失效
//     wsPort: 4444,
//     ffmpegOptions: {
//         '-stats': '', // an option with no neccessary value uses a blank string
//         '-rtsp_transport': 'tcp',
//         '-initial_pause': 1,
//         //'-c':'copy',
//         //'-bufsize': 640000,
//         //'-maxrate': 480000,
//         //'-pix_fmt': 'yuv420p',
//         '-r': 30,
//         //'-g': 60,
//         '-progress': 'pro2.log',
//         '-loglevel': 'error',
//         //'-nostats': '',
//         //'-reset_timestamps' : 1,
//         //'-timeout': -1,
//     }
// }
// stream1 = new Stream(options1)
// schedule.scheduleJob('30 * * * * *', function () {
//     fs.readFile('pro1.log', function (err, data) {
//         if (err) throw err;
//         var data_string = data.toString();
//         var len = data_string.length;
//         console.log(len);
//         if ((data_string[len - 4] == 'e') && (data_string[len - 3] == 'n') && (data_string[len - 2] == 'd')) {
//             console.log("File1 has end");
//             stream.stop();
//             stream = new Stream(options)
//         } else {
//             console.log("File1 is successsssss");
//         }
//     });
//     fs.readFile('pro2.log', function (err, data) {
//         if (err) throw err;
//         var data_string = data.toString();
//         var len = data_string.length;
//         console.log(len);
//         if ((data_string[len - 4] == 'e') && (data_string[len - 3] == 'n') && (data_string[len - 2] == 'd')) {
//             console.log("File2 has end");
//             stream1.stop();
//             stream1 = new Stream(options1)
//         } else {
//             console.log("File2 is successsssss");
//         }
//     });
// })

router.get('/', function (req, res, next) {
    res.render('live', {
        title: '即時預覽頁面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        role: req.session.role,
        isLoggedIn: isLoggedIn,
        active: '/live',
        permissions: req.session.permissions,
    },);
});

router.post('/camerafieldsSelect', function (req, res) {
    camerafield.find({}, function (err, rows) {
        res.status(201).json({
            result: 1,
            message: 'get camerafieldsSelect successfully',
            rows: rows,
        });
    });
});
