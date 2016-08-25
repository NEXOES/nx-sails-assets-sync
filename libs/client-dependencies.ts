/// <reference path="../typings/index.d.ts" />
/// <reference path="../../typings/index.d.ts" />

var fs:any = require('fs');
var path:any = require('path');
var Promise:PromiseConstructor = require('bluebird');

var main:Function = function (location:string):Promise<any> {
    var $p:Promise<any> = new Promise(function (resolve, reject) {
        fs.readdir(location, function (err:Error, dirs:Array<any>):void {

            async.mapSeries(
                dirs,
                function (dir:string, nextDir:Function):void {

                    var packagePath:string = path.join(location, dir, 'package.json');
                    try {
                        var package:any = require(packagePath);
                        nextDir(null, package);
                    }
                    catch (err) {
                        nextDir();
                    }
                },
                function (err:Error, packages:Array<any>):void {
                    packages = _.filter(packages, 'clientDependencies');
                    err ? reject(err) : resolve(packages);
                }
            );
        })
    });
    return $p;
};
module.exports = main;