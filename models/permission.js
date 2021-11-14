var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var permissionSchema = new Schema({
    name: String,
    permission: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    }
});

module.exports = mongoose.model('permission', permissionSchema);
