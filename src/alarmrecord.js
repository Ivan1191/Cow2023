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

$(document).ready(function () {
    var table = $('#record_list').DataTable({
        deferRender: true,
        ajax: {
            url: '/alarmrecord/all',
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
            data: "time",
            },
            {
                data: "type",
            },
            {
                data: "message",
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
});

// setInterval( function() {
//     reminder()        
// },5000)

// function reminder(){
//     $.ajax({
//         url:'/alarm/thermal_reminder',
//         method:'POST',
//         data:function () {
//         },    
//         success:function(res){
//             if(res){
//                 // console.log("thermal")
//                 document.getElementById("light").src="/red.png"
//             }else{
//                 document.getElementById("light").src="/blue.png"
//             }
//         },
//         error:function(err){console.log('thermal_reminder_err')},
//     });
//     $.ajax({
//         url:'/alarm/specialsound_reminder',
//         method:'POST',
//         data:function () {
//         },    
//         success:function(res){
//             if(res){
//                 // console.log("special")
//                 alert('牛隻叫聲異常');
//             }
//         },
//         error:function(err){console.log('specialsound_reminder_err')},
//     });
// }
