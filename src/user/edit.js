import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'css/index.css';
import 'datatables.net-bs4';
import 'datatables.net-select';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';
import 'cheers-alert/src/cheers-alert.css'; //load style
import 'font-awesome/css/font-awesome.min.css'; //load font-awesome
import cheers from 'cheers-alert';

var moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");
var bcrypt = require('bcryptjs');
var userInfoCheck = require('../../userInfoCheck');
var auth = require('../../auth');
var sha256 = require('js-sha256');

$(document).ready(function () {
    $('#selectRole').click(function () {
        $('#selectRoleModal').modal('show');
    })

    $.ajax({
        url: "/role/listRoles",
        type: "POST",
        success: (data) => {
            setOption(data);
        },
        error: (data) => {
            $("#alert-box").show();
        }
    });

    function setOption(data) {

        var roleOptList = $('#roleOptList')
        var userRoles = JSON.parse($('#roles').val())
        // console.log(userRoles)
        data.forEach(function (role) {
            if (userRoles.includes(role['role'])) {
                // console.log(role)
                roleOptList.append('<input type="checkbox" value="' + role['role'] + '" id="' + role['name'] + '" checked> ' + role['name'] + '<br>');
            } else {
                roleOptList.append('<input type="checkbox" value="' + role['role'] + '" id="' + role['name'] + '"> ' + role['name'] + '<br>');
            }
        })

    }

    $('#confirm').click(function () {
        var roles = [];
        var roles_name = [];
        $('#selectRoleModal').modal('hide');
        $("#roleOptList input:checked").each(function () {
            roles.push(this.value)
            roles_name.push(this.id)
            // console.log(this)
        });
        // console.log(roles)
        $('#uf_roles').val(roles_name)
        $('#roles').val(JSON.stringify(roles));
    });

});

window.validateUserInfo = function () {
    var raw_password = $('#password').val();
    var confirm_password = $('#confirm_password').val();

    //confirm username
    if(!$('#uf_name').val() != ''){
        cheers.error({
            title: '錯誤',
            message: '請確帳號格式！',
            alert: 'slideleft',
            icon: 'fa-times',
            duration: 3,
        });
        return false;
    }


    if($('#uf_roles').val() == ''){
        cheers.error({
            title: '錯誤',
            message: '請至少選擇一個角色！',
            alert: 'slideleft',
            icon: 'fa-times',
            duration: 3,
        });
        return false;
    }

    if(raw_password != '' || confirm_password != ''){
        if (raw_password != confirm_password) {
            cheers.error({
                title: '錯誤',
                message: '兩次輸入密碼不同！',
                alert: 'slideleft',
                icon: 'fa-times',
                duration: 3,
            });
            return false;
        }


        //confirm password
        const paswd = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
        if(!raw_password.match(paswd)){
            cheers.error({
                title: '錯誤',
                message: '請確認密碼格式，長度為6至20字元且須包含至少一個數字、一個大寫英文字、一個小寫英文字！',
                alert: 'slideleft',
                icon: 'fa-times',
                duration: 3,
            });
            return false;
        }


        // do hash
        var hashed_password = bcrypt.hashSync(sha256(raw_password), 8)
        $('#password').val(hashed_password);
        $('#confirm_password').val(hashed_password);

    }

    //email check
    const email_regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    var email = $('#uf_email').val();
    if(!email.match(email_regex)){
        cheers.error({
            title: '錯誤',
            message: '請確認電子信箱格式！',
            alert: 'slideleft',
            icon: 'fa-times',
            duration: 3,
        });
        return false;
    }

    //phone number check
    const cell_regex = /^[0-9]{8,12}$/;
    var tel = $('#uf_phone').val();
    if(!tel.match(cell_regex)){
        cheers.error({
            title: '錯誤',
            message: '請確認電話格式！（範例：0912345678）',
            alert: 'slideleft',
            icon: 'fa-times',
            duration: 3,
        });
        return false;
    }

    return true
}