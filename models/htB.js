var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var htBSchema = new Schema({
    temperature: {
        type: String,
        default: ""
    },
    humidity: {
        type: String,
        default: ""
    },
    // location: {
    //     type: String,
    //     default: ""
    // },
    create_at: {
        type: Date,
        default: new Date()
    }
}, {collection: 'htB'});

module.exports = mongoose.model('htB', htBSchema);
