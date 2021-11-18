import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'css/index.css';
import 'datatables.net-bs4';
import 'datatables.net-select';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';
import cheers from 'cheers-alert';
import 'cheers-alert/src/cheers-alert.css'; //load style
import 'font-awesome/css/font-awesome.min.css'; //load font-awesome
import GHelper from 'ghelper.js';

var moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");
var bcrypt = require('bcryptjs');
var userInfoCheck = require('../../userInfoCheck');
var auth = require('../../auth');

$(document).ready(function () {
    $("#alert-box").hide();
    var table = $('#user_list').DataTable({
        deferRender: true,
        ajax: {
            url: '/user/all',
            type: 'POST',
            dataSrc: function (json) {
                // console.log(json);
                return json;
            },
            data: function () {
                return {};
            }
        },
        columns: [{
            data: "userName",
        },
            {
                data: "loginID",
            },
            {
                data: "email",
            },
            {
                data: "tel",
            },
            {
                data: "title",
            },
            {
                data: "dept",
            },
            {
                data: "roles_name",
            },
            {
                data: "line_token",
            },
            {
                data: "functions",
                orderable: false,
                render: function (data, type, row, meta) {
                    loginIDmap[row._id] = row.loginID;
                    if(row.loginID != 'admin'){
                        var editBtn = '<a href="/user/edit?id=' + row._id + '" class="btn btn-sm btn-primary">編輯</a> ';
                        var delBtn = '<a href="javascript:void(0)" onclick="window.delEvent(\'' + row._id + '\');" class="btn btn-sm btn-danger">刪除</a>';
                        return editBtn + delBtn;
                    }else{
                        return "";
                    }
                }
            },
        ],
        "language": GHelper.datatable_zh_tw(),
        searching: false,
        pageLength: 10,
        select: false,
        pagingType: "full_numbers",
        scrollY: "40vh",
        scrollX: true,
        scrollCollapse: true,
        columnDefs: [{
            width: '10%',
            targets: 0
        }],
        "order": [
            [0, "desc"]
        ],
        // "paging": false
    });
    reminder();
});

window.loginIDmap = []

window.delEvent = function (id) {
    $.ajax({
        url: "/user/delete",
        type: "POST",
        data: {
            _id: id,
            loginID: loginIDmap[id]
        },
        success: (data) => {
            if (data.result) {
                cheers.success({
                    title: '訊息',
                    message: data.message,
                    alert: 'slideleft',
                    icon: 'fa-check',
                    duration: 3,
                });
                $('#user_list').DataTable().ajax.reload();
            }
        },
        error: (data) => {
            // console.log(data);
            cheers.error({
                title: '錯誤',
                message: '刪除系統使用者失敗，請聯絡系統管理員！',
                alert: 'slideleft',
                icon: 'fa-times',
                duration: 3,
            });
            $('#user_list').DataTable().ajax.reload();
        }
    });
}

setInterval( function() {
    reminder()        
},5000)

function reminder(){
    $.ajax({
        url:'/user/thermal_reminder',
        method:'POST',
        data:function () {
        },    
        success:function(res){
            if(res){
                // console.log("thermal")
                document.getElementById("light").src="/red.png"
            }else{
                document.getElementById("light").src="/blue.png"
            }
        },
        error:function(err){console.log('thermal_reminder_err')},
    });
    $.ajax({
        url:'/user/specialsound_reminder',
        method:'POST',
        data:function () {
        },    
        success:function(res){
            if(res){
                // console.log("special")
                alert('牛隻叫聲異常');
            }
        },
        error:function(err){console.log('specialsound_reminder_err')},
    });
}

