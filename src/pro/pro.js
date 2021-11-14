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

$(document).ready(function () {
    if ($("#errorMessage") !== undefined) {
        var errorMessage = $("#errorMessage").val();
        if (errorMessage) {
            cheers.error({
                title: '錯誤',
                message: errorMessage,
                alert: 'slideleft',
                icon: 'fa-times',
                duration: 3,
            });
        }
    }
    var table = $('#pro_list').DataTable({
        deferRender: true,
        ajax: {
            url: '/pro/listEventB',
            type: 'POST',
            dataSrc: function (json) {
                // console.log(json);
                return json;
            },
            data: function () {
                return {};
            }
        },
        columns: [
            {
                data: "tagDate",
                render: function (data, type, row, meta) {
                    return moment(data).format("YYYY-MM-DD HH:mm:ss");
                }
            },
            {
                data: "cowLabels",
            },
            {
                data: "cowNumbers",
            },
            {
                data: "hard",
            },
            {
                data: "dailyRecord",
            },
            {
                data: "fileName",
            },
            {
                data: "microId",
            },
            {
                data: "audioStart",
                render: function (data, type, row, meta) {
                    var datas = data.split('_');
                    var minutes = Math.floor(parseInt(datas[1])/60) < 10? "0"+ Math.floor(parseInt(datas[1])/60).toString() : Math.floor(parseInt(datas[1])/60).toString();
                    var seconds = (parseInt(datas[1])%60) < 10? "0"+(parseInt(datas[1])%60).toString() : (parseInt(datas[1])%60).toString();
                    return datas[0] + "_" + minutes + ":" + seconds;
                }
            },
            {
                data: "audioEnd",
                render: function (data, type, row, meta) {
                    var datas = data.split('_');
                    var minutes = Math.floor(parseInt(datas[1])/60) < 10? "0"+ Math.floor(parseInt(datas[1])/60).toString() : Math.floor(parseInt(datas[1])/60).toString();
                    var seconds = (parseInt(datas[1])%60) < 10? "0"+(parseInt(datas[1])%60).toString() : (parseInt(datas[1])%60).toString();
                    return datas[0] + "_" + minutes + ":" + seconds;
                }
            },
            {
                data: "functions",
                orderable: false,
                render: function (data, type, row, meta) {
                    var editBtn = '<a href="/audio/view?fileName=' + row.filePath + '&active=/pro&_id=' + row._id + '" class="btn btn-sm btn-success">檢視</a> ';
                    if (($('#loginID').val() === row.createdAuthor))
                        editBtn = '<a href="/audio/edit?fileName=' + row.filePath + '&active=/pro&_id=' + row._id + '" class="btn btn-sm btn-primary">編輯</a> ';
                    var delBtn = '';
                    if (($('#loginID').val() === row.createdAuthor))
                        delBtn = '<a href="javascript:void(0)" onclick="window.delAlert(\'' + row._id + '\');" class="btn btn-sm btn-danger">刪除</a>';
                    return editBtn + delBtn;
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
            width: '18%',
            targets: 0
        }],
        "order": [
            [0, "desc"]
        ],
        // "paging": false
    });
});

//專家標記之分娩事件管理-刪除按鈕
window.delEvent = function (id) {
    $.ajax({
        url: "/pro/deleteEventB",
        type: "POST",
        data: {
            id: id
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
                $('#pro_list').DataTable().ajax.reload();
            }
        },
        error: (data) => {
            // console.log(data);
            cheers.error({
                title: '錯誤',
                message: '刪除專家標記之分娩事件失敗，請聯絡系統管理員！',
                alert: 'slideleft',
                icon: 'fa-times',
                duration: 3,
            });
            $('#pro_list').DataTable().ajax.reload();
        }
    });
}

//專家標記之分娩事件管理-刪除按鈕警告視窗
window.delAlert = function (id) {
    $('#pro-event-d-modal').modal({
        show: true
    });
    $('#pro-event-d-modal').on('shown.bs.modal', function (e) {
        $('#pro-event-d-modal-submit').unbind().click(function (event) {
            window.delEvent(id);
            $('#pro-event-d-modal').modal({
                show: false
            });
        });
    });
}