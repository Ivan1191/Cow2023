var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventASchema = new Schema({
    tagDate: {
        type: Date,
    },
    starttime: {
        type: Date,
    },
    endtime: {
        type: Date,
    },
    hard: {
        type: String,
        enum: ['一般牛鳴', '自然分娩', '其他分娩'],
        default: '一般牛鳴',
        required: true
    },
    cowLabels: {
        type: String,
        required: true
    },
    cowNumbers: {
        type: String,
        required: true
    },
    dailyRecord: String,
    finish: Boolean,
    audiocut: {
        type: Map,
        of: Schema.Types.Mixed
    },
    createdTime: {
        type: Date,
        required: true
    },
    createdAuthor: {
        type: String,
        required: true
    },
    lastModifiedTime: {
        type: Date,
        required: true
    },
    lastModifiedAuthor: {
        type: String,
        required: true
    },

});

module.exports = mongoose.model('eventA', eventASchema);
