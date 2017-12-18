var config = require('../../../config/config'),	
	atob = require('atob'),
	biUtil = require('../../biUtil'),
	fs = require('fs'),
	http = require('http'),
	moment = require('moment'),
	path = require('path'),
	request = require('request');

exports.authenticate = function(req, res, next) {

	var authFailResponse = {
		success: false,
		env: process.env.NODE_ENV,
		statusMessage: '',
		setStatusMessage: function(msg) {
			this.statusMessage = msg;
		}
	};

	//////////////////////////////////////////////////
	// - NO TOKEN CHECK....x-auth-token not required
	// - stub
	// - ready
	//////////////////////////////////////////////////
    console.log("inside auth lib");

		var options = {
			url:  'http://localhost:22222/authenticate',
			method: 'POST',
			headers: biUtil.generateRequestHeaders({authHeader: config.authHeader, json: true}),
			json: {
				username: req.body.username || '',
				password: req.body.password || ''
			}
		};
        
        
        
 console.log("inside auth lib"+JSON.stringify(options));
		request(options, function(error, response, body) {
            console.log("inside auth lib  inside logn");
			if(response === undefined) {
                  console.log("inside auth lib  response from login undefined");
				authFailResponse.setStatusMessage('Internal server error.');
				res.json(authFailResponse);
			} else if(response.statusCode == 200) {
                 console.log("inside auth lib  response from login success");
				if(response.headers.hasOwnProperty('x-auth-token')) {
                      console.log("inside auth lib  inside logn");
					var token = response.headers['x-auth-token'];
					var decoded = JSON.parse(atob(token.split('.')[0]));
					var accountId = decoded.id;
                    var resp = JSON.parse(body2);
                       console.log("inside auth lib  inside logn sending succcess response");
				    res.cookie(config.sessionTokenName, token);
					res.json({success: true});

				} else {
                      console.log("response does not have auth header inside authLib");
					res.json(authFailResponse);
				}


				if(response.headers.hasOwnProperty('x-auth-token')) {
					res.cookie(config.sessionTokenName, response.headers['x-auth-token']);
					res.json({success: true, appPrefix: config.appPrefix});
				} else {
					authFailResponse.setStatusMessage(response.statusMessage);
					res.json(authFailResponse);
				}
			} else {
				authFailResponse.setStatusMessage(response.statusMessage);
				res.json(authFailResponse);
			}
		});
	
};

/**
 * @function
 */
function accountIsArchived(data) {
	return data.account.archived;
}

/**
 * @function
 */
function accountIsEnabled(data) {
	return data.account.enabled;
}

/**
 * @function
 * @description Determine if account is expired
 */
function accountIsExpired(data) {
	if(data.passwordUpdates === undefined || data.passwordUpdates.length === 0) {
		return false;
	}

	var match, ret;

	try {
		match = data.passwordUpdates.filter(function(f) {
			return f.createTime !== null && f.expiry !== null;
		}).sort(function(a, b) {
			return a.expiry > b.expiry ? -1 : 1;
		})[0];

		ret = match.expiry < moment().format('x') ? true : false;
	} catch(err) {
		ret = false;
	}

	return ret;
}

/**
 * @function
 */
function accountIsLocked(data) {
	return data.account.locked;
}