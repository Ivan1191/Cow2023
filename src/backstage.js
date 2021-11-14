import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'css/index.css';
import 'datatables.net-bs4';
import 'datatables.net-select';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';
import 'cheers-alert/src/cheers-alert.css'; //load style
import 'font-awesome/css/font-awesome.min.css'; //load font-awesome

var moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");
var bcrypt = require('bcryptjs');
var userInfoCheck = require('./../userInfoCheck');
var auth = require('./../auth');
var sha256 = require('js-sha256');

$(document).ready(function () {
    
});
