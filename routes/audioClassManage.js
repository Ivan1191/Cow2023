var express = require('express');
var uuid = require('uuid');
var fs = require('fs');
var router = express.Router();
var auth = require('../auth');
var audioClassManage = require('../models/audioClassManage');
var EventA = require('../models/eventA');
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

/* GET farm event list page. */
moment.tz.setDefault("Asia/Taipei");
router.get('/', function (req, res, next) {
    // console.log(req.session);
    res.render('audioClassManage/index', {
        title: '音檔分類管理介面',
        loginID: req.session.loginID,
        isLoggedIn: isLoggedIn,
        userName: req.session.userName,
        permissions: req.session.permissions,
        active: '/audioClassManage',
        role: req.session.role,
        errorMessage: '',
    });

});

/* GET farm event create page. */
router.get('/create/', function (req, res, next) {

    res.render('audioClassManage/create', {
        title: '音檔分類管理介面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        permissions: req.session.permissions,
        active: '/audioClassManage',
        role: req.session.role,
    });

});


/* GET farm event edit page. */
router.get('/edit', function (req, res, next) {

    var id = req.query.id;
    // console.log(id);

    audioClassManage.findById(id, function (err, eventA) {
        // console.log(err);
        // console.log(eventA);
        if (!eventA) {
            res.redirect(204, '/audioClassManage');
        } else {
            // console.log(eventA);
            var eventAObj = {
                id: eventA._id,
                Name: eventA.Name,
                filePath: eventA.filePath,
            };
            // console.log(eventAObj);

            res.render('audioClassManage/edit', {
                title: '音檔分類管理介面',
                loginID: req.session.loginID,
                userName: req.session.userName,
                isLoggedIn: isLoggedIn,
                datarow: eventAObj,
                permissions: req.session.permissions,
                active: '/audioClassManage',
                role: req.session.role,
            });
        }
    });
});


router.post('/createEventA', function (req, res) {
    var db = new audioClassManage();

    db.Name = req.body["Name"];
    db.filePath = req.body["filePath"];

    db.save(function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        }
        res.redirect('/audioClassManage')
        return;
    });

});

// update eventA
router.post('/updateEventA', function (req, res) {

    audioClassManage.findByIdAndUpdate(req.body.id, {
        Name: req.body.Name,
        filePath: req.body.filePath
    }, function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        } else {
            res.redirect('/audioClassManage');
        }
    });

});

// delete eventA
router.post('/deleteEventA', function (req, res) {
    audioClassManage.findByIdAndDelete(req.body.id, function (err) {
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
                message: '刪除成功！'
            });
        }
    });
});

// list eventA
router.post('/listEventA', function (req, res) {
    audioClassManage.find({}, function (err, events) {
        res.send(events);
    });
});

module.exports = router;
