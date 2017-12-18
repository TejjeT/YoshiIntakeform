var config = require('./config'),
	mongoose = require('mongoose');

module.exports = function() {
	var db = mongoose.connect('localhost:22223');
	require('../app/models/user-model');
        require('../app/models/white-list');

	return db;
};
