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
        $('#Name').val('');
        $('#MicId').val('');
        $('#filePath').val('');
    });

    //讓使用者知道設定的資料夾麥克風編號如何
    $('#filePath').on('change', function () {
        var ori_text = $('#filePath').val().slice(-1);
        var text = '';
        switch (ori_text) {
            case '1':
                text = 'a';
                break;
            case '2':
                text = 'b';
                break;
            default:
                text = 'c';
                break;
        }
        $('#MicId').val(text);
    });
});
