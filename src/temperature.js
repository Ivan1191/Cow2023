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

var lastChart = {};
var tables = {};

var now_data = [];
$(document).ready(function () {
    window.datakeys = [];
    window.datavaluesT = [];
    window.datavaluesH = [];
    window.type = 'line';
    window.duration = '1';

    $.ajax({
        url: "/temperature/htManageView",
        type: "POST",
        success: (data) => {
            now_data = data;
            console.log(data.rows);

            var line_html = "";
            var table_html = "";

            data.rows.forEach(function (rows) {
                var row = rows._id;

                lastChart[row.sensorID] = null;
                tables[row.sensorID] = null;

                line_html += "<div id='graph-container" + row.sensorID + "' class='container col-md-6'>";
                line_html += "<div><h3 style='width: 100%; text-align: center;'><strong>" + row.name + "</strong></h3></div>";
                line_html += "<canvas id='lineChart" + row.sensorID + "'></canvas></div>";

                table_html += "<div class='table-responsive col-md-6'>";
                table_html += "<table id='table" + row.sensorID + "' class='table table-striped table-bordered new-table-bgcolor' style='width: 100%'>";
                table_html += "<thead><div><h3><strong>" + row.name + "</strong></h3></div>";
                table_html += "<tr><th>時間</th><th>溫度</th><th>濕度</th></tr>";
                table_html += "</thead></table></div>";

            })

            $('#line').html(line_html);
            $('#table').html(table_html);

            data.rows.forEach(function (fun_rows) {
                var row = fun_rows._id;
                getTable(row.sensorID);
            });

            $('#line').show();
            $('#table').hide();

            data.rows.forEach(function (fun_rows) {
                var row = fun_rows._id;
                getLineChart(row.sensorID);
            });

        },
        error: (data) => {
            // $("#alert-box").show();
        }
    });

    console.log(now_data,"||||||now_data|||||");



    setInterval(function () {
        if (type == 'line') {
            now_data.rows.forEach(function (fun_rows) {
                var row = fun_rows._id;
                getLineChart(row.sensorID);
            });
        } else {
            now_data.rows.forEach(function (fun_rows) {
                var row = fun_rows._id;
                tables[row.sensorID].ajax.reload(null, false);
            });
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
            now_data.rows.forEach(function (fun_rows) {
                var row = fun_rows._id;
                getLineChart(row.sensorID);
            });
        } else {
            $('#line').hide();
            $('#table').show();
            now_data.rows.forEach(function (fun_rows) {
                var row = fun_rows._id;
                tables[row.sensorID].ajax.reload(null, false);
            });
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
            now_data.rows.forEach(function (fun_rows) {
                var row = fun_rows._id;
                getLineChart(row.sensorID);
            });
        } else {
            $('#line').hide();
            $('#table').show();
            now_data.rows.forEach(function (fun_rows) {
                var row = fun_rows._id;
                tables[row.sensorID].ajax.reload(null, false);
            });
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
            error: (data) => {
            }
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
                    },]
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
                    },]
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

setInterval(function () {
    reminder()
}, 5000)

function reminder() {
    $.ajax({
        url: '/alarmrecord/thermal_reminder',
        method: 'POST',
        data: function () {
        },
        success: function (res) {
            if (res) {
                // console.log("thermal")
                document.getElementById("light").src = "/red.png"
            } else {
                document.getElementById("light").src = "/blue.png"
            }
        },
        error: function (err) {
            console.log('thermal_reminder_err')
        },
    });
    $.ajax({
        url: '/alarmrecord/specialsound_reminder',
        method: 'POST',
        data: function () {
        },
        success: function (res) {
            if (res) {
                // console.log("special")
                alert('牛隻叫聲異常');
            }
        },
        error: function (err) {
            console.log('specialsound_reminder_err')
        },
    });
}
