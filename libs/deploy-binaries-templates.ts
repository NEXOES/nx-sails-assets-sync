/// <reference path="../typings/index.d.ts" />

var path:any = require('path');
var _:any = require('lodash');
var async:Async = require('async');
var gulp:any = require('gulp');

module.exports = function (moduleDef:any, options:any, callback:Function):void {

    var notify:Function = console.log;
    var onError:Function = console.error;

    var cwd = path.join(__dirname);
    var appRoot = path.join(cwd, '../../../');
    var stInstallerRoot:string = path.join(cwd, '../');

    // local dependencies from installer
    var fsePath:string = path.join(stInstallerRoot, 'node_modules', 'fs-extra');
    var fse:any = require(fsePath);


    var clientSourcePath:string = path.join(cwd, '../../', moduleDef.name, 'client/templates');
    var clientDestinationRoot:string = path.join(appRoot, 'assets/templates/dependencies');
    var clientDestinationPath:string = path.join(clientDestinationRoot, moduleDef.name);

    async.series(
        [
            function (next:Function):void {
                fse.access(clientSourcePath, fse.R_OK, function (err):void {
                    if (err) {
                        return callback();
                    }
                    next();
                })
            }
            ,
            function (next:Function):void {
                fse.ensureDir(clientDestinationPath, function (err):void {
                    next(err);
                })
            }
            ,
            function (next:Function):void {

                var copyOptions:any = {
                    filter: /\.(html)$/i
                };

                fse.copy(clientSourcePath, clientDestinationPath, copyOptions, function (err:Error):void {
                    next(err);
                });
            }
        ],
        function (err:Error):void {
            if (!err) {
                notify(moduleDef.name + ' client templates successfully installed into... ' + clientDestinationPath);
            }
            else {
                notify('stengg-foundation templates could not be installed into... ' + clientDestinationPath);
            }
            callback(err);
        }
    );
};