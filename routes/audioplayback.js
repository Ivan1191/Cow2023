var express = require('express');
var router = express.Router();
var auth = require('../auth');
var isLoggedIn = true;
var moment = require('moment');
var EventA = require('../models/eventA');
var EventB = require('../models/eventB');

router.get('/', function (req, res, next) {
    res.render('audioplayback', {
        title: '剪輯音檔播放介面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        role: req.session.role,
        isLoggedIn: isLoggedIn,
        active: '/audioplayback',
        permissions: req.session.permissions,
    },);
});


router.post('/audio', function (req, res, next) {
    
    EventA.find({}, function (err, eventAs) {
        var response = [];
        eventAs.forEach(function(eventA){
            var eventA_tmp = {};
            eventA_tmp.type = "可視化系統操作介面";
            eventA_tmp.tagDate = eventA.tagDate;       
            eventA_tmp.hard = eventA.hard;   
            eventA_tmp.starttime = eventA.starttime;
            eventA_tmp.endtime = eventA.endtime;
            var new_audiocuta = {}
            if(eventA.audiocut.has('a'))
            {
                new_audiocuta.a = eventA._id +"_a.wav";
            }
            if(eventA.audiocut.has('c'))
            {
                new_audiocuta.c = eventA._id +"_c.wav";
            }
            if(eventA.audiocut.has('b'))
            {
                new_audiocuta.b = eventA._id +"_b.wav";
            }
            eventA_tmp.audiocut = new_audiocuta; 
            response.push(eventA_tmp);
        });
        EventB.find({}, function (err, eventBs) {
            eventBs.forEach(function(eventB){
                var eventB_tmp = {};
                var new_audiocutb = {}
                eventB_tmp.type = "聲紋特徵分析系統";
                eventB_tmp.tagDate = eventB.tagDate;   
                eventB_tmp.starttime = eventB.zeroDate;
                eventB_tmp.endtime = eventB.tenDate;    
                eventB_tmp.hard = eventB.hard; 
                new_audiocutb.cut = eventB.fileName;
                eventB_tmp.audiocut = new_audiocutb;
                response.push(eventB_tmp);
            });
            res.send(response);
        });
    });
});

module.exports = router;