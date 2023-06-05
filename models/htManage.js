var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var htManageSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
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
}, {collection: 'htManage'});

module.exports = mongoose.model('htManage', htManageSchema);
