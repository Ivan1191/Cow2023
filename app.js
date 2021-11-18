var chokidar = require('chokidar');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var mongoose2 = require('mongoose');
var cookieSession = require('cookie-session');
var schedule = require('node-schedule');

var user = require('./routes/user');
var signin = require('./routes/signin');
var batch = require('./routes/library/batch');
var line = require('./routes/library/line');
var farm = require('./routes/farm');
var pro = require('./routes/pro');
var audio = require('./routes/audio');
var report = require('./routes/report');
var profile = require('./routes/profile');
var rolee = require('./routes/role');
var temperature = require('./routes/temperature');
var live = require('./routes/live');
var alarmrecord = require('./routes/alarmrecord');
var backstage = require('./routes/backstage');
var audioplayback = require('./routes/audioplayback');

var app = express();
var auth = require('./auth');

// const dirRaw = './audioRaw/';

app.locals.moment = require('moment-timezone');
app.locals.moment.tz.setDefault("Asia/Taipei");

//Connect to MongoDB server on localhost, db name to be changed
mongoose.connect("mongodb://127.0.0.1:27017/AnamalAudioManagement", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    server: {
        socketOptions: {
            socketTimeoutMS: 0,
            connectionTimeout: 0
        }
    }
}, function(err) {
    if (err) throw err;
});

mongoose.set('useCreateIndex', true);
var conn = mongoose.connection;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ['CS409TeamOne']
}));


var uuid = require('uuid');
var duplicateLoginCheck = (req, res, next) => {
    if (req.session.uuid == auth.loginIDandSessionIDMap[req.session.loginID]) {
        next();
    } else {
        // console.log('Duplicate Login: ' + 'loginID: ' + req.session.loginID)
        // console.log(', old Session ID: ' + req.session.uuid)
        // console.log(', new Session ID: ' + auth.loginIDandSessionIDMap[req.session.loginID]);
        req.session = null;
        res.render('signin/signin', {
            title: '可視化操作介面 - Sign in',
            errorMessage: '發現重複登陸',
        });
    }
}

var loginCheck = (req, res, next) => {
    if (req.session.loginID == undefined || auth.loginIDandSessionIDMap[req.session.loginID] == undefined) {
        req.session = null;
        // 清暫存
        res.render('signin/signin', {
            title: '可視化操作介面 - Sign in',
            errorMessage: '尚未登入',
        });
    } else {
        next();
    }
}

var sessionClearCheck = (req, res, next) => {
    if (auth.loginIDandSessionIDMap[req.session.loginID] == 0) {
        req.session = null;
        res.render('signin/signin', {
            title: '可視化操作介面 - Sign in',
            errorMessage: '管理員編輯使用者資訊強制登出',
        });
    } else {
        next();
    }
}

var checkDataBaseConnection = (req, res, next) => {
    var state = mongoose.connection.readyState;
    if(state==0){
        res.render('signin/signin', {
            title: '可視化操作介面 - Sign in',
            errorMessage: '資料庫連線異常',
        });
    }else if (state==1){
        next();
    }else if (state==2){
        res.render('signin/signin', {
            title: '可視化操作介面 - Sign in',
            errorMessage: '資料庫連線中',
        });
    }else if (state==3){
        res.render('signin/signin', {
            title: '可視化操作介面 - Sign in',
            errorMessage: '資料庫連線異常',
        });
    }
}

app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join("D:/test/", 'wave')));
app.use(express.static(path.join("D:/", 'producedAudio')));
app.use('/', signin)
app.use('/signin', signin);
app.use('/farm', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, auth.acl.middleware(1, auth.get_user_id), farm);
app.use('/pro', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, auth.acl.middleware(1, auth.get_user_id), pro);
app.use('/user', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, auth.acl.middleware(1, auth.get_user_id), user);
app.use('/audio', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, auth.acl.middleware(1, auth.get_user_id), audio);
app.use('/report', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, auth.acl.middleware(1, auth.get_user_id), report);
app.use('/temperature', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, auth.acl.middleware(1, auth.get_user_id), temperature);
app.use('/live', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, live);
app.use('/alarmrecord', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, alarmrecord);
app.use('/profile', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, profile);
app.use('/role', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, auth.acl.middleware(1, auth.get_user_id), rolee);
app.use('/backstage', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, auth.acl.middleware(1, auth.get_user_id), backstage);
app.use('/audioplayback', checkDataBaseConnection, sessionClearCheck, loginCheck, duplicateLoginCheck, auth.acl.middleware(1, auth.get_user_id), audioplayback);



var user = require('./models/user');
var workspace = require('./models/workspace');
var eventA = require('./models/eventA');
var eventB = require('./models/eventB');
var audioRaw = require('./models/audioRaw');
var audioTen = require('./models/audioTen');
var role = require('./models/role');
var htA = require('./models/htA');
var htB = require('./models/htB');
var alarmrecord = require('./models/alarmrecord');
var thermal = require('./models/thermal');
var specialsound = require('./models/specialsound');
// var htC = require('./models/htC');
// var htD = require('./models/htD');
var permission = require('./models/permission');
var apiRoutes = require('./routes/api')(app, mongoose, conn, user, workspace, eventA, eventB, audioRaw, audioTen, role, permission, htA, htB, alarmrecord, thermal, specialsound);

// Check add file per times
var rule = new schedule.RecurrenceRule();
rule.second = [0];
var j = schedule.scheduleJob(rule, function () {
    // batch.timeout(eventA, audioTen);
});

// watch
// batch.audio2DB(eventA, audioRaw, audioTen);
batch.scanAudio(eventA, audioRaw, audioTen);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// check if every audioRaw is inDB, if no then add



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var rule_sec = new schedule.RecurrenceRule();
rule_sec.second = [0,3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57];
var j = schedule.scheduleJob(rule_sec, function () {
    line.remind_all()
});


var video = require('./routes/library/video');

//video.record_rtsp1()
//video.record_rtsp2()
var rule_min = new schedule.RecurrenceRule(); 
// rule_min.minute = [0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60];
rule_min.minute = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60];
var k = schedule.scheduleJob(rule_min, function(){
  
    video.pic_rtsp_1()
    video.pic_rtsp_2()
 
    //console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    // var v_name = ""
    // name_buf = 0
    // videoname1 = video.get_videoname1()
    // videoname2 = video.get_videoname2()
    // for(s = videoname1.length-1 ; s > 1; s--){
    //     buffer = video.define_cut(videoname1[s])
    //     if(buffer){
    //         v_name = videoname1[s]
    //         name_buf = 1
    //         break
    //     }
    // }

    // if(v_name.length == 0){
    //     for(m = videoname2.length-1 ; m > 1; m--){
    //         buffer = video.define_cut(videoname2[m])
    //         if(buffer){
    //             v_name = videoname2[m]
    //             name_buf = 2
    //             break
    //         }
    //     }
    // }

    // if(v_name.length > 0 & name_buf == 1)
    //     video.merge(v_name,name_buf);
    // else if(v_name.length > 0 & name_buf == 2)
    //     video.merge(v_name,name_buf);
    //console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
});

module.exports = app;
