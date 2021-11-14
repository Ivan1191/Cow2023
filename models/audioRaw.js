var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var audioRawSchema = new Schema({
    audioname: String,
    starttime: {type: Date},
    // ctime : { type: Date, default: Date.now },
    // datetime: String,
    endtime: {type: Date},
    duration: String,
    microid: String,
    filePath: String
});

module.exports = mongoose.model('audioRaw', audioRawSchema);
