var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var audioTenSchema = new Schema({
    audioName: String,
    eventId: Schema.Types.ObjectId,
    microId: String,
    tagPointTime: String,
    filePath: String,
});

module.exports = mongoose.model('audioTen', audioTenSchema);
