var express = require('express');
var router = express.Router();
var path = require('path');
var isLoggedIn = true;
var rimraf = require("rimraf");

const getSize = require('get-folder-size');

/* GET persoal information page. */

router.get('/', function (req, res, next) {
  var appDir = path.dirname(require.main.filename);
  getSize("D:/producedAudio/tmp", (err, size) => {

    if (err) {
      res.render('backstage', {
        title: '可視化操作介面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        active: '/backstage',
        permissions: req.session.permissions,
        role: req.session.role,
        capacity: '0 MB',
      });
     }else{
      var folderCapacity = (size / 1024 / 1024).toFixed(2) + ' MB';
      // console.log(size + ' bytes');
      // console.log((size / 1024 / 1024).toFixed(2) + ' MB');
      res.render('backstage', {
        title: '可視化操作介面',
        loginID: req.session.loginID,
        userName: req.session.userName,
        isLoggedIn: isLoggedIn,
        active: '/backstage',
        permissions: req.session.permissions,
        role: req.session.role,
        capacity: folderCapacity,
      });
     }

  });

});

router.post('/clear', function (req, res) {
  var appDir = path.dirname(require.main.filename);
  rimraf("D:/producedAudio/tmp", function () { console.log("[Clear temp files] Fin."); });
  res.redirect('/backstage')
});

module.exports = router;
