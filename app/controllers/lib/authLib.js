 
 exports.isLoggedIn = function (req, res, next) {
    // Route middleware to make sure a user is logged in
     console.log("inside isloggedIN"+req.isAuthenticated());
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the log in page
    res.redirect('/login');
};


 exports.authenticate = function (req, res, next) {
     console.log("inside autheticate"+req.isAuthenticated());
    if (req.isAuthenticated()) {
        return next();
    }
 else {
        // if they aren't redirect them to the log in page
        res.redirect('/login');
    }
};


 exports.isAdminLoggedIn = function (req, res, next) {
    // Route middleware to make sure an admin user is logged in
    if (req.isAuthenticated() && req.user.isAdmin)
        return next();
    // if they aren't redirect them to the log in page
    res.redirect('/login');
};
