/// <reference path="../typings/index.d.ts" />
var path = require('path');
var _ = require('lodash');
var async = require('async');
var fse = require('fs-extra');
var gulp = require('gulp');
module.exports = function (moduleDef, options, callback) {
    var notify = console.log;
    var onError = console.error;
    var cwd = path.join(__dirname);
    var appRoot = path.join(cwd, '../../../');
    var clientSourcePath = path.join(cwd, '../../', moduleDef.name, 'client/fonts');
    var clientDestinationRoot = path.join(appRoot, 'assets/fonts/dependencies');
    var clientDestinationPath = path.join(clientDestinationRoot, moduleDef.name);
    async.series([
        function (next) {
            fse.access(clientSourcePath, fse.R_OK, function (err) {
                if (err) {
                    return callback();
                }
                next();
            });
        },
        function (next) {
            fse.ensureDir(clientDestinationPath, function (err) {
                next(err);
            });
        },
        function (next) {
            var fileTypesExpr = 'ttf|otf|woff|woff2';
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
            notify(moduleDef.name + ' fonts successfully installed into... ' + clientDestinationPath);
        }
        else {
            notify(moduleDef.name + ' fonts could not be installed into... ' + clientDestinationPath);
        }
        callback(err);
    });
};
//# sourceMappingURL=deploy-binaries-fonts.js.map