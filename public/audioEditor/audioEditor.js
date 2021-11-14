// ?fileName=/public/audioTen/5f36a9f40524030df8d7358b_a.wav
var filePath = document.getElementById('filePath').innerText;
var save = null;
var destoryPeaksInstance = function () { };
var getPointsTime = function () { };

// fPath為絕對路徑 waveformPath為相對於D:/prodeced_audio下的路徑 ->/tmp/waveform_name.dat
function loadWaveForm(fPath, wavefromPath, tagPointTime = null) {

  // console.log("+++++++++++peaks.js+++++++++");
  // console.log(fPath);
  // console.log(tagPointTime);
  // console.log(wavefromPath);
  // console.log(document.querySelector("#loginID").value);
  // console.log("+++++++++++peaks.js+++++++++");

  tagPointTime = parseFloat(tagPointTime);


  // var peaksIns;
  (function (Peaks) {

    var options = {
      containers: {
        zoomview: document.getElementById('zoomview-container'),
        overview: document.getElementById('overview-container')
      },
      mediaElement: document.getElementById('audio'),
      dataUri: {
        arraybuffer: wavefromPath,
        // arraybuffer: '/audioTen/waveform_' + document.querySelector("#loginID").value + '.dat',
        //json: 'TOL_6min_720p_download.json'
      },
      keyboard: true,
      pointMarkerColor: '#006eb0',
      showPlayheadTime: true
    };

    // load audio file
    var audio = document.getElementById('audio');
    var source = document.getElementById('audioSource');
    source.setAttribute('src', fPath + '?v=' + new Date().getTime());
    audio.load();



    Peaks.init(options, function (err, peaksInstance) {
      var startPointId = '';
      var endPointId = '';
      var tagPointId = '';
      if (err) {
        console.error(err.message);
        return;
      }
      //若原本就有tagPoint
      if (tagPointTime) {
        // console.log('**** create tag point ******');
        // console.log(tagPointTime);
        // console.log("***********");
        //save = parseFloat(tagPointTime);
        peaksInstance.points.add({
          time: tagPointTime,
          labelText: '標記',
          editable: true
        });
        tagPointId = peaksInstance.points.getPoints()[peaksInstance.points.getPoints().length - 1].id;
        document.querySelector("#tagPointTime").value = tagPointTime;
      }
      else {
        document.querySelector("#tagPointTime").value = "";
      }

      // console.log("Peaks instance ready");
      // console.log("-----begin points  ----------");
      // console.log(peaksInstance.points.getPoints());
      // console.log("-----end  points  ----------");

      document.querySelector('[data-action="zoom-in"]').addEventListener('click', function () {
        peaksInstance.zoom.zoomIn();
      });

      document.querySelector('[data-action="zoom-out"]').addEventListener('click', function () {
        peaksInstance.zoom.zoomOut();
      });

      document.querySelector('button[data-action="add-startEnd-point"]').addEventListener('click', function () {
        //var points = peaksInstance.points.getPoints();
        // console.log("*** add start end points  all points ***");
        // console.log(peaksInstance.points.getPoints());
        // console.log("*** end  points  ***");

        var startPoint = peaksInstance.points.getPoint(startPointId);
        var endPoint = peaksInstance.points.getPoint(endPointId);
        const curTime = peaksInstance.player.getCurrentTime();

        if (!startPoint && !endPoint) { //第一個點
          peaksInstance.points.add({
            time: curTime,
            labelText: '起點',
            editable: true
          });
          startPointId = peaksInstance.points.getPoints()[peaksInstance.points.getPoints().length - 1].id;
          // document.querySelector("#startPointTime").value = curTime.toString();
        }
        else if (!endPoint) { //只有起點
          if (curTime < startPoint.time) { //換起點
            startPoint.update({
              labelText: '終點'
            })
            peaksInstance.points.add({
              time: curTime,
              labelText: '起點',
              editable: true
            });
            endPointId = startPointId;
            startPointId = peaksInstance.points.getPoints()[peaksInstance.points.getPoints().length - 1].id;
            // document.querySelector("#endPointTime").value = document.querySelector("#startPointTime").value;
            // document.querySelector("#startPointTime").value = curTime.toString();
          }
          else {
            peaksInstance.points.add({
              time: curTime,
              labelText: '終點',
              editable: true
            });
            endPointId = peaksInstance.points.getPoints()[peaksInstance.points.getPoints().length - 1].id;
            // document.querySelector("#endPointTime").value = curTime.toString();
          }
        }
        else { //兩個點都有->更新時間

          if (curTime < startPoint.time) {
            startPoint.update({
              time: curTime
            });
            // document.querySelector("#startPointTime").value = curTime.toString();
          }
          else {
            endPoint.update({
              time: curTime
            });
            // document.querySelector("#endPointTime").value = curTime.toString();
          }
        }
        //document.querySelector('button[data-action="add-startEnd-point"]').unbind();
      });

      document.querySelector('button[data-action="add-tag-point"]').addEventListener('click', function () {
        if (!peaksInstance.points.getPoint(tagPointId)) {
          peaksInstance.points.add({
            time: peaksInstance.player.getCurrentTime(),
            labelText: '標記',
            editable: true
          });
          tagPointId = peaksInstance.points.getPoints()[peaksInstance.points.getPoints().length - 1].id;
        }
        else {
          peaksInstance.points.getPoint(tagPointId).update({
            time: peaksInstance.player.getCurrentTime()
          })
        }
        document.querySelector("#tagPointTime").value = peaksInstance.player.getCurrentTime().toString();
        //save = peaksInstance.player.getCurrentTime();
      });

      document.querySelector('button[data-action="remove-tag-point"]').addEventListener('click', function () {
        peaksInstance.points.removeById(tagPointId);
        tagPointId = '';
        document.querySelector("#tagPointTime").value = "";
      });

      // 解決滑鼠拖拉導致起終點交換問題
      peaksInstance.on('points.dragend', function (point) {
        const startPoint = peaksInstance.points.getPoint(startPointId);
        const endPoint = peaksInstance.points.getPoint(endPointId);
        if (startPoint && endPoint) {
          // 起終點交換
          if ((point._id == startPointId && point._time > endPoint.time) || (point._id == endPointId && point._time < startPoint.time)) {
            endPoint.update({
              labelText: '起點'
            });
            startPoint.update({
              labelText: '終點'
            });

            var tmp = startPointId;
            startPointId = endPointId;
            endPointId = tmp;
          }
        }
        const tagPoint = peaksInstance.points.getPoint(tagPointId);
        if(tagPoint){
          document.querySelector("#tagPointTime").value = tagPoint.time;
        }
        else{
          document.querySelector("#tagPointTime").value = "";
        }


      });

      document.querySelector('button[data-action="print"]').addEventListener('click', function (event) {
        // console.log('=================== print =====================');
        // console.log('start point: ');
        // console.log(startPointId);
        // console.log(peaksInstance.points.getPoint(startPointId));
        // console.log('end point: ');
        // console.log(endPointId);
        // console.log(peaksInstance.points.getPoint(endPointId));
        // console.log('tag point: ');
        // console.log(tagPointId);
        // console.log(peaksInstance.points.getPoint(tagPointId));
        // console.log("===============================================");
      });


      destoryPeaksInstance = function () {
        // console.log('cut');
        peaksInstance.points.removeAll();
        //peaksInstance.views.destroyZoomview();
        //peaksInstance.views.destroyOverview();
        peaksInstance.destroy();
        startPointId = '';
        endPointId = '';
        tagPointId = '';
        // console.log('destroy');
      }

      getPointsTime = function () {
        var startPoint = peaksInstance.points.getPoint(startPointId);
        if (startPoint) {
          document.querySelector("#startPointTime").value = startPoint.time.toString();
        }
        else {
          document.querySelector("#startPointTime").value = "";
        }
        var endPoint = peaksInstance.points.getPoint(endPointId);
        if (endPoint) {
          document.querySelector("#endPointTime").value = endPoint.time.toString();
        }
        else {
          document.querySelector("#endPointTime").value = "";
        }
        var tagPoint = peaksInstance.points.getPoint(tagPointId);
        if (tagPoint) {
          document.querySelector("#tagPointTime").value = tagPoint.time.toString();
        }
        else {
          document.querySelector("#tagPointTime").value = "";
        }

      }

    });

  })(peaks);
}

// loadWaveForm(filePath);