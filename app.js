
/**
 * Module dependencies.
 */
process.on('uncaughtException', function (err) {
    //console.error('uncaughtException:', err.message);
    console.error(err.stack);
    process.exit(1)
});

var chalk = require('chalk');
var configFile,
	environmentConfiguration,
	nodePort;

	configFile = process.env.NODE_ENV == './config/config.js';
	try {
		environmentConfiguration = require(configFile);
		nodePort = environmentConfiguration.port;

	} catch(err) {
		nodePort = 3000;

	}


/////////////////////////////////////
var config = require('./config/config'),
    express = require('./config/express');

var app = express();

// all environments

app.listen(nodePort);
module.exports = app;
console.log(chalk.red(' Server started ' ));
