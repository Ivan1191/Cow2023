//useless
//const WaveformData = require('waveform-data');
/*fetch('F:/成大/ISMP/計畫/jsTest/ttt/track.json')
  .then(response => response.json())
  .then(json => WaveformData.create(json))
  .then(waveform => {
    console.log(`Waveform has ${waveform.channels} channels`);
    console.log(`Waveform has length ${waveform.length} points`);
  });*/
/*
var data_obj = require("json-loader!F:/成大/ISMP/計畫/jsTest/ttt/track.json");
function ouputData(){
    console.log(data_obj);
  }
  ouputData();

*/


// audiowaveform -i track.mp3 -o track.json -b 8 -z 256


//const fetch = require("node-fetch");
const WaveformData = require('waveform-data');
var fs = require('fs'),
    fabric = require('fabric').fabric,
    out = fs.createWriteStream('output.png');
let jsonstr = fs.readFileSync('track.json', 'utf-8');
let json = JSON.parse(jsonstr);
//var canvas = new fabric.StaticCanvas('canvas');
// console.log('----------------')
// console.log(json);
/*
canvas.loadFromJSON(json, function() {

    //first render
    canvas.renderAll.bind(canvas);

    //save the canvas as SVG in server
    var svgoutput = canvas.toSVG();
    fs.writeFile("output.svg", svgoutput, function(err) {
        if (err) throw err;
    });
});
*/
/*
const waveform = WaveformData.create('F:/成大/ISMP計畫/jsTest/ttt/track.json');


  const scaleY = (amplitude, height) => {
  const range = 256;
  const offset = 128;

  return height - ((amplitude + offset) * height) / range;
}

const ctx = canvas.getContext('2d');
ctx.beginPath();

const channel = waveform.channel(0);

// Loop forwards, drawing the upper half of the waveform
for (let x = 0; x < waveform.length; x++) {
  const val = channel.max_sample(x);

  ctx.lineTo(x + 0.5, scaleY(val, canvas.height) + 0.5);
}

// Loop backwards, drawing the lower half of the waveform
for (let x = waveform.length - 1; x >= 0; x--) {
  const val = channel.min_sample(x);

  ctx.lineTo(x + 0.5, scaleY(val, canvas.height) + 0.5);
}

ctx.closePath();
ctx.stroke();
ctx.fill();
*/