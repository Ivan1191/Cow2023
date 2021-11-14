var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: {
        type: String,
        default: ''
    },
    loginID: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    email: {
        type: String,
        unique: true,
        required: false
    },
    tel: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    dept: {
        type: String,
        default: ''
    },
    line_token: {
        type: String,
        default: ''
    },
    roles: {
        type: [String],
        required: true,
        default: ''
    },
    audioIDs: {
        type: Array,
        default: []
    },
    tempIDs: {
        type: Array,
        default: []
    },
    workspaceIDs: {
        type: Array,
        default: []
    },
    alert_specialsound: {
        type: Boolean,
        default: false
    }
});


// generates hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, 8);
};

// compares the password
userSchema.methods.validateHash = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('user', userSchema);
