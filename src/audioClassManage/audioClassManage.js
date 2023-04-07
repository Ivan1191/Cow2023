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
    var table = $('#farm_list').DataTable({
        deferRender: true,
        ajax: {
            url: '/farm/listEventA',
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
                data: "functions",
                orderable: false,
                render: function (data, type, row, meta) {
                    
                    window.tmp[row._id] = row.audiocut


                    var tagBtn = '<a href="javascript:void(0)" onclick="window.tagEvent(\'' + row._id + '\');" class="btn btn-sm btn-info">標記事件</a> ';
                    var editBtn = '';
                    if (($('#loginID').val() === row.createdAuthor))
                        editBtn = '<a href="/farm/edit?id=' + row._id + '" class="btn btn-sm btn-primary">編輯</a> ';
                    // var delBtn = '<a href="javascript:void(0)" onclick="window.delEvent(\'' + row._id + '\');" class="btn btn-sm btn-danger">刪除</a>';
                    var delBtn = '';
                    if (($('#loginID').val() === row.createdAuthor))
                        delBtn = '<a href="javascript:void(0)" onclick="window.delAlert(\'' + row._id + '\');" class="btn btn-sm btn-danger">刪除</a>';
                    if($('#role').val()=="管理員"){
                        return tagBtn + editBtn + delBtn;
                    } else if($('#permissions').val().split(",").includes('/audio')) {
                        return tagBtn + delBtn;
                    } else {
                        return editBtn + delBtn;
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
//現場分娩事件管理-標記事件功能
window.tagEvent = function (id) {
    //取出按下那一欄位之資料
    // console.log(window.tmp[id])
    var obj = []
    if (!window.tmp[id]) {
        cheers.error({
            title: '錯誤',
            message: '無麥克風音檔！',
            alert: 'slideleft',
            icon: 'fa-times',
            duration: 3,
        });
    } else {
        var keys = Object.keys(window.tmp[id]);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            obj.push(window.tmp[id][key]);
        }
        obj.forEach(function (val) {
            // console.log(val)
        })
        //跳出modal選單，選擇音檔
        $.ajax({
            url: "/farm/select_file",
            type: "POST",
            data: {
                id: id,
                fileList: JSON.stringify(obj)
            },
            success: (data) => {

                //console.log(data);
                $('body').append(data);
                $('#farm-event-a-modal').on('hidden.bs.modal', function (e) {
                    $('#farm-event-a-modal').remove();
                });

                $('#farm-event-a-modal').on('shown.bs.modal', function (e) {
                    $('#farm-event-a-modal-submit').unbind().click(function (event) {
                        var file = $('input[name=audio_file_name]:checked').val();
                        if (file == undefined) {
                            cheers.error({
                                title: '錯誤',
                                message: '請選擇音訊檔案！',
                                alert: 'slideleft',
                                icon: 'fa-times',
                                duration: 3,
                            });
                        } else {
                            $.ajax({
                                url: "/farm/checkFileExist",
                                type: "POST",
                                data: {
                                    fileName: file
                                },
                                success: (data) => {
                                    window.location = '/audio/edit?fileName=' + file + '&active=/farm&_id=' + id;
                                },
                                error: (data) => {
                                    // console.log("錯了!");
                                    // console.log(data);
                                    cheers.error({
                                        title: '錯誤',
                                        message: data.responseJSON.message,
                                        alert: 'slideleft',
                                        icon: 'fa-times',
                                        duration: 3,
                                    });
                                }
                            });
                        }

                    });
                });

                $('#farm-event-a-modal').modal({
                    show: true
                });
            },
            error: (data) => {
                cheers.error({
                    title: '錯誤',
                    message: data.responseJSON.message,
                    alert: 'slideleft',
                    icon: 'fa-times',
                    duration: 3,
                });
                $('#farm_list').DataTable().ajax.reload();
                // console.log(data);
            }
        });
    }

}
//現場分娩事件管理-刪除按鈕功能
window.delEvent = function (id) {
    $.ajax({
        url: "/farm/deleteEventA",
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
                $('#farm_list').DataTable().ajax.reload();
            }
        },
        error: (data) => {
            // console.log(data);
            cheers.error({
                title: '錯誤',
                message: '刪除現場分娩事件失敗，請聯絡系統管理員！',
                alert: 'slideleft',
                icon: 'fa-times',
                duration: 3,
            });
            $('#farm_list').DataTable().ajax.reload();
        }
    });
}
//現場分娩事件管理-刪除按鈕警告視窗
window.delAlert = function (id) {
    $('#farm-event-d-modal').modal({
        show: true
    });
    $('#farm-event-d-modal').on('shown.bs.modal', function (e) {
        $('#farm-event-d-modal-submit').unbind().click(function (event) {
            
            window.delEvent(id);
            $('#farm-event-d-modal').modal({
                show: false
            });
        });
    });
}