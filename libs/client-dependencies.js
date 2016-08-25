/// <reference path="../typings/index.d.ts" />
/// <reference path="../../typings/index.d.ts" />
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var main = function (location) {
    var $p = new Promise(function (resolve, reject) {
        fs.readdir(location, function (err, dirs) {
            async.mapSeries(dirs, function (dir, nextDir) {
                var packagePath = path.join(location, dir, 'package.json');
                try {
                    var package = require(packagePath);
                    nextDir(null, package);
                }
                catch (err) {
                    nextDir();
                }
            }, function (err, packages) {
                packages = _.filter(packages, 'clientDependencies');
                err ? reject(err) : resolve(packages);
            });
        });
    });
    return $p;
};
module.exports = main;
//# sourceMappingURL=client-dependencies.js.map