import $ from 'jquery';
import flatpickr from "flatpickr";
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'css/index.css';
import {MandarinTraditional} from "flatpickr/dist/l10n/zh-tw.js";
import ConfirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate';

require("flatpickr/dist/themes/material_blue.css");


$(document).ready(function () {

    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

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

    var enteredForm = false;
    $("#eventACreateForm").submit(function (event) {
        if(!enteredForm) {
            enteredForm = true;
            return true;
        }
        //event.preventDefault();
        return false;
    });

    $('#reset').click(function (evt) {
        $('#cowLabels').val('');
        $('#birth').prop("checked", false);
        $('#abnormal').prop("checked", false);
        $('#normal').prop("checked", true);
        $('#cowNumbers0').prop("checked", true);
        $('#cowNumbers1').prop("checked", false);
        $('#cowNumbers2').prop("checked", false);
        $('#dailyRecord').val("");
    });

    // 手機介面 標題改成縮寫
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        // console.log("我是手機歐耶!");
        $('#tagDateTitle').html('時間');
        $('#cowLabelsTitle').html('編號');
        $('#cowNumbersTitle').html('頭數');
        $('#hardTitle').html('難易度');
        $('#dailyRecordTitle').html('紀錄');
        $('#tagDateTitle').css("font-size", '1.25rem');
    }
    // console.log("!")
});
