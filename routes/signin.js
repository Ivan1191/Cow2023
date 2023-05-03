var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Role = require('../models/role');
var auth = require('../auth');
var uuid = require('uuid');
var mongoose = require('mongoose');
const session = require('express-session');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('signin/signin', {
        title: '可視化操作介面 - Sign in',
    });
});

//login
router.post('/', function (req, res) {
    var state = mongoose.connection.readyState;
    if(state==0){
        res.status(404).json({
            result: 0,
            message: '資料庫連線異常'
        });
        return;
    }else if (state==1){
    }else if (state==2){
        res.status(404).json({
            result: 0,
            message: '資料庫連線中'
        });
        return;
    }else if (state==3){
        res.status(404).json({
            result: 0,
            message: '資料庫連線異常'
        });
        return;
    }
    var sess = req.session;
    User.findOne({
        loginID: req.body["loginID"]
    }, function (err, user) {
        if (err) {
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        } else if (!user) {
            res.status(404).json({
                result: 0,
                message: '錯誤的帳號或密碼!'
            });
            return;
        } else if (!user.validateHash(req.body["password"])) {
            res.status(404).json({
                result: 0,
                message: '錯誤的帳號或密碼!'
            });
            return;
        } else {
            auth.setDuplicateMap(req.body["loginID"], uuid.v4());
            sess.uuid = auth.loginIDandSessionIDMap[req.body["loginID"]];
            sess.loginID = user.loginID;
            sess.userName = user.userName;

            if (user.roles.includes(req.body.role)) {
                Role.find({}, function (err, roles) {
                    if (roles.length) {
                        roles.forEach(function (role) {
                            if (role["role"] == req.body.role) {
                                sess.permissions = role["allows"];
                                console.log(sess.permissions)

                                sess.role = role["name"]
                            }
                        })
                        // console.log('loginID: ' + sess.loginID + ', Session ID: ' + sess.uuid);
                        auth.addUserRole(user.loginID, req.body.role);
                        // console.log('[Login] Login ID: ' + sess.loginID + ' , Roles: ' + req.body.role + ', Allows: ' + sess.permissions)
                        res.status(200).json({
                            result: 1,
                            message: 'success',
                            dist: '/live'
                        });
                    } else {
                        res.redirect(204, '/signin');
                    }
                });
            } else {
                res.status(404).json({
                    result: 0,
                    message: '錯誤的角色'
                });
                return;
            }
        }
    });
});


module.exports = router;
