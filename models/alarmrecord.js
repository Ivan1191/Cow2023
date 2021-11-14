var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var alarmrecordSchema = new Schema({
    time: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('alarmrecord', alarmrecordSchema);