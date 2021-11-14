var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//#母牛分娩特殊叫聲
var specialsoundSchema = new Schema({
    type: { //define false->nornal or true->innormal
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('specialsound', specialsoundSchema);