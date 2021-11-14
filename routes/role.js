var express = require('express');
var router = express.Router();
var auth = require('../auth');
var Permission = require('../models/permission')
var Role = require('../models/role');
const user = require('../models/user');
var User = require('../models/user');
var isLoggedIn = true;
/* GET management of users page. */

function checkUsersRole(User, users, role) {
    return new Promise(function (resolve, reject) {
        users.forEach(function(user){
            if(user.roles.includes(role)){
                User.findByIdAndUpdate(user.id, {
                    roles: user.roles.remove(role)
                }, function (err) {
                    if (err) {
                        resolve(-1);
                    }
                });
            }
        });
        resolve(0);
    });
}

router.get('/', function (req, res, next) {

    res.render('role/index', {
        title: '可視化操作介面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        active: '/role',
        permissions: req.session.permissions,
        role: req.session.role,
    });

});

router.post('/listOperation', function (req, res) {

    Permission.find({}, function (err, events) {
        res.send(events);
    });

});

//create new role
router.post('/addRole', function (req, res) {

    var newRole = new Role();
    newRole.name = req.body.name;
    newRole.role = req.body.role;
    //吃array
    // console.log(req.body.allows)
    //收到json格式，需array化
    newRole.allows = JSON.parse(req.body.allows);

    Role.findOne({
        role: req.body["role"]
    }, function (err, role) {
        if (err) {
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        } else if (!role) {
            newRole.save(function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        result: -1,
                        message: err
                    });
                    return;
                }
                auth.addRolePermissions(newRole.role, newRole.allows);
                res.status(201).json({
                    result: 1,
                    message: 'successful'
                });
            });
        } else {
            res.status(404).json({
                result: 0,
                message: 'Role exists'
            });
            return;
        }
    });

});

//edit role
router.post('/editRole', function (req, res) {

    if(req.body.role != 'Admin'){
        //收到json格式，需array化
        allows = JSON.parse(req.body.allows);
        Role.findOneAndUpdate({
            _id: req.body.id
        }, {
            role: req.body.role,
            allows: allows
        }, function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({
                    result: -1,
                    message: err
                });
                return;
            } else {
                auth.addRolePermissions(req.body.role, allows);
                auth.clearSessionByRole(req.body.role);
                res.status(200).json({
                    result: 1,
                    message: 'edit successful'
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

// delete role
router.post('/removeRole', function (req, res) {

    if(req.body.role != 'Admin'){
        Role.findByIdAndDelete({
            _id: req.body._id
        }, function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({
                    result: -1,
                    message: err
                });
                return;
            } else {
                auth.clearSessionByRole(req.body.role)
                auth.removeRole(req.body.role)
                //刪除資料庫中使用者角色中的被刪除角色
                User.find({}, function (err, users) {
                    if(users.length!=0){
                        checkUsersRole(User, users, req.body.role).then((status)=>{
                            if(status==-1){
                                res.status(500).json({
                                    result: -1,
                                    message: 'delete failed'
                                });
                            }else{
                                res.status(200).json({
                                    result: 1,
                                    message: 'delete successful'
                                });
                            }
                        })

                    }
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


// list role
router.post('/listRoles', function (req, res) {

    Role.find({}, function (err, roles) {
        var response = [];
        Permission.find({}, function (err, permissions) {
            roles.forEach(function (role, index, arr) {
                var new_role = {}
                new_role.allows = role.allows;
                new_role._id = role._id;
                new_role.name = role.name;
                new_role.role = role.role;
                new_role.__v = role.__v;
                new_role.allows_name = []

                new_role.allows.forEach(function (allow) {
                    permissions.forEach(function (permission) {
                        if (permission.permission == allow) {
                            new_role.allows_name.push(permission.name)
                        }
                    })
                });
                response.push(new_role)
            });
            // console.log(response)
            res.send(response);
        });
    });

});


module.exports = router;