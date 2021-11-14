var express = require('express');
var router = express.Router();
var auth = require('../auth');
var User = require('../models/user');
var Role = require('../models/role');
var Thermal = require('../models/thermal');
var isLoggedIn = true;
/* GET management of users page. */

router.get('/', function (req, res, next) {

    res.render('user/index', {
        title: '可視化操作介面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        permissions: req.session.permissions,
        active: '/user',
        role: req.session.role,
    });

});

/* GET create page of user. */
router.get('/create', function (req, res, next) {

    Role.find({}, function (err, roles) {
        // console.log(roles);
        if (roles.length) {
            res.render('user/create', {
                title: '可視化操作介面',
                loginID: req.session.loginID,
                isLoggedIn: isLoggedIn,
                roles: roles,
                userName: req.session.userName,
                permissions: req.session.permissions,
                active: '/user',
                role: req.session.role,
            });
        } else {
            res.redirect(204, '/user');
        }
    });

});

/* GET edit page of user. */
router.get('/edit', function (req, res, next) {

    User.findById(req.query.id, function (err, user) {
        if (!user) {
            res.redirect(204, '/user');
        } else {
            Role.find({}, function (err, roles) {
                // console.log(roles);
                var roleName = []
                user.roles.forEach(function (role) {
                    roles.forEach(function (obj) {
                        if (obj.role == role) {
                            roleName.push(obj.name)
                        }
                    })
                })
                if (roles.length) {
                    res.render('user/edit', {
                        title: '可視化操作介面',
                        loginID: req.session.loginID,
                        userName: req.session.userName,
                        isLoggedIn: isLoggedIn,
                        user: user,
                        userRoles: JSON.stringify(user.roles),
                        roles: roles,
                        roleName: roleName,
                        permissions: req.session.permissions,
                        active: '/user',
                        role: req.session.role,
                    });
                } else {
                    res.redirect(204, '/user');
                }
            });
        }
    });

});

/* POST user's data and update */
router.post('/edit', function (req, res) {
    if(req.body.loginID != 'admin'){
        var roles = []
        try {
            roles = JSON.parse(req.body["roles"]);
          } catch (e) {
            roles = []
          }
        var updateObj = {
            userName: req.body.userName,
            email: req.body.email,
            tel: req.body.tel,
            title: req.body.title,
            dept: req.body.dept,
            line_token : req.body.line_token,
            roles: roles
        }

        if (req.body.password == '') {
            delete updateObj['password']
        }else{
            updateObj['password'] = req.body.password
        }

        User.findOneAndUpdate({
            loginID: req.body.loginID
        }, updateObj, function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({
                    result: -1,
                    message: err
                });
                return;
            } else {
                auth.loginIDandSessionIDMap[req.body.loginID] = 0;
                res.redirect('/user')
            }
        });
    }else{
        res.status(500).json({
            result: -1,
            message: 'You should not pass!'
        });
    }

});

/* Create user and redirect */
router.post('/create', function (req, res) {

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
            //creating user in db
            var newuser = new User();
            newuser.userName = req.body["userName"];
            newuser.loginID = req.body["loginID"];
            newuser.password = req.body["password"];
            newuser.email = req.body["email"];
            newuser.tel = req.body["tel"];
            newuser.title = req.body["title"];
            newuser.dept = req.body["dept"];
            newuser.line_token = req.body["line_token"];
            newuser.alert_specialsound = false;
            try {
                newuser.roles = JSON.parse(req.body["roles"]);
              } catch (e) {
                newuser.roles = []
              }

            newuser.save(function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        result: -1,
                        message: err
                    });
                    return;
                }
                res.redirect('/user')
                return;
            });
        } else {
            res.status(404).json({
                result: 0,
                message: 'username exists'
            });
        }
    });
});


// Fetch all users data
router.post('/all', function (req, res) {
    User.find({}, function (err, users) {
        var response = [];
        Role.find({}, function(err, roles){
            users.forEach(function(user){
                var new_user = {}
                new_user._id = user._id;
                new_user.userName = user.userName;
                new_user.loginID = user.loginID;
                new_user.email = user.email;
                new_user.tel = user.tel;
                new_user.title = user.title;
                new_user.dept = user.dept;
                new_user.line_token = user.line_token;
                new_user.roles_name = [];

                roles.forEach(function(role){
                    if(user.roles.includes(role.role)){
                        new_user.roles_name.push(role.name);
                    }
                });

                response.push(new_user)
            })
            res.send(response);
            // console.log(response)
        })
    });
});

// delete user
router.post('/delete', function (req, res) {
    if(req.body.loginID != 'admin'){
        User.findByIdAndDelete(req.body._id, function (err, user) {
            if (err) {
                console.error(err);
                res.status(500).json({
                    result: -1,
                    message: err
                });
                return;
            } else {
                auth.loginIDandSessionIDMap[user.loginID] = 0;
                // console.log(auth.loginIDandSessionIDMap[user.loginID]);
                res.status(200).json({
                    result: 1,
                    message: '刪除系統使用者成功！'
                });
            }
        });
    }else{
        res.status(500).json({
            result: -1,
            message: 'You should not pass!'
        });
    }

});

router.post('/thermal_reminder', function (req, res){
    Thermal.find({}, function (err, thermals) {
        thermals.forEach(function(thermal){  
            res.send(thermal.type);
        })
    })
});

router.post('/specialsound_reminder', function (req, res){
    // console.log("specialsound_reminder")
    User.find({}, function (err, users) {
        users.forEach(function(user){  
            if(user.loginID == req.session.loginID){
                buffer = user.alert_specialsound
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


module.exports = router;
