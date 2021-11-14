import $ from 'jquery';
import flatpickr from "flatpickr";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'css/index.css';
import 'datatables.net-bs4';
import 'datatables.net-select';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';
import cheers from 'cheers-alert';
import 'cheers-alert/src/cheers-alert.css'; //load style
import 'font-awesome/css/font-awesome.min.css'; //load font-awesome
import {MandarinTraditional} from "flatpickr/dist/l10n/zh-tw.js";
import ConfirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate';

var moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");
require("flatpickr/dist/themes/material_blue.css");


$(document).ready(function () {
    var enTime = true;
    if (document.getElementById('view') !== null) {
        $('#tagDateTmp').val($('#tagDateTmp').val());
    } else {
        if ($('#tagDateTmp').val() == "") {
            flatpickr("#tagDate", {
                enableTime: true,
                dateFormat: "Y-m-d H:i:S",
                locale: MandarinTraditional,
                defaultDate: new Date(),
                disableMobile: "true",
                plugins: [new ConfirmDatePlugin({
                    confirmIcon: "<i class='fa fa-check'></i>",
                    confirmText: "OK",
                    showAlways: true,
                })],
            });
        } else {
            flatpickr("#tagDate", {
                enableTime: true,
                dateFormat: "Y-m-d H:i:S",
                locale: MandarinTraditional,
                defaultDate: new Date($('#tagDateTmp').val()),
                disableMobile: "true",
                plugins: [new ConfirmDatePlugin({
                    confirmIcon: "<i class='fa fa-check'></i>",
                    confirmText: "OK",
                    showAlways: true,
                    theme: "dark",
                })],
            });
        }
    }
    let formData = {};
    formData["filePath"] = $("#filePath").val();
    formData["loginID"] = $("#loginID").val();
    // console.log("***********produce wave form*********");
    // console.log(formData["filePath"]);
    // console.log('***********produce wave form*********');
    $.ajax({
        url: "/audio/waveform",
        type: "POST",
        data: formData,

        success: (res) => {
            // console.log('------F waveform res---------');
            loadWaveForm(formData["filePath"], res["wavefromPath"], $("#tagPointTime").val());
            // console.log('--------------------------------');
        },
        // error: (data) => {
        //   $("#alert-box").show();
        // }
    });

    window.addEventListener('beforeunload', function (event) {
        var lastAction = document.activeElement.value;
        var test = true;
        // 不用將檔案改為eventId，可以直接刪暫存檔
        if (lastAction != "確定新增" && lastAction != "確定編輯") {
            formData["filePath"] = $('#initFilePath').val();
            $.ajax({
                url: '/audio/clearCurrentTmp',
                type: "POST",
                data: formData,
                success: (res) => {
                },
                error: (data) => {
                }
            })
        }
    });

    window.onunload = (event) => {
    }

    // 防止表單重複送出
    var enteredForm = false;
    $("#eventBCreateForm").submit(function (event) {
        event.preventDefault();
        if (!enteredForm) {
        var form = $(this);
        var url = "/audio/createEventB";
        $.ajax({
           type: "POST",
           url: url,
           data: form.serialize(), // serializes the form's elements.
           async:false,
           success: function(data)
           {
                enteredForm = true;
                window.location = "/pro";
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
        //event.preventDefault();
        //return false;
    });

    // 裁切
    var entered = false;
    $("#cutAudio").click(function (event) {
        if (entered) {
            return false;
        }
        entered = true;
        getPointsTime();
        let formData = {};
        formData["startPointTime"] = $("#startPointTime").val();
        formData["endPointTime"] = $("#endPointTime").val();
        formData["filePath"] = $("#filePath").val();
        formData["loginID"] = $('#loginID').val();
        var newTagPointTime = $("#tagPointTime").val();
        if (formData["startPointTime"] === formData["endPointTime"]) {
            entered = false;
            return false;
        }

        if (newTagPointTime) {
            if (formData["startPointTime"] || formData["endPointTime"]) // invaild tagPoint
            {
                if (formData["startPointTime"] && (parseFloat(newTagPointTime) - parseFloat(formData["startPointTime"])) < 0) {
                    newTagPointTime = "";
                }
                if (formData["endPointTime"] && (parseFloat(newTagPointTime) - parseFloat(formData["endPointTime"])) > 0) {
                    newTagPointTime = "";
                }
            }
            if (newTagPointTime && formData["startPointTime"]) {
                newTagPointTime = parseFloat(newTagPointTime) - parseFloat(formData["startPointTime"]);
            }
        }

        $.ajax({
            // req
            url: "/audio/cut",
            type: "POST",
            data: formData,

            // res
            success: (res) => {
                // console.log(res);
                let success = res["result"];
                if (success == 1) {
                    // remove peaksInatance old points
                    destoryPeaksInstance();
                    loadWaveForm(res["filePathNew"], res["wavefromPath"], newTagPointTime);
                    $("#filePath").val(res["filePathNew"]);
                    var a = new Date(document.getElementById("zeroDate").value);
                    var b = new Date(document.getElementById("zeroDate").value);
                    var c = new Date(a.setTime(a.getTime()+ (res["startTimeNew"]*1000)));
                    var d = new Date(b.setTime(b.getTime()+ (res["endTimeNew"]*1000)));
                    document.getElementById("zeroDate").value = c;
                    document.getElementById("tenDate").value = d;

                    entered = false;
                }
            },
        });
        return false;
    });


    $('#edit_reset').click(function (evt) {
        $('#cowLabels').val($('#tmpcowLabels').val());
        $('#cowNumbers').val($('#tmpcowNumbers').val());
        if ($('#tmpcowNumbers').val() == "0") {
            $('#cowNumbers0').prop("checked", true);
        } else if($('#tmpcowNumbers').val() == "1"){
            $('#cowNumbers1').prop("checked", true);
        } else if($('#tmpcowNumbers').val() == "2"){
            $('#cowNumbers2').prop("checked", true);
        } else {
            $('#cowNumbers0').prop("checked", true);
        }
        if ($('#tmphard').val() == "一般牛鳴") {
            $('#normal').prop("checked", true);
        } else if ($('#tmphard').val() == "自然分娩") {
            $('#birth').prop("checked", true);
        } else if ($('#tmphard').val() == "其他分娩"){
            $('#abnormal').prop("checked", true);
        } else {
            $('#normal').prop("checked", true);
        }
        $('#dailyRecord').val($('#tmpdailyRecord').val());
        $('#zeroDate').val($('#tmpzeroDate').val());
        $('#tenDate').val($('#tmptenDate').val());

        let formData = {};
        formData["loginID"] = $('#loginID').val();
        formData["filePath"] = $('#initFilePath').val();
        $.ajax({
            // req
            url: "/audio/waveform",
            type: "POST",
            data: formData,

            // res
            success: (res) => {
                let success = res["result"];
                if (success == 1) {
                    $("#filePath").val($('#initFilePath').val());
                    destoryPeaksInstance();
                    loadWaveForm($('#initFilePath').val(), res["wavefromPath"], $('#initTagPointTime').val());
                }
            },
        });

    });

    $('#create_reset').click(function (evt) {

        $('#cowLabels').val('');
        $('#cowNumbers0').prop("checked", true);
        $('#normal').prop("checked", true);
        $('#dailyRecord').val('');

        let formData = {};
        formData["loginID"] = $('#loginID').val();
        formData["filePath"] = $('#initFilePath').val();
        $('#zeroDate').val($('#tmpzeroDate').val());
        $('#tenDate').val($('#tmptenDate').val());

        $.ajax({
            // req
            url: "/audio/waveform",
            type: "POST",
            data: formData,

            // res
            success: (res) => {
                let success = res["result"];
                if (success == 1) {
                    $("#filePath").val($('#initFilePath').val());
                    destoryPeaksInstance();
                    loadWaveForm($('#initFilePath').val(), res["wavefromPath"], $('#initTagPointTime').val());
                }
            },
        });

    });

    $('#rightArrow').click(function(){
        // console.log("你按了右邊的箭頭");
        formData["filePath"] = $("#filePath").val();
        formData["loginID"] = $('#loginID').val();
        $.ajax({
            // req
            url: "/audio/loadRight",
            type: "POST",
            data: {
                zeroDate: $('#zeroDate').val(),
                tenDate: $('#tenDate').val(),
                filePath: $("#filePath").val(),
                loginID: $('#loginID').val()
            },

            // res
            success: (res) => {
                // console.log(res);
                let success = res["result"];
                if (success == 1) {
                    // remove peaksInatance old points
                    destoryPeaksInstance();
                    loadWaveForm(res["filePathNew"], res["wavefromPath"]);
                    $("#filePath").val(res["filePathNew"]);
                    document.getElementById("zeroDate").value = new Date(res['startTimeNew']);
                    document.getElementById("tenDate").value = new Date(res['endTimeNew']);

                    entered = false;
                }else if(success == -1){
                    cheers.error({
                        title: '錯誤',
                        message: "無法取得後10分鐘的音檔",
                        alert: 'slideleft',
                        icon: 'fa-times',
                        duration: 3,
                    });
                }
            },
        });

    })

    $('#leftArrow').click(function(){
        // console.log("你按了左邊的箭頭")
        $.ajax({
            // req
            url: "/audio/loadLeft",
            type: "POST",
            data: {
                zeroDate: $('#zeroDate').val(),
                tenDate: $('#tenDate').val(),
                filePath: $("#filePath").val(),
                loginID: $('#loginID').val()
            },

            // res
            success: (res) => {
                // console.log("嗨你好，要開心一點");
                // console.log(res);
                // console.log("天氣好好勒");
                let success = res["result"];
                if (success == 1) {
                    // remove peaksInatance old points
                    destoryPeaksInstance();
                    loadWaveForm(res["filePathNew"], res["wavefromPath"]);
                    $("#filePath").val(res["filePathNew"]);
                    document.getElementById("zeroDate").value = new Date(res['startTimeNew']);
                    document.getElementById("tenDate").value = new Date(res['endTimeNew']);
                    // console.log("天氣好好勒天氣好好勒");

                    entered = false;
                }else if(success == -1){
                    cheers.error({
                        title: '錯誤',
                        message: "無法取得前10分鐘的音檔",
                        alert: 'slideleft',
                        icon: 'fa-times',
                        duration: 3,
                    });
                }
            },
        });


    })

    $('#filter_send').click(function(){
        $('#editor-event-l-modal').modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });

        var filterType = $("#filterType").val();

        $.ajax({
            // req
            url: "/audio/filter",
            type: "POST",
            data: {
                filterType: $("#filter").val(),
                filePath: $("#filePath").val(),
                loginID: $('#loginID').val()
            },

            // res
            success: (res) => {
                let success = res["result"];
                if (success == 1) {
                    // console.log("55555");
                    // console.log(res);
                    // remove peaksInatance old points
                    destoryPeaksInstance();
                    loadWaveForm(res["filePathNew"], res["wavefromPath"]);
                    $("#filePath").val(res["filePathNew"]);
                    entered = false;
                    $('#editor-event-l-modal').modal('hide')
                    cheers.success({
                        title: '成功',
                        message: "恭喜您成功率波",
                        alert: 'slideleft',
                        icon: 'fa-check',
                        duration: 3,
                    });
                }else if(success == -1){
                    $('#editor-event-l-modal').modal('hide')
                    cheers.error({
                        title: '錯誤',
                        message: "濾波錯誤",
                        alert: 'slideleft',
                        icon: 'fa-times',
                        duration: 3,
                    });
                }
            },
        });

    });
});
