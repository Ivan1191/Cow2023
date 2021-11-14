var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var htASchema = new Schema({
    temperature: {
        type: String,
        default: ""
    },
    humidity: {
        type: String,
        default: ""
    },
    create_at: {
        type: Date,
        default: new Date()
    }
}, {collection: 'htC'});

module.exports = mongoose.model('htC', htASchema);
