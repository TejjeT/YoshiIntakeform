var config = require('../../config/config'),
    passport = require('passport');



exports.getAllProcesses = function (req, res, next) {
    res.render('/yoshi/processes');
};


exports.getAllInputs = function (req, res, next) {
    res.render('/yoshi/inputs');
};


exports.getAllOutputs = function (req, res, next) {
    res.render('/yoshi/outputs');
};
