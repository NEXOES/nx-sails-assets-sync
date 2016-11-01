/// <reference path="../typings/index.d.ts" />

var path:any = require('path');
var async:Async = require('async');
var fse:any = require('fs-extra');
var _:any = require('lodash');

module.exports = function (moduleDef:any, options:any, callback:Function) {

    var appRoot = require('nx-app-root-path').path;
    var appDependencyRoot:string = path.join(appRoot, options.sourceDir);
    var clientDestinationRoot:string = path.join(appRoot, options.targetDir);

    var dependencies = moduleDef.clientDependencies;

    async.waterfall(
        [
            // NPM
            function (next:Function):void {

                var filesToDeploy:Array<{target:string, destination:string}> = [];

                async.mapSeries(
                    _.keys(dependencies),
                    function (name:any, nextDependency:Function):void {

                        var dependency:any = dependencies[name];

                        if (!dependency.files) {

                            // we just assume the default nature of a javascript lib as a single js file named after the library
                            var target:string = path.join(appDependencyRoot, name, name + '.js');
                            var destination:string = path.join(clientDestinationRoot, 'js', 'dependencies', name, name + '.js');

                            filesToDeploy.push({target: target, destination: destination});
                        }
                        else {
                            _.each(dependency.files, function (file:string):void {

                                var target:string = path.join(appDependencyRoot, name, file);

                                var normalizeFilename:any = require('../libs/normalize-filename');
                                var normalisedFile:string = normalizeFilename(file);

                                var determineAssetSection:any = require('../libs/determine-asset-section');
                                var assetSection:string = determineAssetSection(normalisedFile);

                                var destination:string = path.join(clientDestinationRoot, assetSection, 'dependencies', name, normalisedFile);

                                filesToDeploy.push({target: target, destination: destination});
                            });
                        }

                        nextDependency();

                    },
                    function (err:Error):void {
                        next(err, filesToDeploy);
                    }
                );
            }
            ,
            function (filesToDeploy:Array<{target:string, destination:string}>, next:Function):void {

                async.mapSeries(filesToDeploy,
                    function (file:{target:string, destination:string}, nextFile:Function):void {

                    fse.copy(file.target, file.destination, function (err:Error):void {

                            if (!err) {

                                if (options.config.echo) {
                                    console.log('Asset Sync... '+ file.target +' --> '+ file.destination +'... success !');
                                }

                                nextFile(null, file);
                            }
                            else {
                                console.error('Asset Sync... '+ file.target +' --> '+ file.destination);
                                console.error(err);
                                nextFile(err);
                            }
                        })
                    },
                    function (err:Error, filesDeployed:Array<{target:string, destination:string}>):void {
                        next(err, filesDeployed);
                    });
            }
        ],
        function (err:Error, filesDeployed:Array<{target:string, destination:string}>):void {
            callback(err, filesDeployed);
        }
    );
};