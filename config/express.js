
	

var config = require('./config'),
	biUtil = require('../app/biUtil');
var bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	express = require('express'),
	expressSession = require('express-session'),
    flash = require('connect-flash')
	favicon = require('favicon'),
	logger = require('morgan'),
	passport = require('passport'),
    authLib=require('./../app/controllers/lib/authLib.js');
	path = require('path');
var env= 'production';


// These are not AJAX / API URLs...they are view urls

var authRequiredUrls=['/fdm'];
module.exports = function() {
	var app = express();
    
 

    
	// self-signed certificate stuff
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

	// uncomment after placing your favicon in /public
	//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

	// must use cookieParser() before expressSession()
	// has to go through this first, actually don't need it any more???
    
 


    require('./passport.js')(passport);
    
   
	app.use(cookieParser());
 
	app.use(expressSession({
	secret: 'OurSuperSacredFdmsCookieSecret',
    cookie:{},
    resave: true,
    saveUninitialized: true
	}));
    
    app.use(bodyParser.urlencoded({extended: true}));
  	app.use(bodyParser.json());
      
      
    app.use(passport.initialize());
    app.use(passport.session());
    
    
    app.use(flash());
    // Enable CORS on all routes
   
   app.set('views', './app/views');
   app.set('view engine', 'jade');
   
   	//app.set('view engine', 'ejs');
    app.disable('x-powered-by');
	

	//////////////////////////////////////////////////
	// JS, CSS, img, etc.
	//////////////////////////////////////////////////
	//app.use(express.static('./public'));

   app.use(express.static('./public')).listen(config.port, '127.0.0.1');
   
   app.use(function(req, res, next) {
  var allowedOrigins = ['http://127.0.0.1:22222', 'http://localhost:22222'];
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

	//////////////////////////////////////////////////
	// no unauthorized access to "/fdm", or whatever
	// the configuration is
	//////////////////////////////////////////////////
    

	
    app.all(config.appPrefix + '*', ensureAuthenticated, function(req, res, next) {
		next();
	});



   app.use(function (req, res, next) {
        res.locals.isProduction = (env === 'production');
        res.locals.user = req.user;
        console.log("USER"+JSON.stringify(req.user));
        next();
    });

	//////////////////////////////////////////////////
	// runtime logging
	//////////////////////////////////////////////////
    
    
	app.use(function(req, res, next) {
		 console.log(req.url);
         
         
        // Print the response headers
        for (header in response.headers) {
            var value = response.headers[header];
            util.puts(header + ': ' + value);
        }
        util.puts('');
        // Print the body
        util.puts(body);

		next();
	});

    
    

	//////////////////////////////////////////////////
	// primary application routes
	//////////////////////////////////////////////////
    
    
    require('../app/routes/index.route.js')(app,passport);
        
        
 
	
	


	// Since this is the last non-error-handling
	// middleware used, we assume 404, as nothing else
	// responded.  app.use() with no mount path is executed for every
	// request that has not been addressed
	app.use(function(req, res, next) {
		res.render('error', {
			status: 404,
			message: 'The location ' + req.url + ' not found.'
		});
	});

	// error-handling middleware takes the same form as regular
	// middleware, however it requires an arity of 4, AKA the signature
	// (err, req, res, next) when connect has an error, it will
	// invoke ONLY error-handling middleware
	app.use(function(err, req, res, next) {
		res.render('error', {
			status: err.status || 500,
			message: err
		});
	});

	return app;
};

/**
 * @function
 * @description Middleware injection to require authorization for certain sections
 * This does not handle AJAX/XHR request URLs
 */



function ensureAuthenticated(req, res, next) {
    console.log("inside ensureAuthenticated"+req.isAuthenticated());
  if (req.isAuthenticated())

    return next();
  else
  res.redirect('/login');
  
    // Return error content: res.jsonp(...) or redirect: res.redirect('/login')
}

 function authRequired(req, res, next) {
     console.log("check authRequired in express"+req.url);
     console.log("Token value"+biUtil.getXAuthToken(req));
     
 	if(biUtil.isAuthenticatedAndActive(biUtil.getXAuthToken(req)) && authRequiredUrls.indexOf(req.url.replace(/\/+$/, '')) < 0) {
       next();
	} else {
	       
         console.log("redirecting to login")
		res.redirect('/login');	
	}
 }
 
 
 
