/// <reference path="../typings/index.d.ts" />

var path:any = require('path');
var _:any = require('lodash');
var async:Async = require('async');
var gulp:any = require('gulp');
var fs:any = require('fs-extra');

module.exports = function (moduleDef:any, options:any, callback:Function):void {

    var notify:Function = console.log;

    var clientSourcePath:string = path.join(options.appRootAbsolute, 'node_modules', moduleDef.name, 'client/js');
    var clientDestinationRoot:string = path.join(options.appRootAbsolute, 'assets/js/dependencies');
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

                var fileTypesExpr:string = 'wav|mp3';

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
                notify(moduleDef.name + ' client sounds successfully installed into... ' + clientDestinationPath);
            }
            else {
                notify(moduleDef.name +' sounds could not be installed into... ' + clientDestinationPath);
            }
            callback(err);
        }
    );
};