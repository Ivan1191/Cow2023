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
var userInfoCheck = require('./../userInfoCheck');

$(document).ready(function () {

    // set modal option list
    function setOption(data) {
        //editOptList
        //optList

        var editOptList = $('#editOptList')
        var optList = $('#optList')


        data.forEach(function (opt) {
            // editOptList.append('<input type="checkbox" value="' + opt['permission'] + '"> ' + opt['name'] + '( ' + opt['permission'] + ' )' + '</input><br>');
            // optList.append('<input type="checkbox" value="' + opt['permission'] + '"> ' + opt['name'] + '( ' + opt['permission'] + ' )' + '</input><br>');
            editOptList.append('<input type="checkbox" value="' + opt['permission'] + '"> ' + opt['name'] + '</input><br>');
            optList.append('<input type="checkbox" value="' + opt['permission'] + '"> ' + opt['name'] + '</input><br>');
        })
    }

    $.ajax({
        url: "role/listOperation",
        type: "POST",
        success: (data) => {
            setOption(data);
        },
        error: (data) => {
            $("#alert-box").show();
        }
    });


    $("#alert-box").hide();
    var table = $('#role_list').DataTable({
        deferRender: true,
        ajax: {
            url: '/role/listRoles',
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
            data: "name",
        },
            {
                data: "role",
            },
            {
                data: "allows_name",
            },
            {
                data: "functions",
                orderable: false,
                render: function (data, type, row, meta) {
                    if(row.role != 'Admin'){
                        window.roleDataList[row._id] = row
                        var editBtn = '<a href="javascript:void(0)" onclick="window.editEvent(\'' + row._id + '\');" class="btn btn-sm btn-primary">編輯</a> ';
                        var delBtn = '<a href="javascript:void(0)" onclick="window.delEvent(\'' + row._id + '\');" class="btn btn-sm btn-danger">刪除</a>';
                        return editBtn + delBtn;
                    }else{
                        return "";
                    }
                }
            }
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

    $('#createModal').click(function () {
        $('#CreateRolesModal').modal('show');
    })

    //modal event

    $('#create').click(function () {
        $("#alert-unfinished").hide();
        $("#alert-alerady-exist").hide();
        let formData = {};
        formData["name"] = $("#name").val();
        formData["role"] = $("#rolerole").val();
        //get selected option optCheckbox
        formData["allows"] = []
        $("#optList input:checked").each(function () {
            // console.log(this)
            formData["allows"].push(this.value)
        });
        //ajax post object 需 jsonify
        formData["allows"] = JSON.stringify(formData["allows"])
        // console.log(formData["allows"])

        $.ajax({
            // TODO:
            url: "role/addRole",
            type: "POST",
            data: formData,
            success: (data) => {
                // console.log(data);
                let success = data["result"];
                if (success == 1) {
                    // console.log("succeed creating");
                    window.location.replace("/role");
                }
            },
            error: (data) => {
                $("#alert-alerady-exist").show();
            }
        });
    });

    $('#edit').click(function () {
        let formData = {};
        formData["name"] = $("#editName").val();

        //get selected option optCheckbox
        formData["allows"] = []
        $("#editOptList input:checked").each(function () {
            // console.log(this)
            formData["allows"].push(this.value)
        });
        //ajax post object 需 jsonify
        formData["allows"] = JSON.stringify(formData["allows"])
        // console.log(formData["allows"])

        formData["role"] = $("#editRoleRole").val();
        formData["id"] = $("#edit_id").val();
        // console.log(formData["allows"])
        $.ajax({
            // TODO:
            url: "role/editRole",
            type: "POST",
            data: formData,
            success: (data) => {
                // console.log(data);
                let success = data["result"];
                if (success == 1) {
                    // console.log("succeed edit");
                    // console.log(formData["role"]);
                    window.location.replace("/role");
                }
            },
            error: (data) => {
                $("#alert-alerady-exist").show();
            }
        });
    });

});

window.roleDataList = [];

window.delEvent = function (id) {
    $.ajax({
        url: "/role/removeRole",
        type: "POST",
        data: {
            _id: id,
            role: window.roleDataList[id]['role']
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
                $('#role_list').DataTable().ajax.reload();
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
            $('#role_list').DataTable().ajax.reload();
        }
    });
}

window.editEvent = function (id) {
    // console.log(window.roleDataList)
    var roleData = window.roleDataList[id]
    $('#EditRoleModal').modal('show');
    $('#editName').val(roleData['name']);
    $('#editRoleRole').val(roleData['role']);
    $('#edit_id').val(roleData['_id']);
    //勾起原本擁有的權限

    $("#editOptList input[type=checkbox]").each(function () {
        // console.log(this.value)
        // console.log(roleData['allows'])
        // console.log(roleData['allows'].includes(this.value))
        // console.log('--------------------------')
        if (roleData['allows'].includes(this.value)) {
            $(this).prop('checked', true)
        } else {
            $(this).prop('checked', false)
        }
    });
}