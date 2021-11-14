var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventBSchema = new Schema({
    tagDate: {
        type: Date,
        default: Date.now
    },
    zeroDate: {
        type: Date,
        default: Date.now
    },
    tenDate: {
        type: Date,
        default: Date.now
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
    audioCat: {
        type: String,
        enum: ['一般', '自然分娩', '其他分娩'],
        default: '一般'
    },
    filePath: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    tagPointTime: String,
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
    microId: {
        type: String,
        required: true
    },
    temperature: {
        type: String,
        default: '沒有溫度資訊'
    },
    humidity: {
        type: String,
        default: '沒有濕度資訊'
    },
    audioStart: {
        type: String,
        default: '開始音檔',
        required: true
    },
    audioEnd: {
        type: String,
        default: '結束音檔',
        required: true
    },
    audioStartTime: {
        type: String,
        default: '開始音檔時間',
        required: true
    },
    audioEndTime: {
        type: String,
        default: '結束音檔時間',
        required: true
    },
    sourceId: {
        type: String,
        default: 'sourceId',
        required: true
    },
});

module.exports = mongoose.model('eventB', eventBSchema);
