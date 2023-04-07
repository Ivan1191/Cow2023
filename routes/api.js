var formidable = require('formidable');
var fs = require('fs');
var grid = require('gridfs-stream');
var async = require('async');
const audioTen = require('../models/audioTen');
var gap = 2000;
var auth = require('../auth');
var moment = require('moment-timezone');
var fs = require('fs');
moment.tz.setDefault("Asia/Taipei");
var sha256 = require('js-sha256');
var uuid = require('uuid');

module.exports = function (app, mongoose, conn, User, Workspace, EventA, EventB, AudioRaw, AudioTen, Role, Permission, htA, htB) {


    //add default admin
    var newuser = new User();
    newuser.userName = '管理員'
    newuser.loginID = 'admin'
    newuser.email = 'admin@admin.com'
    newuser.tel = '00000000000'
    newuser.title = 'Manage'
    newuser.dept = 'Manage'
    newuser.roles = ['Admin']

    User.findOne({
        loginID: 'admin'
    }, function (err, user) {
        if (err) {
            console.error(err);
        } else if (!user) {
            newuser.password = newuser.generateHash(sha256('admin'));
            newuser.save(function (err) {
                if (err) {
                    console.error(err);
                }
                // console.log('[User] Create default Admin user, default password : admin')
                // console.log('add admin to user, default password : admin')
                auth.addUserRole('admin', 'Admin')
            });
        } else {
            // console.log('admin already exist.')

        }
    });

    // seed system permissions
    Permission.find({}, function (err, permissions) {
        if (err) {
            console.error(err);
        } else if (!permissions.length) {
            var perms = [{
                    permission: '/user',
                    name: '使用者帳號管理'
                },
                {
                    permission: '/role',
                    name: '角色權限管理'
                },
                {
                    permission: '/report',
                    name: '週期統計圖表'
                },
                {
                    permission: '/profile',
                    name: '個人資料'
                },
                {
                    permission: '/audio',
                    name: '原始音檔管理'
                },
                {
                    permission: '/pro',
                    name: '聲紋特徵分析系統'
                },
                {
                    permission: '/farm',
                    name: '可視化系統操作介面'
                },
                {
                    permission: '/backstage',
                    name: '後台管理'
                }, {
                    permission: '/temperature',
                    name: '溫溼度列表'
                },
                {
                    permission: '/live',
                    name: '即時預覽頁面'
                },
                {
                    permission: '/alarmrecord',
                    name: '警示紀錄'
                },
                {
                    permission: '/audioClassManage',
                    name: '音檔分類管理'
                },
            ];
            perms.forEach(function (current) {
                var perm = new Permission();
                perm.permission = current['permission'];
                perm.name = current['name'];
                perm.save();
            });
        } else {
            // console.log('Permission already exist.')
        }
    });

    //add role config

    //if db don't have role table yet, then please restart server
    function setSeedRole() {
        Role.find({}, '-_id -__v -name', function (err, role) {
            // console.log("Initializing db role table.")
            if (err) {
                console.error(err);
            } else if (!role.length) {
                var roleArray = [
                    ['管理員', 'Admin', ['/user', '/role', '/report', '/profile', '/audio', '/pro', '/farm', '/backstage', '/temperature', '/live', '/alarmrecord','/audioplayback','/audioClassManage']],
                    ['專家', 'Expert', ['/report', '/profile', '/audio', '/pro', '/farm', '/temperature', '/live', '/alarmrecord','/audioplayback']],
                    ['現場人員', 'Worker', ['/farm', '/profile', '/temperature', '/live', '/alarmrecord','/audioplayback']]
                ];
                roleArray.forEach(function (current) {
                    var role = new Role();
                    role.name = current[0]
                    role.role = current[1]
                    role.allows = []
                    current[2].forEach(function (opts) {
                        role.allows.push(opts);
                    })
                    role.save();
                })
                // console.log("Please restart the server.")
                //讓他死掉
            } else {
                auth.setAcl(role)
                return true;
            }
        });
    }
    setSeedRole();

    ///////////////////
    //USER MANAGEMENT//
    ///////////////////

    //logout
    app.get('/signout', function (req, res) {
        // 清暫存
        var sess = req.session;
        if (sess.loginID) {
            req.session = null;
            res.redirect('/signin'); // TODO: NEED TO BE CONSIDERED
        } else {
            res.redirect('/signin'); // TODO: NEED TO BE CONSIDERED
        }
    });

    app.post('/microId/A/all', function (req, res) {
        htA.find({}, function (err, events) {
            events.forEach((event) => {
                event.create_at.setHours(event.create_at.getHours() - 8);
            })
            res.send(events);
        });
    });

    app.post('/microId/B/all', function (req, res) {
        htB.find({}, function (err, events) {
            events.forEach((event) => {
                event.create_at.setHours(event.create_at.getHours() - 8);
            })
            res.send(events);
        });
    });
}
