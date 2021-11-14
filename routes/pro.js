var express = require('express');
var router = express.Router();
var auth = require('../auth');
var fs = require('fs');
var EventB = require('../models/eventB')
var isLoggedIn = true;
/* GET farm event list page. */
router.get('/', function (req, res, next) {

    res.render('pro/index', {
        title: '可視化操作介面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        active: '/pro',
        permissions: req.session.permissions,
        role: req.session.role,
        errorMessage: ''
    });

});

/* GET pro event edit page. */
router.get('/edit', function (req, res, next) {

    var que = req.query;
    var fileName = req.query.fileName;
    fileName = '/audioTen/' + fileName;
    // console.log('edit *** file name = ', fileName);
    res.render('pro/edit', {
        title: 'Audio Editor',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        fileName: fileName,
        active: '/pro',
        permissions: req.session.permissions,
        role: req.session.role,
    });

});

/* GET pro add new event from audio page. */
router.get('/create', function (req, res, next) {

    var fileName = req.query.fileName;
    // console.log(' create *** file name = ', fileName);
    res.render('pro/create', {
        title: 'Audio Editor',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        fileName: fileName,
        active: '/pro',
        permissions: req.session.permissions,
        role: req.session.role,
    });

});

// delete eventB
router.post('/deleteEventB', function (req, res) {
    EventB.findByIdAndDelete(req.body.id, function (err, event) {
        // console.log(event);
        if (err) {
            console.error(err);
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        } else {
            // 刪除事件音檔
            try {
                fs.unlinkSync(event.filePath)
                // console.log("刪除場分娩事件紀錄音檔成功!")
            } catch (err) {
                // console.log("刪除場分娩事件紀錄音檔失敗，錯誤訊息：")
                // console.error(err)
            }
            res.status(200).json({
                result: 1,
                message: '刪除專家標記之分娩事件紀錄成功！'
            });
        }
    });
});

// list eventB
router.post('/listEventB', function (req, res) {
    EventB.find({}, function (err, events) {
        res.send(events);
    });
});

module.exports = router;