var mongoose = require('mongoose')
    , fs = require('fs')
    , ldap = require('ldapjs')
    , async = require('async')
    , _ = require('lodash-compat')
    , WhiteListUser = require('./white-list');

var ADMIN_LOGIN = 'USERNAME'
    , ADMIN_PASSWORD = 'xxxxx';


// Connect to mongo
mongoose.connect('mongodb://localhost:22223/whiteList');

// Get the users from the existing config file
//var users = _.keys(JSON.parse(fs.readFileSync('./../../config')).USERS);
var users =['','']
// Make the connection to LDAP
var client = ldap.createClient({url: 'ldap://LDAPURL'});
client.bind('domain\\' + ADMIN_LOGIN, ADMIN_PASSWORD, function (err) {
    if (err) {
        // Invalid credentials / user not found are not errors but login failures
        if (err.name === 'InvalidCredentialsError' || err.name === 'NoSuchObjectError' ||
            (typeof err === 'string' && err.match(/no such user/i))) {
            console.log('Invalid username/password');
            process.exit();
        }
        // Other errors are (most likely) real errors
        console.log(err);
        process.exit();
    }

    // Go through each user and make sure they are added to the White List
    async.eachSeries(users, addToWhiteList, function (err) {
            if (err) {
                console.log('eachSeries Error: ' + err);
                process.exit();
                //unBindClient();
            }
            console.log('all done!!!');
            process.exit();
            //unBindClient();
        }
    );

});

function unBindClient() {
    client.unbind(function (err) {
        if (err) console.log('unbinding error, ', err);
        process.exit();
    });
}

function addToWhiteList(username, asyncCB) {
    // Add a user to the white list table
    var opts = {
        server: 'ldap://LDAPURL',
        filter: '(saa={{username}})',
        scope: 'sub',
        attributes: [
            'displayName', 'mail'
        ],
        searchBase: '',
        username: username
    };

    // Replace the username in the different options
    opts.filter = opts.filter.replace(/{{username}}/g, username);

    // Run through the different processes for logging in a user: white-list, LDAP-bind, LDAP-search
    async.waterfall([
        function isUserWhiteListed(cb) {
            // Check to see if the username is found in the white listed user database
            WhiteListUser.findOne({userName: opts.username}, function (err, user) {
                if (err || user) {
                    console.log('user ' + username + ' exists');
                    cb('ok');
                    return;
                }
                return cb(); // username is not yet on whitelist
            })
        },
        function getUserCredentials(cb) {
            client.search(opts.searchBase, opts, function (err, res) {

                if (err) {
                    return cb(err);
                }

                var items = [];
                res.on('searchEntry', function (entry) {
                    items.push(entry.object);
                });

                res.on('error', function (err) {
                    return cb(err);
                });
                res.on('end', function (result) {
                    var err = '';
                    if (result.status !== 0) {
                        err = 'non-zero status from LDAP search: ' + result.status;
                        cb(err);
                    }
                    return cb(null, items[0]);
                });
            });
        },
        function saveUserToWhiteList(user, cb) {
            var User = new WhiteListUser({
                userName: opts.username,
                displayName: user.displayName,
                isApproved: true,
                mail: user.mail
            });

            User.save(function (err) {
                if (err) return cb(err);

                console.log('User ' + opts.username + ' saved successfully!');
                return cb();
            });
        }
    ], function (err) {
        if (err == 'ok') {
            asyncCB();
            err = null;
        }
        if (err) {
            console.log(err);
            asyncCB(err);
        }
        asyncCB();
    });
}
