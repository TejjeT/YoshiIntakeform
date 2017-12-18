var LocalStrategy = require('passport-local').Strategy
    , ldap = require('ldapjs')
    , _ = require('lodash-compat')
    , async = require('async')
    , WhiteList = require('./../app/models/white-list');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        console.log("Serializing user"+user);
                done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        // Since we aren't passing much data within req.user, keep serialize and deserialize the same
          WhiteList.findOne({userName: user.cn.toLowerCase()}, function (err, user) {
                        if (err || _.isNull(user)) {
                            cb('User is not white listed');
                            return  done(null, false)
                        }
                      
                         done(null, user);; // username is found on the white list
                    })
       
    });

    // ======================================================================
    // LDAP LOCAL LOGIN STRATEGY
    // ======================================================================

    passport.use('ldap-login', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true,
            session: true
        },
        function (req, username, password, done) {

            // If the username is missing send back an error
            if (!username || !password) {
                return done(null, false, req.flash('loginMessage', 'Missing credentials'));
            }

            // Due to replacing {{username}}, keep this inside the function
            // On Search, return eid, location, state, title, office name, zip code, name, and manager level from LDAP
            var opts = {
                server: 'ldap://cof.ds.capitalone.com',
                filter: '(sAMAccountName={{username}})',
                scope: 'sub',
                attributes: [
                    'cn', 'l', 'st', 'title',
                    'physicalDeliveryOfficeName', 'postalCode', 'displayName', 'managerLevelDesc', 'mail'
                ],
                login: 'cof\\{{username}}',
                searchBase: 'dc=cof,dc=ds,dc=capitalone,dc=com',
                username: username,
                password: password
            };
            

            // Replace the username in the different options
            opts.filter = opts.filter.replace(/{{username}}/g, username);
            opts.login = opts.login.replace(/{{username}}/g, username);

            // Run through the different processes for logging in a user: white-list, LDAP-bind, LDAP-search
            async.waterfall([
                function isUserWhiteListed(cb) {
                    // Check to see if the username is found in the white listed user database
                    WhiteList.findOne({userName: opts.username.toLowerCase()}, function (err, user) {
                        if (err || _.isNull(user)) {
                            cb('User is not white listed');
                            return;
                        }
                      
                        cb(null, user); // username is found on the white list
                    })
                },
                function bindUser(user, cb) {
                    // Create a bind with the LDAP server for authentication
                    console.log("started binding"+opts.login);
                    var client = ldap.createClient({url: opts.server});
                     console.log("started binding password");
                    client.bind(opts.login, opts.password, function (err) {
                        if (err) {
                            // Invalid credentials / user not found are not errors but login failures
                              client.unbind(function(error) {if(error){console.log(error.message);} else{console.log('client disconnected');}});
                            if (err.name === 'InvalidCredentialsError' || err.name === 'NoSuchObjectError' ||
                                (typeof err === 'string' && err.match(/no such user/i))) {
                                cb('Invalid username/password');
                                return;
                            }
                            // Other errors are (most likely) real errors
                            
                            cb(err);
                            return;
                        }
                           
                        cb(null, client, user)
                    })
                },
                function getUserCredentials(client, user, cb) {
                      console.log("getting user creds for login");
                    // Get the user's credentials from LDAP for logging
                    client.search(opts.searchBase, opts, function (err, res) {

                        if (err) {
                            client.unbind(function(error) {if(error){console.log(error.message);} else{console.log('client disconnected');}});
                            cb(err);
                            return;
                        }

                        var items = [];
                        res.on('searchEntry', function (entry) {
                            items.push(entry.object);
                        });

                        res.on('error', function (err) {
                            cb(err);
                        });

                        res.on('end', function (result) {
                            var err = '';
                            if (result.status !== 0) {
                                err = 'non-zero status from LDAP search: ' + result.status;
                                cb(err);
                                return;
                            }
                            var obj = items[0];
                            obj.isAdmin = user.isAdmin;
                            console.log("async here in usercred");
                            client.unbind(function(error) {if(error){console.log(error.message);} else{console.log('client disconnected');}});
                            cb(null, obj);
                        });
                    });
                },
                function updateUser(user, cb) {
                    // Update the user's data in Mongo if it isn't already updated
                    WhiteList.update({userName: user.cn.toLowerCase()}, {
                        displayName: user.displayName,
                        mail: user.mail
                    }, function (err, numAffected) {
                        if (err) {
                            cb('Error updating');
                            return;
                        }
                        cb(null, user);
                    });
                     console.log("async here in usercred");
                }
            ], function (err, user) {
                 console.log("async here in last function after async");
                if (err) return done(null, false, req.flash('loginMessage', err));
                return done(null, user);
            });
        }
    ));
};