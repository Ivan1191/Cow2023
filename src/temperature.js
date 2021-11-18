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
import 'css/temperature.css'

var reloadInterval = 5;

var moment = require('moment-timezone');
moment.tz.setDefault("Asia/Taipei");
var lastChart = {
    'A': null,
    'B': null,
    'C': null,
    'D': null,
};

var tables = {
    'A': null,
    'B': null,
    'C': null,
    'D': null,
};

$(document).ready(function () {
    window.datakeys = [];
    window.datavaluesT = [];
    window.datavaluesH = [];
    window.type = 'line';
    window.duration = '1';
    getTable('A');
    getTable('B');
    getTable('C');
    getTable('D');
    $('#line').show();
    $('#table').hide();
    getLineChart('A');
    getLineChart('B');
    getLineChart('C');
    getLineChart('D');
    setInterval(function () {
        if (type == 'line') {
            getLineChart('A');
            getLineChart('B');
            getLineChart('C');
            getLineChart('D');
        } else {
            tables['A'].ajax.reload(null, false);
            tables['B'].ajax.reload(null, false);
            tables['C'].ajax.reload(null, false);
            tables['D'].ajax.reload(null, false);
        }
    }, reloadInterval * 60 * 1000);

    // 當第一個select有修改時會trigger (折線圖/表格)
    document.getElementsByTagName('select')[0].onchange = function () {
        var index = this.selectedIndex;
        type = this.children[index].value;
        // console.log("1: " + sensor);
        if (type == 'line') {
            $('#line').show();
            $('#table').hide();
            // console.log("現在是" + type)
            getLineChart('A');
            getLineChart('B');
            getLineChart('C');
            getLineChart('D');
        } else {
            $('#line').hide();
            $('#table').show();
            tables['A'].ajax.reload(null, false);
            tables['B'].ajax.reload(null, false);
            tables['C'].ajax.reload(null, false);
            tables['D'].ajax.reload(null, false);
            // console.log("現在是" + type)
        }
    }

    // 當第二個select有修改時會trigger (一天/三天/五天/七天)
    document.getElementsByTagName('select')[1].onchange = function () {
        var index = this.selectedIndex;
        duration = this.children[index].value;
        if (type == 'line') {
            $('#line').show();
            $('#table').hide();
            // console.log("現在是" + duration);
            getLineChart('A');
            getLineChart('B');
            getLineChart('C');
            getLineChart('D');
        } else {
            $('#line').hide();
            $('#table').show();
            tables['A'].ajax.reload(null, false);
            tables['B'].ajax.reload(null, false);
            tables['C'].ajax.reload(null, false);
            tables['D'].ajax.reload(null, false);
            // console.log("現在是" + duration);
        }
    }

    function getLineChart(sensorID) {
        //當前時間-3小時~當前時間的資料
        var timeData = {
            starttime: moment().subtract(parseInt(duration), 'days').add(8, 'hours').format('YYYY-MM-DD HH:mm:ss'),
            endtime: moment().add(8, 'hours').format('YYYY-MM-DD HH:mm:ss')
        };
        timeData['sensorID'] = sensorID;
        timeData['type'] = 'line';
        $.ajax({
            url: "/temperature/getTH",
            type: "POST",
            data: timeData,
            success: (data) => {
                // console.log(data);
                setdata(data);
                updateLineChart(timeData['sensorID'])
            },
            error: (data) => {}
        });
        // console.log(datavalues)
    };

    function getTable(sensorID) {
        tables[sensorID] = $('#table' + sensorID).DataTable({
            deferLoading: 100,
            deferRender: true,
            ajax: {
                url: '/temperature/getTH',
                type: 'POST',
                dataSrc: function (json) {
                    // console.log(json);
                    return json;
                },
                data: function () {
                    var timeData = {
                        starttime: moment().subtract(parseInt(duration), 'days').add(8, 'hours').format('YYYY-MM-DD HH:mm:ss'),
                        endtime: moment().add(8, 'hours').format('YYYY-MM-DD HH:mm:ss')
                    };
                    timeData['sensorID'] = sensorID;
                    timeData['type'] = 'table';
                    return timeData;
                }
            },
            columns: [{
                    data: "create_at",
                    render: function (data, type, row, meta) {
                        return moment(data).subtract(8, 'hours').format("YYYY-MM-DD HH:mm:ss");
                    }
                },
                {
                    data: "temperature",
                },
                {
                    data: "humidity",
                },
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
                width: '18%',
                targets: 0
            }],
            "order": [
                [0, "desc"]
            ],
            // "paging": false
        });

        // console.log(datavalues)
    };

    function setdata(data) {
        // console.log('----');
        datakeys = data['labels']; // 圖表的下標
        datavaluesT = data['T']; // 每一筆資料的數值
        datavaluesH = data['H']; // 每一筆資料的數值
        // console.log('----------route/temperature.js----------')
        // console.log(datakeys);
        // console.log(datavaluesT);
        // console.log(datavaluesH);
        // console.log('----------------------------------------');
    };

    function updateLineChart(sensorID) {
        // console.log('keys: ' + datakeys);
        // console.log('valuesT: ' + datavaluesT);
        // console.log('valuesH: ' + datavaluesH);

        var ctx = document.getElementById("lineChart" + sensorID);
        if (lastChart[sensorID] === undefined || lastChart[sensorID] === null) {
            lastChart[sensorID] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: datakeys,
                    datasets: [{
                        label: '溫度',
                        data: datavaluesT,
                        borderColor: 'rgba(255, 208, 0, 0.5)',
                        pointBackgroundColor: 'rgb(255, 208, 0)',
                        fill: false,
                        lineTension: 0,
                        yAxisID: 'temp',
                    }, {
                        label: '濕度',
                        data: datavaluesH,
                        borderColor: 'rgba(0, 85, 255, 0.5)',
                        pointBackgroundColor: 'rgb(0, 85, 255)',
                        fill: false,
                        lineTension: 0,
                        yAxisID: 'humid',
                    }, ]
                },
                options: {
                    line: {
                        tension: 0,
                    },
                    animation: {
                        duration: 0
                    },
                    scales: {
                        yAxes: [{
                            id: 'temp',
                            type: 'linear',
                            position: 'left',
                            ticks: {
                                max: 50,
                                min: 0
                            }
                          }, {
                            id: 'humid',
                            type: 'linear',
                            position: 'right',
                            ticks: {
                                max: 100,
                                min: 0
                            }
                          }]
                    },
                    spanGaps: true,
                    responsive: true,
                }
            });
        } else {
            $('#lineChart' + sensorID).remove(); // this is my <canvas> element
            $('#graph-container' + sensorID).append(`<canvas id="lineChart${sensorID}"><canvas>`);
            var canvas = document.querySelector('#lineChart' + sensorID);
            var ctx = document.getElementById("lineChart" + sensorID);
            lastChart[sensorID] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: datakeys,
                    datasets: [{
                        label: '溫度',
                        data: datavaluesT,
                        borderColor: 'rgba(255, 208, 0, 0.5)',
                        pointBackgroundColor: 'rgb(255, 208, 0)',
                        fill: false,
                        lineTension: 0,
                        yAxisID: 'temp',
                    }, {
                        label: '濕度',
                        data: datavaluesH,
                        borderColor: 'rgba(0, 85, 255, 0.5)',
                        pointBackgroundColor: 'rgb(0, 85, 255)',
                        fill: false,
                        lineTension: 0,
                        yAxisID: 'humid',
                    }, ]
                },
                options: {
                    line: {
                        tension: 0,
                    },
                    animation: {
                        duration: 0
                    },
                    scales: {
                        yAxes: [{
                            id: 'temp',
                            type: 'linear',
                            position: 'left',
                            ticks: {
                                max: 50,
                                min: 0
                            }
                          }, {
                            id: 'humid',
                            type: 'linear',
                            position: 'right',
                            ticks: {
                                max: 100,
                                min: 0
                            }
                          }]
                    },
                    spanGaps: true,
                    responsive: true,
                }
            });
        }
    };

});

setInterval( function() {
    reminder()        
},5000)

function reminder(){
    $.ajax({
        url:'/alarmrecord/thermal_reminder',
        method:'POST',
        data:function () {
        },    
        success:function(res){
            if(res){
                // console.log("thermal")
                document.getElementById("light").src="/red.png"
            }else{
                document.getElementById("light").src="/blue.png"
            }
        },
        error:function(err){console.log('thermal_reminder_err')},
    });
    $.ajax({
        url:'/alarmrecord/specialsound_reminder',
        method:'POST',
        data:function () {
        },    
        success:function(res){
            if(res){
                // console.log("special")
                alert('牛隻叫聲異常');
            }
        },
        error:function(err){console.log('specialsound_reminder_err')},
    });
}