var config = require('../../config/config'),
authLib = require('../controllers/lib/auth.lib');
passport = require('passport');
var btoa    = require('btoa');
    
exports.authenticate = function(req, res, next ){
     console.log("inside login passport");
      passport.authenticate('ldap-login',function(err, user, info) {
      if (err) { return next(err) }
      if (!user) { return res.json( { message: info.message }) } 
    
    
     var token = user;
       
        // return the information including token as JSON
        res.setHeader('content-type', 'application/javascript'); 
        res.setHeader('x-access-token', token); 
        //res.cookie(config.sessionTokenName, token);  
       next()
    
    })(req, res, next)};
      



exports.login = function(req, res, next) {
	authLib.authenticate(req, res, next);
};

exports.logout = function(req, res, next) {
	res.clearCookie(config.sessionTokenName);
	// was req.logout() for passport()...don't need it...@throws "undefined is not a function"
	res.redirect('/login');
};

exports.renderAdmin = function(req, res, next) {
	res.render('admin', {
		title: config.appName + ' : System Admin',
		cssSuffix: config.cssSuffix || '.css'
	});
};

exports.renderIndex = function(req, res, next) {
	res.render('fdm/index', {
		title: config.appName,
		cssSuffix: config.cssSuffix || '.css',
		authUser: {}
	});
};

exports.renderLogin = function(req, res, next) {
	res.render('login', {
		title: config.appName + ' : Login',
		cssSuffix: config.cssSuffix || '.css'
	});
};



exports.renderAbout = function(req, res, next) {
	res.render('fdm/about', {
		title: config.appName + ' : Login',
		cssSuffix: config.cssSuffix || '.css'
	});
};

exports.renderPage = function(req, res, next) {
	res.render('page', {
		title: config.appName,
		cssSuffix: config.cssSuffix || '.css'
	});
};

exports.unauthorized = function(req, res, next) {
	res.render('error', {
		status: '401 : Unauthorized',
		message: 'You are not authorized to access this resource.  Your session may have expired.',
		cssSuffix: config.cssSuffix || '.css'
	});
};