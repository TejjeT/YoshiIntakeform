var config = require('../config/config'),
	atob = require('atob'),
	btoa = require('btoa'),
	moment = require('moment');

/**
 * @function
 * @description Decode the first part of the token into an object
 * {
 *	id: NUMBER
 *	username: String
 *	merchantDomains[]
 *	expires: LONG 1444578192214
 * 	roles []
 * }
 */


exports.decodeToken = function(token) {
    console.log("inside decodeToken biUtils"+JSON.stringify(token));
	var parts = token.split('.');
	if(parts.length > 0) {
        console.log("decodetoken"+JSON.parse(atob(parts[0])))
		return JSON.parse(atob(parts[0]));
	} else {
		return {};
	}
};

/**
 * @function
 * @description Generate "header" object to be passed with request
 */
exports.generateRequestHeaders = function(conf, authToken) {
	var ret = {};

	// ret['Authorization']

	if(conf.hasOwnProperty('authHeader') && conf.authHeader) { ret.Authorization = config.authHeaderValue; }

	if(conf.hasOwnProperty('json') && conf.json) { ret['Content-Type'] = 'application/json'; }

	if(conf.hasOwnProperty('xhr') && conf.xrh) { ret['X-Requested-With'] = 'XMLHttpRequest'; }

	if(authToken !== undefined) { ret['x-auth-token'] = authToken; }
    console.log("inside bi utils generateRequestHeaders"+ret);
	return ret;
};

/**
 * @function
 * @description Retrieve the account ID from the token
 * @param request Request object
 */
exports.getAccountIdFromToken = function(request) {
	var ret;
 console.log("inside bi utils getAccountIdFromToken"+request.cookies[config.sessionTokenName]);
	try {
        console.log()
		var tokenAsJson = JSON.parse(atob(request.cookies[config.sessionTokenName].split('.')[0]));
		if(tokenAsJson.hasOwnProperty('displayName')) {
			ret = tokenAsJson.displayName;
		} else {
			ret = null;
		}
	} catch(err) {
		ret = null;
	}

	return ret;
};

/**
 * @function
 * @description Retrieve the x-auth-token value from config or session
 * @param request Request object
 */
exports.getXAuthToken = function(request) {
    console.log("inside biUtils XAUthToken"+request.cookies[config.sessionTokenName]);
	return request.cookies[config.sessionTokenName];
};



/**
 * @function
 */
exports.generateStubToken = function() {

	var userPart = {
		id: 1,		// this is the ACCOUNT ID, not the USER ID !!!
		username: 'admin@capitalone.com',
		authorities: [{
			id: 1,
			authority: 'ROLE_ADMIN',
			name: 'System Admin'
		}],
		tokenExpiry:  moment().add(1, 'month').format('x'),
		//tokenExpiry:  moment().add(1, 'minutes').format('x'),
		passwordExpiry: null,
		incorrectAttempts: 0,
		archived: false,
		locked: false
	};

	var saltPart = '';

	return btoa(JSON.stringify(userPart)) + '.' + saltPart;
};

/**
 * @function
 * @description Determine if user has the role "ADMIN"
 */
exports.isAdmin = function(token) {
	var ret = false;

	if(token !== undefined) {
		var decoded = this.decodeToken(token);
		// authorities: [{id: 1, authority: 'ROLE_ADMIN', name: 'System Admin'}]

		var match;
		try {
			match = decoded.authorities.filter(function(f) {
				return f.authority == 'ROLE_ADMIN';
			});
			if(match.length > 0 ) { ret = true; }
		} catch(err) {
			// pass
		}
	}

	return ret;
};

/**
 * @function
 * @description Determine if user is still logged and their token is not expired
 */
exports.isAuthenticatedAndActive = function(token) {
    console.log("isAuthenticatedAndActive"+token)
	var ret = false;

	if(token !== undefined) {
		var decoded = this.decodeToken(token);
        console.log("decode token "+decoded)
		if(decoded.hasOwnProperty('tokenExpiry')) {

			// expiry > now timestamp
			if(decoded.tokenExpiry > moment().format('x')) {
				ret = true;
			}
		}
	}

	return ret;
};
