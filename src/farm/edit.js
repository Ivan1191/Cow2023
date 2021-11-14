import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'css/index.css';

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

    $('#reset').click(function (evt) {
        $('#cowLabels').val($('#tmpcowLabels').val());

        if ($('#tmpcowNumbers').val() == "0") {
            $('#cowNumbers0').prop("checked", true);
        } else if($('#tmpcowNumbers').val() == "1"){
            $('#cowNumbers1').prop("checked", true);
        } else if($('#tmpcowNumbers').val() == "2"){
            $('#cowNumbers2').prop("checked", true);
        }

        if ($('#tmphard').val() == "一般牛鳴") {
            $('#normal').prop("checked", true);
        } else if ($('#tmphard').val() == "自然分娩") {
            $('#birth').prop("checked", true);
        } else if ($('#tmphard').val() == "其他分娩"){
            $('#abnormal').prop("checked", true);
        }

        $('#dailyRecord').val($('#tmpdailyRecord').val());
    });

});


