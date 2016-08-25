/// <reference path="../typings/index.d.ts" />
var path = require('path');
var async = require('async');
var fse = require('fs-extra');
var _ = require('lodash');
module.exports = function (moduleDef, options, callback) {
    // var appRoot = path.join(cwd, '../../../');
    var appRoot = require('nx-app-root-path').path;
    var appDependencyRoot = path.join(appRoot, options.sourceDir);
    var clientDestinationRoot = path.join(appRoot, options.targetDir);
    var dependencies = moduleDef.clientDependencies;
    async.waterfall([
        // NPM
        function (next) {
            var filesToDeploy = [];
            async.mapSeries(_.keys(dependencies), function (name, nextDependency) {
                var dependency = dependencies[name];
                if (!dependency.files) {
                    // we just assume the default nature of a javascript lib as a single js file named after the library
                    var target = path.join(appDependencyRoot, name, name + '.js');
                    var destination = path.join(clientDestinationRoot, name, name + '.js');
                    filesToDeploy.push({ target: target, destination: destination });
                }
                else {
                    _.each(dependency.files, function (file) {
                        var target = path.join(appDependencyRoot, name, file);
                        var normalizeFilename = require('../libs/normalize-filename');
                        var normalisedFile = normalizeFilename(file);
                        var destination = path.join(clientDestinationRoot, name, normalisedFile);
                        filesToDeploy.push({ target: target, destination: destination });
                    });
                }
                nextDependency();
            }, function (err) {
                next(err, filesToDeploy);
            });
        },
        function (filesToDeploy, next) {
            async.mapSeries(filesToDeploy, function (file, nextFile) {
                fse.copy(file.target, file.destination, function (err) {
                    if (!err) {
                        nextFile(null, file);
                    }
                    else {
                        nextFile(err);
                    }
                });
            }, function (err, filesDeployed) {
                next(err, filesDeployed);
            });
        }
    ], function (err, filesDeployed) {
        callback(err, filesDeployed);
    });
};
//# sourceMappingURL=deploy-dependencies.js.map