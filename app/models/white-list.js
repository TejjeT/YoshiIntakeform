var mongoose = require('mongoose');

var whiteListSchema = mongoose.Schema({
    userName: String,
    displayName: String,
    isApproved: Boolean,
    mail: String,
    isAdmin: Boolean
});
mongoose.connect('mongodb://localhost:22223/whiteList');
module.exports = mongoose.model('WhiteList', whiteListSchema);
