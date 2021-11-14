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
    var table = $('#audio_list').DataTable({
        deferRender: true,
        ajax: {
            url: '/audio/listAudioRawAll',
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
            data: "audioname",
        },
            {
                data: "starttime",
                render: function (data, type, row, meta) {
                    return moment(data).format("YYYY-MM-DD HH:mm:ss");
                }
            },
            {
                data: "endtime",
                render: function (data, type, row, meta) {
                    return moment(data).format("YYYY-MM-DD HH:mm:ss");
                }
            },
            {
                data: "microid",
            },
            {
                data: "functions",
                orderable: false,
                render: function (data, type, row, meta) {
                    var tagBtn = '<a href="/audio/edit?fileName=' + row.filePath + '&active=/audio" class="btn btn-sm btn-info">標記事件</a> ';
                    var delBtn = '<a href="javascript:void(0)" onclick="window.delEvent(\'' + row._id + '\');" class="btn btn-sm btn-danger">刪除</a>';
                    return tagBtn + delBtn;
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
            width: '15%',
            targets: 0
        }],
        "order": [
            [1, "desc"]
        ],
        // "paging": false
    });

});

window.delEvent = function (id) {
    $.ajax({
        url: "/audio/deleteAudioRaw",
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
                $('#audio_list').DataTable().ajax.reload();
            }
        },
        error: (data) => {
            // console.log(data);
            cheers.error({
                title: '錯誤',
                message: '刪除原始音檔紀錄失敗，請聯絡系統管理員！',
                alert: 'slideleft',
                icon: 'fa-times',
                duration: 3,
            });
            $('#audio_list').DataTable().ajax.reload();
        }
    });
}
