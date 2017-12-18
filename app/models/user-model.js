var mongoose = require('mongoose'),
	crypto = require('crypto'),
	Schema = mongoose.Schema,
	propertiesToExclude = [ 'password'];

// schema ===
var UserSchema = new Schema({
	name: String,
	email: String,
	username: {
		type: String,
		trim: true,
		unique: true
	},
	lastLogin: String,
	roles: [String]
});

// @override ===
UserSchema.set('toJSON', {
	transform: function(doc, ret, options) {
		for(var key in ret) {
			if(propertiesToExclude.indexOf(key) >= 0) {
				delete ret[key];
			}
		}

		return ret;
	}
});

// pre (save) ===

mongoose.model('User', UserSchema);