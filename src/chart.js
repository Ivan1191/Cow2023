import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'css/index.css';
import 'dist/css/chart.css';
import 'dist/js/chart.min.js';
import 'css/chart.css';

var moment = require('moment-timezone');
moment().tz("Asia/Taipei").format();
var lastChart;

$(document).ready(function () {

    window.dates = {};
    window.datekeys = [];
    window.datevalues = [];

    // function- set datetime and birthnumbers array
    function setdatetime(data) {
        // console.log('----');
        dates = data.Record;

        // var datek = Object.keys(dates);
        // var dateks = convertDate(datek);
        // console.log(dateks);

        datekeys = Object.keys(dates);
        datevalues = Object.values(dates);
        // console.log(data.Record);
        // console.log(datekeys);
        // console.log(datevalues);
        // console.log('----------');
    };


    // function- convert date type
    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    };

    function convertDate(str) {
        var month, day, year, hours, minutes, seconds;
        var date = new Date(str),
            month = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        hours = ("0" + date.getHours()).slice(-2);
        minutes = ("0" + date.getMinutes()).slice(-2);
        seconds = ("0" + date.getSeconds()).slice(-2);

        var mySQLDate = [date.getFullYear(), month, day].join("-");
        return mySQLDate;
    };


    // press check button
    $('#checkdate').click(function () {

        // fetch radio selection
        var dateroute = document.getElementById("dateroute");
        for (var i = 0; i < dateroute.dateselect.length; i++) {
            if (dateroute.dateselect[i].checked) {
                var datesel = dateroute.dateselect[i].value;
                // console.log(datesel);
            }
            ;
        }
        ;

        if (datesel == null) {
            alert("請選擇週期");
            return false;
        }
        ;


        var sdate = document.getElementById('startmonth');
        var edate = document.getElementById('endmonth');
        window.start = formatDate(sdate.value);
        window.end = formatDate(edate.value);

        // input range error msg
        if (moment(start).isBefore(end) < 1) {
            alert('開始日期請小於結束日期!!');
            return false;
        }
        ;

        // window.datekey = [];
        // window.datevalue = [];

        // year, month, week
        if (datesel === "year") {
            var years = moment(start).startOf('year');
            var yeare = moment(end).endOf('year');
            var yearstart = formatDate(years._d);
            var yearend = formatDate(yeare._d);

            var yeardata = {};
            yeardata["starttime"] = yearstart;
            yeardata["endtime"] = yearend;


            $.ajax({
                url: "/report/getyear",
                type: "POST",
                data: yeardata,
                success: (data) => {
                    // console.log(data);
                    setdatetime(data);
                    updateChart(data);
                },
                error: (data) => {
                    $("#alert-box").show();
                }
            });

        } else if (datesel === "month") {
            var months = moment(start).startOf('month');
            var monthe = moment(end).endOf('month');
            var monthstart = formatDate(months._d);
            var monthend = formatDate(monthe._d);
            var monthmonths = moment(monthstart).month();
            var monthmonthe = moment(monthend).month();

            var monthdata = {};
            monthdata["starttime"] = monthstart;
            monthdata["endtime"] = monthend;

            $.ajax({
                url: "/report/getmonth",
                type: "POST",
                data: monthdata,
                success: (data) => {
                    // console.log(data);
                    setdatetime(data);
                    updateChart(data);
                },
                error: (data) => {
                    $("#alert-box").show();
                }
            });


        } else if (datesel === "week") {
            var weeks = moment(start).startOf('week');
            var weeke = moment(end).endOf('week');
            var weekstart = formatDate(weeks._d);
            var weekend = formatDate(weeke._d);

            var weekdata = {};
            weekdata["starttime"] = weekstart;
            weekdata["endtime"] = weekend;

            $.ajax({
                url: "/report/getweek",
                type: "POST",
                data: weekdata,
                success: (data) => {
                    // console.log(data);
                    setdatetime(data);
                    updateChart(data);
                },
                error: (data) => {
                    $("#alert-box").show();
                }
            });
        } else if (datesel === "day") {
            var days = moment(start).startOf('day');
            var daye = moment(end).endOf('week');
            var daystart = convertDate(days._d);
            var dayend = convertDate(daye._d);

            var daydata = {};
            daydata["starttime"] = daystart;
            daydata["endtime"] = dayend;

            // console.log('++++++' + daydata["endtime"] + '++++++');

            $.ajax({
                url: "/report/getday",
                type: "POST",
                data: daydata,
                success: (data) => {
                    // console.log(data);
                    setdatetime(data);
                    updateChart(data);
                },
                error: (data) => {
                    $("#alert-box").show();
                }
            });
        }
    });

    function updateChart(data) {
        // console.log('keys: ' + datekeys);
        // console.log('values: ' + datevalues);


        var ctx = document.getElementById("myChart");
        if (lastChart === undefined || lastChart === null) {
            lastChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: datekeys,
                    datasets: [{
                        label: '牛隻分娩數量',
                        data: datevalues
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            ticks: {}
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: function(value) {if (value % 1 === 0) {return value;}}
                            }
                        }]
                    }
                }
            });
            var test = "hieie";
        } else {
            $('#myChart').remove(); // this is my <canvas> element
            $('#graph-container').append('<canvas id="myChart"><canvas>');
            var canvas = document.querySelector('#myChart');
            ctx = canvas.getContext('2d');
            lastChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: datekeys,
                    datasets: [{
                        label: '牛隻分娩數量',
                        data: datevalues
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            ticks: {}
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: function(value) {if (value % 1 === 0) {return value;}}
                            }
                        }]
                    }
                }
            });
        }
    }
});
