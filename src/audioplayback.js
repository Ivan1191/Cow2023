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
import GHelper from 'ghelper.js';



var moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");

$(document).ready(function () {
    var table = $('#record_list').DataTable({
        deferRender: true,
        ajax: {
            url: '/audioplayback/audio',
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
            data: "type",
            },
            {
                data: "tagDate",
                render: function (data, type, row, meta) {
                    return moment(data).format("YYYY-MM-DD HH:mm:ss");
                }
            },
            {
                data: "hard",
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
                data: "audiocut",
                orderable: false,
                render: function (data, type, row, meta) {
                    var audio = ""
                    if(row.audiocut["a"] !== undefined )
                    {
                        audio+= 'mic-a<audio controls="controls" id="audio" class="col-md-4" style="min-width: 40rem; margin: 0 0; backgroud-color:#000;"><source id="audioSource" src="/audioTen/'+row.audiocut["a"]+'" '+
                        'type="audio/wav"> Your browser does not support the audio element. </audio><br />';
                    }
                    if(row.audiocut["b"] !== undefined )
                    {
                        audio+= 'mic-b<audio controls="controls" id="audio" class="col-md-4" style="min-width: 40rem; margin: 0 0; backgroud-color:#000;"><source id="audioSource" src="/audioTen/'+row.audiocut["b"]+'" '+
                        'type="audio/wav"> Your browser does not support the audio element. </audio><br />';
                    }
                    if(row.audiocut["c"] !== undefined )
                    {
                        audio+= 'mic-c<audio controls="controls" id="audio" class="col-md-4" style="min-width: 40rem; margin: 0 0; backgroud-color:#000;"><source id="audioSource" src="/audioTen/'+row.audiocut["c"]+'" '+
                        'type="audio/wav"> Your browser does not support the audio element. </audio><br />';
                    }
                    if(row.audiocut["cut"] !== undefined )
                    {
                        audio+= '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<audio controls="controls" id="audio" class="col-md-4" style="min-width: 40rem; margin: 0 0; backgroud-color:#000;"><source id="audioSource" src="/audioTen/'+row.audiocut["cut"]+'" '+
                        'type="audio/wav"> Your browser does not support the audio element. </audio><br />';
                    }
                    audio+=""
                    return audio;
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
            [1, "desc"]
        ],
        // "paging": false
    });
});
