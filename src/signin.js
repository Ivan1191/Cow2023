import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'css/signin.css';
import cheers from 'cheers-alert';
import 'cheers-alert/src/cheers-alert.css'; //load style
import 'font-awesome/css/font-awesome.min.css'; //load font-awesome
var bcrypt = require('bcryptjs');
var sha256 =require('js-sha256');

function setChooseRoleForm(dist) {
    $("#form-chooseRole").submit(() => {
        let formData = {};
        formData["role"] = $('#uf_role').val()
        $.ajax({
            url: "/chooseRole",
            type: "POST",
            data: formData,
            success: (data) => {
                let success = data["result"];
                if (success == 1) {
                    // console.log("succeed login");
                    window.location.replace(data['dist'])
                }
            },
            error: (data) => {
                cheers.error({
                    title: '錯誤',
                    message: '錯誤的角色',
                    alert: 'slideleft',
                    icon: 'fa-times',
                    duration: 3,
                });
            }
        });
        return false;
    });
}

$(document).ready(function () {
    var errorMessage = $("#error").val();
    if(errorMessage){
        cheers.error({
            title: '錯誤',
            message: errorMessage,
            alert: 'slideleft',
            icon: 'fa-times',
            duration: 3,
        });
    }


    $("#form-signin").submit(() => {
        let formData = {};
        formData["loginID"] = $("#inputUsername").val();
        formData["password"] = sha256($("#inputPassword").val());
        $.ajax({
            url: "/signin",
            type: "POST",
            data: formData,
            success: (data) => {
                // console.log(data);
                $('#container').html(data);
                setChooseRoleForm();
                let success = data["result"];
                if (success == 1) {
                    // console.log("succeed login");
                }
            },
            error: (data) => {

                cheers.error({
                    title: '錯誤',
                    message: JSON.parse(data.responseText)['message'],
                    alert: 'slideleft',
                    icon: 'fa-times',
                    duration: 3,
                });
            }
        });
        return false;
    });

});
