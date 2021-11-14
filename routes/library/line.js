const axios = require('axios')
const qs = require('querystring');
var Alarmrecord = require('../../models/alarmrecord');
var User = require('../../models/user');
var Specialsound = require('../../models/specialsound');
// const TOKEN = '4pviH7SgGX77fku9HTjI0cfDAWgFAVVaq6cTcTXkdVM'

function line_reminder(mes,TOKEN){
    axios({
        method: 'post',
        url: 'https://notify-api.line.me/api/notify',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${TOKEN}`
        },
        data: qs.stringify({
            message: mes,
        })
    }).then(function (response) {
        // HTTP狀態碼 200 代表成功
        console.log("HTTP狀態碼:" + response.status);
        // 觀察回傳的資料是否與 POSTMAN 測試一致
        console.log(response.data);
    }).catch(function (error) {
        console.error("LINE通知發送失敗");
        if (error.response) { // 顯示錯誤原因            
            console.error("HTTP狀態碼:" + error.response.status);
            console.error(error.response.data);
        } else {
            console.error(error);
        }
    });
}

function save_alarmrecord(time,type,mes){
    var newalarmrecord = new Alarmrecord();
        newalarmrecord.time = time;
        newalarmrecord.type = type;
        newalarmrecord.message = mes;
        newalarmrecord.save(function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({
                    result: -1,
                    message: err
                });
                return;
            }
            return;
        });
}

function send_line_save_alarmrecord(time,type,mes){
    TOKEN = ''
    save_alarmrecord(time,type,mes)
    User.find({}, function (err, users) {
        users.forEach(function(user){
                TOKEN = user.line_token           
                if(TOKEN != ''){
                    line_reminder(mes,TOKEN)
                }  
                var updateObj = {
                    alert_specialsound: true
                } 
                User.updateMany({
                    alert_specialsound: false
                }, updateObj, function (err) {
                    if (err) {
                        console.error(err);
                        res.status(500).json({
                            result: -1,
                            message: err
                        });
                        return;
                    }
                });     
        })
    })
}

function get_time(){
    var today=new Date();
    var currentDateTime =
    today.getFullYear()+'年'+
    ((today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : ("0" + (today.getMonth() + 1))) +'月'+
    ((today.getDate() < 10 ? ("0"+today.getDate()) : today.getDate())) +'日 '+
    ((today.getHours() < 10 ? ("0"+today.getHours()) : today.getHours())) +'時'+
    ((today.getMinutes() < 10 ? ("0"+today.getMinutes()) : today.getMinutes())) +'分'+
    ((today.getSeconds() < 10 ? ("0"+today.getSeconds()) : today.getSeconds())) +'秒';
    return currentDateTime
}

function specialsound_reminder(){
    Specialsound.find({}, function (err, specialsounds) {
        specialsounds.forEach(function(specialsound){       
            if(specialsound.type){
                time = get_time()
                var updateObj = {
                    type: false
                }
                Specialsound.findOneAndUpdate({
                    type: true
                }, updateObj, function (err) {
                    if (err) {
                        console.error(err);
                        res.status(500).json({
                            result: -1,
                            message: err
                        });
                    }
                });
                send_line_save_alarmrecord(time,'牛隻叫聲','牛隻叫聲異常')
            } 
            return;                 
        })
    }) 
}

module.exports = {
    remind_all: function () {
        specialsound_reminder()
        return;
    }
}