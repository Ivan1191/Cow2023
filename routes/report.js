var express = require('express');
var router = express.Router();
var auth = require('../auth');
var isLoggedIn = true;
var EventA = require('../models/eventA')
var moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");
/* GET statistics page. */
router.get('/', function (req, res, next) {

    res.render('statistics', {
        title: '可視化操作介面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        active: '/report',
        permissions: req.session.permissions,
        role: req.session.role,
    });

});

router.post('/getyear', function (req, res) {
    EventA.find({
        "tagDate": {
            "$gte": req.body.starttime,
            "$lte": req.body.endtime
        }
    }, {}, {
        sort: {
            tagDate: 1
        }
    }, function (err, events) {
        if (err) {
            console.error(err);
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        }
        var record = {};
        var tests = new Date(req.body.starttime);
        var teste = new Date(req.body.endtime);

        var years = tests.getFullYear();
        var yeare = teste.getFullYear();
        for (var i = years; i < yeare + 1; i++) {
            record[i] = 0;
        }

        events.forEach(function (event) {
            record[event.tagDate.getFullYear()] += Number(event.cowNumbers);
        });
        res.status(201).json({
            result: 1,
            message: 'get event successfully',
            Record: record,
        });
    });
});

router.post('/getmonth', function (req, res) {
    EventA.find({
        "tagDate": {
            "$gte": req.body.starttime,
            "$lte": req.body.endtime
        }
    }, {}, {
        sort: {
            tagDate: 1
        }
    }, function (err, events) {
        if (err) {
            console.error(err);
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        }
        var record = {};

        var tests = new Date(req.body.starttime);
        var teste = new Date(req.body.endtime);

        if (tests.getFullYear() === teste.getFullYear()) {
            for (var i = (tests.getMonth() + 1); i <= (teste.getMonth() + 1); i++) {
                record[tests.getFullYear() + "-" + i] = 0;
            }
        } else {
            for (var j = tests.getFullYear(); j < (teste.getFullYear() + 1); j++) {
                if (j === tests.getFullYear()) {
                    for (var m = tests.getMonth() + 1; m <= 12; m++) {
                        record[j + "-" + m] = 0;
                    }
                } else {
                    for (var k = 1; k <= teste.getMonth() + 1; k++) {
                        record[j + "-" + k] = 0;
                    }
                }
            }
        }

        events.forEach(function (event) {
            record[event.tagDate.getFullYear() + "-" + (event.tagDate.getMonth() + 1)] += Number(event.cowNumbers);
        });
        res.status(201).json({
            result: 1,
            message: 'get event successfully',
            Record: record,
        });
    });
});

router.post('/getweek', function (req, res) {
    EventA.find({
        "tagDate": {
            "$gte": req.body.starttime,
            "$lte": req.body.endtime
        }
    }, {}, {
        sort: {
            tagDate: 1
        }
    }, function (err, events) {
        if (err) {
            console.error(err);
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        }
        var record = {};
        var tests = new Date(req.body.starttime);
        var teste = new Date(req.body.endtime);
        var weeks = tests.getFullYear() + "-" + (tests.getMonth() + 1) + '-' + tests.getDate();
        var weeke = teste.getFullYear() + "-" + (teste.getMonth() + 1) + '-' + teste.getDate();
        var startWeek = moment(weeks).startOf('week');
        var endWeek = moment(weeke).startOf('week');

        for (var i = startWeek; i <= endWeek; i.add(7, 'days')) {
            record[i.format('YYYY-MM-DD')] = 0;
        }
        // console.log("ssssssweek" + record);

        events.forEach(function (event) {
            record[moment(event.tagDate).startOf('week').format('YYYY-MM-DD')] += Number(event.cowNumbers);
        });
        res.status(201).json({
            result: 1,
            message: 'get event successfully',
            Record: record,
        });
    });
});

router.post('/getday', function (req, res) {
    EventA.find({
        "tagDate": {
            "$gte": req.body.starttime,
            "$lte": req.body.endtime
        }
    }, {}, {
        sort: {
            tagDate: 1
        }
    }, function (err, events) {
        if (err) {
            console.error(err);
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        }
        var record = {};
        var tests = new Date(req.body.starttime);
        var teste = new Date(req.body.endtime);

        var days = tests.getFullYear() + "-" + (tests.getMonth() + 1) + '-' + tests.getDate();
        var daye = teste.getFullYear() + "-" + (teste.getMonth() + 1) + '-' + (teste.getDate() - 2);

        var daysvalue = moment(days).valueOf();
        var dayevalue = moment(daye).valueOf();


        for (var i = daysvalue; i < dayevalue; i += 86400) {
            record[moment(i).format('YYYY-MM-DD')] = 0;
        }

        events.forEach(function (event) {
            record[moment(event.tagDate).format("YYYY-MM-DD")] += Number(event.cowNumbers);
        });
        res.status(201).json({
            result: 1,
            message: 'get event successfully',
            Record: record,
        });

    });
});

module.exports = router;