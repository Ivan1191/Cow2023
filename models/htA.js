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
    // location: {
    //     type: String,
    //     default: ""
    // },
    create_at: {
        type: Date,
        default: new Date()
    }
}, {collection: 'htA'});

module.exports = mongoose.model('htA', htASchema);
