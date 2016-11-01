/// <reference path="../typings/index.d.ts" />
var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var gulp = require('gulp');
var async = require('async');
module.exports = function (moduleDef, options, callback) {
    var notify = console.log;
    var clientSourcePath = path.join(options.appRootAbsolute, 'node_modules', moduleDef.name, 'client/data');
    var clientDestinationRoot = path.join(options.appRootAbsolute, 'assets/data/dependencies');
    var clientDestinationPath = path.join(clientDestinationRoot, moduleDef.name);
    async.series([
        function (next) {
            fs.access(clientSourcePath, fs.R_OK, function (err) {
                if (err) {
                    return callback();
                }
                next();
            });
        },
        function (next) {
            fs.ensureDir(clientDestinationPath, function (err) {
                next(err);
            });
        },
        function (next) {
            var fileTypesExpr = 'json';
            function copyFunc(done) {
                gulp
                    .src(clientSourcePath + '/**/*.+(' + fileTypesExpr + ')')
                    .pipe(gulp
                    .dest(clientDestinationPath)
                    .on('end', function () {
                    if (done) {
                        done();
                    }
                }));
            }
            copyFunc(function () {
                next();
            });
        }
    ], function (err) {
        if (!err) {
            notify(moduleDef.name + ' client data successfully installed into... ' + clientDestinationPath);
        }
        else {
            notify(moduleDef.name + ' client data could not be installed into... ' + clientDestinationPath);
        }
        callback(err);
    });
};
//# sourceMappingURL=deploy-binaries-data.js.map