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
    var table = $('#audioClassManage_list').DataTable({
        deferRender: true,
        ajax: {
            url: '/audioClassManage/listEventA',
            type: 'POST',
            dataSrc: function (json) {
                console.log(json);
                return json;
            },
            data: function () {
                return {};
            }
        },
        columns: [
            {
                data: "Name",
            },
            {
                data: "filePath",
            },
            {
                data: "functions",
                orderable: false,
                render: function (data, type, row, meta) {

                    var editBtn = '';
                    editBtn = '<a href="/audioClassManage/edit?id=' + row._id + '" class="btn btn-sm btn-primary">編輯</a> ';
                    var delBtn = '';
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
window.tmp = {}

//刪除按鈕功能
window.delEvent = function (id) {
    $.ajax({
        url: "/audioClassManage/deleteEventA",
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
                $('#audioClassManage_list').DataTable().ajax.reload();
            }
        },
        error: (data) => {
            // console.log(data);
            cheers.error({
                title: '錯誤',
                message: '刪除失敗，請聯絡系統管理員！',
                alert: 'slideleft',
                icon: 'fa-times',
                duration: 3,
            });
            $('#audioClassManage_list').DataTable().ajax.reload();
        }
    });
}

//現場分娩事件管理-刪除按鈕警告視窗
window.delAlert = function (id) {
    $('#audioClassManage-event-d-modal').modal({
        show: true
    });
    $('#audioClassManage-event-d-modal').on('shown.bs.modal', function (e) {
        $('#audioClassManage-event-d-modal-submit').unbind().click(function (event) {

            window.delEvent(id);
            $('#audioClassManage-event-d-modal').modal({
                show: false
            });
        });
    });
}
