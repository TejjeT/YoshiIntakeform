var mongoose = require('mongoose'),
	crypto = require('crypto'),
	Schema = mongoose.Schema,
    
	propertiesToExclude = [ 'password'];

// schema ===
var processSchema = new Schema({
	pname: String,
	pdesc: String,
    processfreq : String,
	ProcessLOB : String,
    fdmUser : String,
    ReqUser: String,
    processbyid: String
});





mongoose.model('Processes', processSchema);