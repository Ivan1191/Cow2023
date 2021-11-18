var express = require('express');
var router = express.Router();
var auth = require('../auth');
var isLoggedIn = true;
var moment = require('moment');
var User = require('../models/user');
var Thermal = require('../models/thermal');
var Alarmrecord = require('../models/alarmrecord');

router.get('/', function (req, res, next) {
    res.render('alarmrecord', {
        title: '警示紀錄',
        loginID: req.session.loginID,
        userName: req.session.userName,
        role: req.session.role,
        isLoggedIn: isLoggedIn,
        active: '/alarmrecord',
        permissions: req.session.permissions,
    },);
});

router.post('/all', function (req, res) {
    Alarmrecord.find({}, function (err, alarmrecords) {
        var response = [];
        alarmrecords.forEach(function(alarmrecord){
                var new_alarmrecord = {}
                new_alarmrecord.time = alarmrecord.time;
                new_alarmrecord.type = alarmrecord.type;
                new_alarmrecord.message = alarmrecord.message;
                response.push(new_alarmrecord)
            })
        res.send(response);
        // console.log(response)
    });
});

router.post('/thermal_reminder', function (req, res){
    Thermal.find({}, function (err, thermals) {
        thermals.forEach(function(thermal){  
            res.send(thermal.type);
        })
    })
});

router.post('/specialsound_reminder', function (req, res){
    User.find({}, function (err, users) {
        users.forEach(function(user){  
            if(user.loginID == req.session.loginID){
                buffer = user.alert_specialsound
                console.log(buffer)
                if(buffer == true){
                    var updateObj = {
                        alert_specialsound: false
                    }
                    User.findOneAndUpdate({
                        alert_specialsound: true
                    }, updateObj, function (err) {
                        if (err) {
                            console.error(err);
                            res.status(500).json({
                                result: -1,
                                message: err
                            });
                            return;
                        }
                    });
                }
                // console.log(req.session.loginID)
                res.send(buffer);
            }    
        })
    })
});

// router.post('/line_all_reminder', function (req, res){
//     var line = require('./library/line');
//     line.remind_all()
//     res.send("line!")
// });

module.exports = router;