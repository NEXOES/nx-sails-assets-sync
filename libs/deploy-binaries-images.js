/// <reference path="../typings/index.d.ts" />
var path = require('path');
var _ = require('lodash');
var async = require('async');
var gulp = require('gulp');
module.exports = function (moduleDef, options, callback) {
    var notify = console.log;
    var onError = console.error;
    var cwd = path.join(__dirname);
    var appRoot = path.join(cwd, '../../../');
    var stInstallerRoot = path.join(cwd, '../');
    // local dependencies from installer
    var fsePath = path.join(stInstallerRoot, 'node_modules', 'fs-extra');
    var fse = require(fsePath);
    var clientSourcePath = path.join(cwd, '../../', moduleDef.name, 'client/images');
    var clientDestinationRoot = path.join(appRoot, 'assets/images/dependencies');
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
            var fileTypesExpr = 'gif|jpg|jpeg|tiff|png|svg';
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
            notify(moduleDef.name + ' client images successfully installed into... ' + clientDestinationPath);
        }
        else {
            notify(moduleDef.name + ' client images could not be installed into... ' + clientDestinationPath);
        }
        callback(err);
    });
};
//# sourceMappingURL=deploy-binaries-images.js.map