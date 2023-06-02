var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var camerafieldSchema = new Schema({
    title: String,
    name: String,
    streamUrl: String,
    wsPort: String,
});

module.exports = mongoose.model('camerafield', camerafieldSchema);
