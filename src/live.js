import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'css/index.css';
import 'font-awesome/css/font-awesome.min.css'; //load font-awesome
import 'datatables.net-bs4';
import 'datatables.net-select';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';
import 'dist/css/chart.css';
import 'dist/js/chart.min.js';
import 'css/chart.css';
import 'moment';

var camerafield = require('../models/camerafield');

import GHelper from 'ghelper.js';


$(document).ready(function () {

    // var select = $('#camerafieldsSelect');
    // $('option', select).remove();

    $.ajax({
        url: "/live/camerafieldsSelect",
        type: "POST",
        success: (data) => {
            console.log(data);
            var select = $('#camerafieldsSelect');
            $('option', select).remove();
            data.row.forEach(function (row) {
                var option = new Option(row.name, row.wsPort);
                select.append($(option));
            })
        },
        error: (data) => {
            // $("#alert-box").show();
        }
    });

    $('#camerafieldsSelect').on("change", function (ret) {
        console.log(ret, "|||||||||||||||||");
    });

    $('#showarea')

    // window.choose = '0';
    // $('#show01').hide();
    // $('#show02').hide();
    // document.getElementsByTagName('select')[0].onchange = function () {
    //     var index = this.selectedIndex;
    //     choose = this.children[index].value;
    //     if (choose == '21') {
    //         $('#show01').show();
    //         $('#show02').hide();
    //     } else if(choose == '22'){
    //         $('#show02').show();
    //         $('#show01').hide();
    //     }
    // }
});
