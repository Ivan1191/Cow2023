var fs = require('fs');
var path = require("path");
var join = require('path').join;

//錄無聲影片的部分，暫時沒有用
const picpath_1 = 'D:/test/pic1/'
const picpath_2 = 'D:/test/pic2/'
const videopath_1 = 'D:/test/nosound1/';
const videopath_2 = 'D:/test/nosound2/';
const rtsp_1 = 'rtsp://admin:admin@192.168.11.21'
const rtsp_2 = 'rtsp://admin:admin@192.168.11.22'
//-----

// const rtsp_1 ="rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov"
// const rtsp_2 ="rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov"

//影音剪輯的部分
const audiopath_1 = 'D:/test/wave/cow-mic1';
const audiopath_2 = 'D:/test/wave/cow-mic3';
const savebuffer_all = 'D:/test/buffer';
const savebuffer = 'D:\\test\\buffer\\';
const savepath_1 = 'D:\\test\\final\\';
const savepath_2 = 'D:\\test\\final1\\';
const Blank_audio_file = 'D:\\test\\5min.wav' //空白wav檔
//-----


var timemap = []
var suitabletime = []
var audioname1 = []
var audioname2 = []
var Cut_ornot = true; // 影片繼續放著 -> 改false

function Initialize(){
    Cut_ornot = true
    audioname1 = []
    audioname2 = []
    suitabletime = []
    timemap = []
    for(i = 0; i < 300; i++)
        timemap.push(0)
    Delete_Dir(savebuffer_all + '/');
    fs.mkdirSync(savebuffer_all);
}

function get_time(){
    var today=new Date();
    var currentDateTime =
    today.getFullYear().toString() +
    ((today.getMonth() + 1) >= 10 ? (today.getMonth() + 1) : ("0" + (today.getMonth() + 1))).toString() +
    ((today.getDate() < 10 ? ("0"+today.getDate()) : today.getDate())).toString() +'-'+
    ((today.getHours() < 10 ? ("0"+today.getHours()) : today.getHours())) +
    ((today.getMinutes() < 10 ? ("0"+today.getMinutes()) : today.getMinutes())) +
    ((today.getSeconds() < 10 ? ("0"+today.getSeconds()) : today.getSeconds())) ;
    return currentDateTime
}

function Pic_rtsp_1(){ //錄無聲影片
    var concateExec = require('child_process').exec;
    var child = concateExec('ffmpeg -i ' + rtsp_1 + ' -y -q:v 2 -f mjpeg -frames:v 1 -s 960x540 ' + picpath_1 + get_time() + '.jpg', function (error, stdout, stderr) {
        if (error !== null) {
            console.log('concateExec error: ' + error);
        }
        //Record_rtsp_1();
    });
}

function Pic_rtsp_2(){ //錄無聲影片
    var concateExec = require('child_process').exec;
    var child = concateExec('ffmpeg -i ' + rtsp_2 + ' -y -q:v 2 -f mjpeg -frames:v 1 -s 960x540 ' + picpath_2 + get_time() + '.jpg', function (error, stdout, stderr) {
        if (error !== null) {
            console.log('concateExec error: ' + error);
        }
        //Record_rtsp_1();
    });
}

function Record_rtsp_1(){ //錄無聲影片
    var concateExec = require('child_process').exec;
    var child = concateExec('ffmpeg -rtsp_transport tcp -i '+ rtsp_1 +' -f segment -segment_time 300 -segment_format mp4 -timeout -1 -reset_timestamps 1  -strftime 1 -c copy '+ videopath_1 +'%Y%m%d-%H%M%S.mp4', function (error, stdout, stderr) {
        if (error !== null) {
            console.log('concateExec error: ' + error);
        }
        //Record_rtsp_1();
    });
}

function Record_rtsp_2(){ //錄無聲影片
    var concateExec = require('child_process').exec;
    var child = concateExec('ffmpeg -rtsp_transport tcp -i '+ rtsp_2 +' -f segment -segment_time 300 -segment_format mp4 -timeout -1 -reset_timestamps 1  -strftime 1 -c copy '+ videopath_2 +'%Y%m%d-%H%M%S.mp4', function (error, stdout, stderr) {
        if (error !== null) {
            console.log('concateExec error: ' + error);
        }
        // Record_rtsp_2();
    });
}

function Merge_Audio_Video(audio, video, save){ //合併影片和音檔
    // console.log("Merge_Audio_Video")
    var concateExec = require('child_process').execSync;
    try{
        var child = concateExec('ffmpeg  -y -i  ' + audio + ' -i ' + video + ' -shortest -preset ultrafast ' + save,
        {stdio: 'inherit'});
    }catch(e)
    {
        console.log('有問題影片: '+video);
    }

}

function Merge_Audio(audio1, audio2, output){ //合併音檔
    //console.log("Merge_Audio")
    var concateExec = require('child_process').execSync
    try{
        var child = concateExec("ffmpeg -y -i " + audio1 + " -i " + audio2 + " -filter_complex \"[0:a][1:a]concat=n=2:v=0:a=1[out]\" -map \"[out]\" " + output,
        {stdio: 'inherit'});
    }catch(e)
    {
        console.log('有問題音檔: '+audio1+' or '+audio2);
    }
}

function Cut_Audio(audio, start_time, continue_time, name){ //切割音檔
    // console.log("Cut_Audio")
    save = savebuffer + name +'.wav'
    try{
    var concateExec = require('child_process').execSync
    var child = concateExec('ffmpeg -y -ss ' + start_time +' -t ' + continue_time + ' -i ' + audio + ' ' + save,
    {stdio: 'inherit'});
    }catch(e)
    {
        console.log('有問題音檔: '+audio);
        for(c=0;c<300;c++){
            if(timemap[c] == parseInt(name))
                timemap[c] = 0
        }
        // Delete_File(audio.substring(0,audio.length-19),audio.substring(audio.length-19,audio.length))
        // console.log(audio.substring(0,audio.length-19))
        // console.log(audio.substring(audio.length-19,audio.length))
    }
}

function Get_Files(Path){ //取得資料夾下所有檔名及副檔名
    // console.log("Get_Files----------------------------------------")
    let Files = []
    function findFile(path){
        let files = fs.readdirSync(path);
        files.forEach(function (item, index) {
            let fPath = join(path,item);
            let stat = fs.statSync(fPath);
            if(stat.isDirectory() === true) {
                findFile(fPath);
            }
            if (stat.isFile() === true) {
                Files.push(fPath);
            }
        });
    }
    if( fs.existsSync(Path) ){
        findFile(Path);
        Files.sort()
        Files.reverse();
    }
    // console.log(Files);
    return Files;
}

function Get_Date(v_date, day) { //取得加減天數對應的日期
    // console.log("Get_Date")
    var date_buffer = new Date(v_date.substring(0,4) + '-' + v_date.substring(4,6) + '-' + v_date.substring(6,8))
    date_buffer.setDate(date_buffer.getDate() + day)
    date_buffer = new Date(date_buffer)
    var yyyy = date_buffer.getFullYear();
    var MM = (date_buffer.getMonth() + 1) >= 10 ? (date_buffer.getMonth() + 1) : ("0" + (date_buffer.getMonth() + 1));
    var dd = date_buffer.getDate() < 10 ? ("0"+date_buffer.getDate()) : date_buffer.getDate();
    var date = yyyy + MM + dd;
    return date;
}

function Fill_Timemap(audio, v_total_sec, a_total_sec, mode){ //填補timemap並切割音檔 mode=0時不切音檔 mode=1時切音檔
    // console.log("Fill_Timemap")
    id = suitabletime.indexOf(audio) + 1
    if(v_total_sec > a_total_sec){
        // console.log(audio)
        end_time = 300 - (v_total_sec - a_total_sec)
        // console.log(end_time)
        start_time = 300
        continue_time = 0
        for(k = 0; k < end_time; k++){
            start_time = start_time - 1
            if(timemap[k] == 0){
                timemap[k] = id
                continue_time = continue_time + 1
            }
        }
        // console.log(start_time)
        // console.log(continue_time)
        if(continue_time > 0 & mode == 1)
            Cut_Audio(audio,start_time, continue_time,id.toString())
    }
    else if(v_total_sec < a_total_sec){
        // console.log(audio)
        end_time = 300 - (a_total_sec - v_total_sec)
        // console.log(end_time)
        start_time = 0
        continue_time = 0
        for(k = 1; k <= end_time; k++){
            if(timemap[300-k] == 0){
                timemap[300-k] = id
                continue_time = continue_time + 1
            }
        }
        // console.log(start_time)
        // console.log(continue_time)
        if(continue_time > 0 & mode == 1)
            Cut_Audio(audio,start_time, continue_time,id.toString())
    }
}

function Find_Suitable_Time_Cut(audioname, video){ //取出對應時間
    // console.log("Find_Suitable_Time_Cut")
    v_length = video.length
    v_hr = parseInt(video.substring(v_length-10,v_length-8))
    v_min = parseInt(video.substring(v_length-8,v_length-6))
    v_sec = parseInt(video.substring(v_length-6,v_length-4))
    v_total_sec = v_hr * 3600 + v_min * 60 + v_sec
    for(j = 0; j < audioname.length; j++){
        a_length = audioname[j].length
        a_hr = parseInt(audioname[j].substring(a_length-10,a_length-8))
        a_min = parseInt(audioname[j].substring(a_length-8,a_length-6))
        a_sec = parseInt(audioname[j].substring(a_length-6,a_length-4))
        a_total_sec = a_hr * 3600 + a_min * 60 + a_sec
        if(Math.abs(v_total_sec - a_total_sec) <= 300){
            suitabletime.push(audioname[j])
            Fill_Timemap(audioname[j],v_total_sec,a_total_sec,1)
        }
    }
}

function Merge_Cut_Audio(video1,name_buf){ //合並剪下來的音檔 & 輸出沒有音檔的影片 & 合併剪下來的音檔及影片 & 刪除無聲音的影片
    // console.log("Merge_Cut_Audio")
    bufferaudio = Get_Files(savebuffer_all)
    v_length = video1.length
    if(bufferaudio.length == 0 & name_buf == 1){
        // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa')
        setTimeout(Merge_Audio_Video, 200, Blank_audio_file, video1, savepath_1 + video1.substring(v_length-19,v_length-4) + '.mp4')
        if( fs.existsSync(videopath_1 + video1.substring(v_length-19, v_length)) )
            setTimeout(Delete_File,35000,videopath_1,video1.substring(v_length-19, v_length)) //到時改成rtsp下來的影片
    }
    else if(bufferaudio.length == 0 & name_buf == 2){
        // console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbb')
        setTimeout(Merge_Audio_Video, 200, Blank_audio_file, video1, savepath_2 + video1.substring(v_length-19,v_length-4) + '.mp4')
        if( fs.existsSync(videopath_2 + video1.substring(v_length-19, v_length)) )
            setTimeout(Delete_File,35000,videopath_2,video1.substring(v_length-19, v_length)) //到時改成rtsp下來的影片
    }
    else{
        // console.log('==========================================')
        var order = [] //紀錄順序
        var buffer = -1 //甚麼時候紀錄的flag
        var num = suitabletime.length
        for(j = 0; j < 300; j++){
            if(timemap[j] == 0){
                num = num + 1
                start_time = 0
                for(k = j + 1; k < 300; k++){
                    if(timemap[k] != 0)
                        break
                }
                Cut_Audio(Blank_audio_file, start_time, k-j-1, num.toString())
                j = k-1
                order.push(num)
                buffer = num
            }
            else{
                if(timemap[j] != buffer){
                    order.push(timemap[j])
                    buffer = timemap[j]
                }
            }
        }
        for(j = 0; j < order.length-1; j++){
            num = num + 1
            if(j == 0)
                Merge_Audio(savebuffer + order[j].toString() + '.wav', savebuffer + order[j+1].toString() + '.wav', savebuffer + num.toString() + '.wav')
            else
                Merge_Audio(savebuffer + (num-1).toString() + '.wav', savebuffer + order[j+1].toString() + '.wav', savebuffer + num.toString() + '.wav')
        }

        if(name_buf == 1){ //name_buf == 1時 -> 以rtsp1為主
            // console.log("1111111111111111111111111111111111111111111")
            setTimeout(Merge_Audio_Video, 200, savebuffer + num.toString() + '.wav', video1, savepath_1 + video1.substring(video1.length-19,video1.length-4) + '.mp4')
            if( fs.existsSync(videopath_1 + video1.substring(v_length-19, v_length)) )
                setTimeout(Delete_File,35000,videopath_1,video1.substring(v_length-19, v_length)) //到時改成rtsp下來的影片
        }
        else if(name_buf == 2){ //name_buf == 2時 -> 以rtsp2為主
            // console.log("22222222222222222222222222222222222222222222")
            setTimeout(Merge_Audio_Video, 200, savebuffer + num.toString() + '.wav', video1, savepath_2 + video1.substring(video1.length-19,video1.length-4) + '.mp4')
            if( fs.existsSync(videopath_2 + video1.substring(v_length-19, v_length)) )
                setTimeout(Delete_File,35000,videopath_2,video1.substring(v_length-19, v_length)) //到時改成rtsp下來的影片
        }
    }
}

function Delete_File(url,name){ //刪除資料夾下指定檔案
    // console.log("Delete_File")
    var files = [];
    if( fs.existsSync(url) ) {    //判断给定的路径是否存在
        files = fs.readdirSync(url);    //返回文件和子目录的数组
        files.forEach(function(file,index){
            var curPath = path.join(url,file);
            if(fs.statSync(curPath).isDirectory()) { //同步读取文件夹文件，如果是文件夹，则函数回调
                deleteFile(curPath,name);
            } else {
                if(file.indexOf(name)>-1){    //是指定文件，则删除
                    fs.unlinkSync(curPath);
                    console.log("删除文件："+curPath);
                }
            }
        });
    }else{
        console.log("给定的路径不存在！");
    }
}

function Delete_Dir(url){ //刪除整個資料夾
    // console.log("Delete_Dir")
    var files = [];
    if( fs.existsSync(url) ) {  //判断给定的路径是否存在
        files = fs.readdirSync(url);   //返回文件和子目录的数组
        files.forEach(function(file,index){
            var curPath = path.join(url,file);
            if(fs.statSync(curPath).isDirectory()) { //同步读取文件夹文件，如果是文件夹，则函数回调
                deleteDir(curPath);
            } else {
                fs.unlinkSync(curPath);    //是指定文件，则删除
            }
        });
        fs.rmdirSync(url); //清除文件夹
    }else{
        console.log("给定的路径不存在！");
    }
}

function Define_Innormal_Time(v_date, video, audiopath){ //有跨夜
    // console.log("Define_Innormal_Time")
    v_length = video.length
    v_hr = parseInt(video.substring(v_length-10,v_length-8))
    v_min = parseInt(video.substring(v_length-8,v_length-6))
    v_sec = parseInt(video.substring(v_length-6,v_length-4))
    v_total_sec = v_hr * 3600 + v_min * 60 + v_sec
    if((v_hr==23 & v_min>55) | (v_hr==23 & v_min==55 & v_sec!=0)){  //取隔天時間
        var tomorrow_date = Get_Date(v_date, 1)
        if(fs.existsSync(audiopath + '/' + tomorrow_date + '/')){
            audiobuffer = Get_Files(audiopath + '/' + tomorrow_date + '/')
            //console.log(audiobuffer)
            for(j = 0; j < audiobuffer.length; j++){
                a_length = audiobuffer[j].length
                a_hr = parseInt(audiobuffer[j].substring(a_length-10,a_length-8))
                a_min = parseInt(audiobuffer[j].substring(a_length-8,a_length-6))
                a_sec = parseInt(audiobuffer[j].substring(a_length-6,a_length-4))
                a_total_sec = a_hr * 3600 + a_min * 60 + a_sec + 24 * 3600
                if(Math.abs(v_total_sec - a_total_sec) <= 300){
                    suitabletime.push(audiobuffer[j])
                    Fill_Timemap(audiobuffer[j],v_total_sec,a_total_sec,1)
                }
            }
        }
    }else if(v_hr==0 & v_min<5){  //取前天時間
        var yesterday_date = Get_Date(v_date, -1)
        if(fs.existsSync(audiopath + '/' + yesterday_date + '/')){
            audiobuffer = Get_Files(audiopath + '/' + yesterday_date + '/')
            v_total_sec = v_total_sec + 24 * 3600
            for(j = 0; j < audiobuffer.length; j++){
                a_length = audiobuffer[j].length
                a_hr = parseInt(audiobuffer[j].substring(a_length-10,a_length-8))
                a_min = parseInt(audiobuffer[j].substring(a_length-8,a_length-6))
                a_sec = parseInt(audiobuffer[j].substring(a_length-6,a_length-4))
                a_total_sec = a_hr * 3600 + a_min * 60 + a_sec
                if(Math.abs(v_total_sec - a_total_sec) <= 300){
                    suitabletime.push(audiobuffer[j])
                    Fill_Timemap(audiobuffer[j],v_total_sec,a_total_sec,1)
                }
            }
        }
    }
}

function Get_Date_Tooday(){ //取得今天的日期
    var Today = new Date();
    var yyyy = Today.getFullYear();
    var MM = (Today.getMonth() + 1) >= 10 ? (Today.getMonth() + 1) : ("0" + (Today.getMonth() + 1));
    var dd = Today.getDate() < 10 ? ("0"+Today.getDate()) : Today.getDate();
    var date = yyyy + '-' + MM + '-' + dd;
    return date;
}

function Compare_Date(v_date){ //計算今天和影片日期差幾天
    // console.log("Compare_Date")
    today_date = Get_Date_Tooday()
    video_date = v_date.substring(0,4) + '-' + v_date.substring(4,6) + '-' + v_date.substring(6,8)
    var date_1 = new Date(today_date);
    var date_2 = new Date(video_date);
    var days = parseInt(Math.abs(date_1 - date_2) / 1000 / 60 / 60 / 24); // 把相差的毫秒數轉換為天數
    return days;
}

function Find_Suitable_Time_NoCut(audioname, video){ //取出對應時間
    // console.log("Find_Suitable_Time_NoCut")
    v_length = video.length
    v_hr = parseInt(video.substring(v_length-10,v_length-8))
    v_min = parseInt(video.substring(v_length-8,v_length-6))
    v_sec = parseInt(video.substring(v_length-6,v_length-4))
    v_total_sec = v_hr * 3600 + v_min * 60 + v_sec
    for(j = 0; j < audioname.length; j++){
        a_length = audioname[j].length
        a_hr = parseInt(audioname[j].substring(a_length-10,a_length-8))
        a_min = parseInt(audioname[j].substring(a_length-8,a_length-6))
        a_sec = parseInt(audioname[j].substring(a_length-6,a_length-4))
        a_total_sec = a_hr * 3600 + a_min * 60 + a_sec
        if(Math.abs(v_total_sec - a_total_sec) <= 300){
            suitabletime.push(audioname[j])
            Fill_Timemap(audioname[j],v_total_sec,a_total_sec,0)
        }
    }
}

function Check_Timemap(){ // 檢查timemap有沒有填滿 & 檢查影片放置時間
    var timemap_full = true
    for(j = 0; j < 300; j++){ // 情形1 : timemap還沒填滿5分鐘
        if(timemap[j] == 0){
            timemap_full = false
            break
        }
    }
    return(timemap_full)
}

function Define_Cut(video){ // 決定是否可以cut
    // console.log("Define_Cut")
    // console.log(video)
    Initialize()
    v_length = video.length
    v_date = video.substring(v_length-19, v_length-11)
    audioname1 = Get_Files(audiopath_1 + '/' + v_date + '/')
    audioname2 = Get_Files(audiopath_2 + '/' + v_date + '/');
    Define_Innormal_Time(v_date, video, audiopath_1)
    Find_Suitable_Time_NoCut(audioname1, video)
    Define_Innormal_Time(v_date, video, audiopath_2)
    Find_Suitable_Time_NoCut(audioname2, video)
    days = Compare_Date(v_date) // 還沒等超過一天 & timemap還沒滿
    if(days < 1 && !Check_Timemap())
        Cut_ornot = false
    // console.log(Cut_ornot)
}

function main(video1,name_buf){ //正常cut
    // console.log("main")
    console.log(video1)
    Initialize()
    v_length = video1.length
    v_date = video1.substring(v_length-19, v_length-11)
    audioname1 = Get_Files(audiopath_1 + '/' + v_date  + '/')
    audioname2 = Get_Files(audiopath_2 + '/' + v_date + '/');
    Define_Innormal_Time(v_date, video1, audiopath_1)
    Find_Suitable_Time_Cut(audioname1, video1)
    Define_Innormal_Time(v_date, video1, audiopath_2)
    Find_Suitable_Time_Cut(audioname2, video1)
    setTimeout(Merge_Cut_Audio,200,video1,name_buf);
}

module.exports = {
    get_videoname1 : function(){
        return(Get_Files(videopath_1))
    },

    get_videoname2 : function(){
        return(Get_Files(videopath_2))
    },

    define_cut : function(video){
        //console.log(video)
        Define_Cut(video)
        return(Cut_ornot)
    },

    merge : function (video1,name_buf){
        //console.log(video1)
        main(video1,name_buf)
    },

    record_rtsp1 : function (){
        Record_rtsp_1()
    },

    record_rtsp2 : function (){
        Record_rtsp_2()
    },

    pic_rtsp_1 : function (){
        Pic_rtsp_1()
    },

    pic_rtsp_2 : function (){
        Pic_rtsp_2()
    }
}
