var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roleSchema = new Schema({
    name: String,
    role: {
        type: String,
        unique: true,
        required: true
    },
    allows: [String]
});

module.exports = mongoose.model('role', roleSchema);
