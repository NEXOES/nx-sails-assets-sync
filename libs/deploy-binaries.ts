/// <reference path="../typings/index.d.ts" />

var path:any = require('path');
var _:any = require('lodash');
var async:Async = require('async');

module.exports = function (moduleDef:any, options:any, callback:Function) {

    var cwd = path.join(__dirname);
    var moduleRoot:string = path.join(cwd, '../');

    async.series(
        [
            function (next:Function):void {
                require(path.join(moduleRoot, 'libs', 'deploy-binaries-js'))(moduleDef, options, next);
            }
            ,
            function (next:Function):void {
                require(path.join(moduleRoot, 'libs', 'deploy-binaries-styles'))(moduleDef, options, next);
            }
            ,
            function (next:Function):void {
                require(path.join(moduleRoot, 'libs', 'deploy-binaries-images'))(moduleDef, options, next);
            }
            ,
            function (next:Function):void {
                require(path.join(moduleRoot, 'libs', 'deploy-binaries-fonts'))(moduleDef, options, next);
            }
            ,
            function (next:Function):void {
                require(path.join(moduleRoot, 'libs', 'deploy-binaries-templates'))(moduleDef, options, next);
            }
            ,
            function (next:Function):void {
                require(path.join(moduleRoot, 'libs', 'deploy-binaries-sounds'))(moduleDef, options, next);
            }
            ,
            function (next:Function):void {
                require(path.join(moduleRoot, 'libs', 'deploy-binaries-data'))(moduleDef, options, next);
            }
        ],
        function (err:Error):void {
            callback(err);
        }
    );
};