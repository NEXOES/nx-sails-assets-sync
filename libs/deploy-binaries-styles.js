/// <reference path="../typings/index.d.ts" />
var path = require('path');
var _ = require('lodash');
var async = require('async');
var gulp = require('gulp');
var fs = require('fs-extra');
module.exports = function (moduleDef, options, callback) {
    var notify = console.log;
    var clientSourcePath = path.join(options.appRootAbsolute, 'node_modules', moduleDef.name, 'client/styles');
    var clientDestinationRoot = path.join(options.appRootAbsolute, 'assets/styles/dependencies');
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
            var fileTypesExpr = 'css';
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
            notify(moduleDef.name + ' client styles successfully installed into... ' + clientDestinationPath);
        }
        else {
            notify(moduleDef.name + ' styles could not be installed into... ' + clientDestinationPath);
        }
        callback(err);
    });
};
//# sourceMappingURL=deploy-binaries-styles.js.map