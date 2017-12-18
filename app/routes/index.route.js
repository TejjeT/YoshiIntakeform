var config = require('../../config/config'),
    indexController = require('../controllers/index.controller');

module.exports = function(app,passport) {

    app.get(config.appPrefix, indexController.renderIndex);

    // protected page
    app.get(config.appPrefix + '/admin', indexController.renderAdmin);


    // general content here
    app.get(config.appPrefix + '/about', indexController.renderAbout);
      app.get(config.appPrefix + '/index', indexController.renderIndex);

    app.get('/', indexController.logout);

    app.get('/401', indexController.unauthorized);

    app.get('/logout', indexController.logout);

    app.get('/login', indexController.renderLogin);

   // app.post('/login', indexController.authenticate,indexController.renderIndex);

   // app.post('/authenticate', indexController.authenticate);

  app.post('/login',
  passport.authenticate('ldap-login'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log(req.user.displayName);
    console.log(req.isAuthenticated());
    req.logIn(req.user, function(err) {
              if (err) return next(err);
              console.log("Request Login supossedly successful.");
              req.header('Access-Control-Allow-Credentials', true);
              console.log(JSON.stringify(res.header));
              return res.redirect('/yoshi/index');
          });

});



}
