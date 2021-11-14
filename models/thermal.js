var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//熱窘迫
var thermalSchema = new Schema({
    type: { //define false->nornal or true->innormal
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('thermal', thermalSchema);