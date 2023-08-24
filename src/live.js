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

    //從資料庫取資料並渲染攝影機參數以及下拉選單
    $.ajax({
        url: "/live/camerafieldsSelect",
        type: "POST",
        success: (data) => {
            console.log(data);
            var select = $('#camerafieldsSelect');
            $('option', select).remove();
            select.append(new Option("----請選擇----", ""));
            data.rows.forEach(function (row) {
                var option = new Option(row.title, row.wsPort);
                select.append($(option));
            })

            var html = "";
            $("#camerafieldsSelect > option").each(function () {
                // console.log(this.text + " : " + this.value);
                if(this.value!=''){
                    html += "<div class='show' id='show-" + this.value + "'>";
                    // html += "<canvas id='video-canvas-" + this.value + "' style='width:640px;height:480px'></canvas>";
                    html += "<canvas id='video-canvas-" + this.value + "' style='width:95%;height:95%'></canvas>";
                    html += "<script type='text/javascript'>";
                    html += "var url = 'ws://127.0.0.1:" + this.value + "'; var canvas = document.getElementById('video-canvas-" + this.value + "');";
                    html += "var player = new JSMpeg.Player(url, {canvas: canvas, audio: true});";
                    html += "<";
                    html += "/script></div>";
                }
            });

            $('#showarea').html(html);
            $('.show').hide();
        },
        error: (data) => {
            // $("#alert-box").show();
        }
    });

    //處理顯示哪個畫面
    $('#camerafieldsSelect').on("change", function () {
        $('.show').hide();
        $('#show-' + this.value).show();
    });

});
