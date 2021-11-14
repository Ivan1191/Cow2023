var express = require('express');
var router = express.Router();
var auth = require('../auth');
var User = require('../models/user');
var Role = require('../models/role');
var bcrypt = require('bcryptjs');
var isLoggedIn = true;
/* GET persoal information page. */
router.get('/', function (req, res, next) {

    User.findOne({
        'loginID': req.session.loginID
    }, '-password', function (err, user) {
        if (!user) {
            res.redirect(204, '/profile');
        } else {
            Role.find({}, function (err, roles) {
                var roleName = []
                user.roles.forEach(function (role) {
                    roles.forEach(function (obj) {
                        if (obj.role == role) {
                            roleName.push(obj.name)
                        }
                    })
                })
                // console.log(roleName);
                if (roles.length) {
                    res.render('profile', {
                        title: '可視化操作介面',
                        loginID: req.session.loginID,
                        userName: req.session.userName,
                        isLoggedIn: isLoggedIn,
                        user: user,
                        roleName: roleName,
                        active: '/profile',
                        permissions: req.session.permissions,
                        role: req.session.role,
                    });
                } else {
                    res.redirect(204, '/profile');
                }
            });
        }
    });
});


/* POST user's data and update */
router.post('/edit', function (req, res) {

    var updateObj = {
        userName: req.body.userName,
        email: req.body.email,
        tel: req.body.tel,
        title: req.body.title,
        dept: req.body.dept,
        line_token: req.body.line_token
    }

    if (req.body.password == '') {
        delete updateObj['password']
    }else{
        updateObj['password'] = req.body.password
    }

    User.findOneAndUpdate({
        loginID: req.session.loginID
    }, updateObj, function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({
                result: -1,
                message: err
            });
            return;
        } else {
            res.redirect('/profile')
        }
    });
});


module.exports = router;
