/// <reference path="../typings/index.d.ts" />

var path:any = require('path');
var fs:any = require('fs-extra');
var _:any = require('lodash');
var gulp:any = require('gulp');
var async:Async = require('async');

module.exports = function (moduleDef:any, options:any, callback:Function):void {

    var notify:Function = console.log;

    var clientSourcePath:string = path.join(options.appRootAbsolute, 'node_modules', moduleDef.name, 'client/data');
    var clientDestinationRoot:string = path.join(options.appRootAbsolute, 'assets/data/dependencies');
    var clientDestinationPath:string = path.join(clientDestinationRoot, moduleDef.name);

    async.series(
        [
            function (next:Function):void {
                fs.access(clientSourcePath, fs.R_OK, function (err):void {
                    if (err) {
                        return callback();
                    }
                    next();
                })
            }
            ,
            function (next:Function):void {
                fs.ensureDir(clientDestinationPath, function (err):void {
                    next(err);
                })
            }
            ,
            function (next:Function):void {

                var fileTypesExpr:string = 'json';

                function copyFunc(done:Function) {
                    gulp
                        .src(clientSourcePath + '/**/*.+('+ fileTypesExpr +')')
                        .pipe(
                            gulp
                                .dest(clientDestinationPath)
                                .on('end', function () {
                                        if (done) {
                                            done();
                                        }
                                    }
                                )
                        );
                }
                copyFunc(function () {
                    next();
                });
            }
        ],
        function (err:Error):void {
            if (!err) {
                notify(moduleDef.name + ' client data successfully installed into... ' + clientDestinationPath);
            }
            else {
                notify(moduleDef.name + ' client data could not be installed into... ' + clientDestinationPath);
            }
            callback(err);
        }
    );
};