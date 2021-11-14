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
    window.choose = '0';
    $('#show01').hide();
    $('#show02').hide();
    document.getElementsByTagName('select')[0].onchange = function () {
        var index = this.selectedIndex;
        choose = this.children[index].value;
        if (choose == '21') {
            $('#show01').show();
            $('#show02').hide();
            //document.getElementById("show01").style.display="";
            //document.getElementById("show02").style.display="none";
            //$("#show01").show(); //第一個資料顯示
            //$("#show02").hide(); //第二個資料隱藏
        } else if(choose == '22'){
            $('#show02').show();
            $('#show01').hide();
            //document.getElementById("show02").style.display="";
            //document.getElementById("show01").style.display="none";
            //$("#show02").show(); //第二個資料顯示
            //$("#show01").hide(); //第一個資料隱藏
        }
    }
});