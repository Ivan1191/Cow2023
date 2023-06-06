var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var audioClassManageSchema = new Schema({
    Name: String,
    MicId: String,
    filePath: String,
});

module.exports = mongoose.model('audioClassManage', audioClassManageSchema);
