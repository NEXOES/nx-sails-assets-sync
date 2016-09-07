/// <reference path="../typings/index.d.ts" />
var path = require('path');
var _ = require('lodash');
var async = require('async');
module.exports = function (moduleDef, options, callback) {
    var cwd = path.join(__dirname);
    var moduleRoot = path.join(cwd, '../');
    async.series([
        function (next) {
            require(path.join(moduleRoot, 'libs', 'deploy-binaries-js'))(moduleDef, options, next);
        },
        function (next) {
            require(path.join(moduleRoot, 'libs', 'deploy-binaries-styles'))(moduleDef, options, next);
        },
        function (next) {
            require(path.join(moduleRoot, 'libs', 'deploy-binaries-images'))(moduleDef, options, next);
        },
        function (next) {
            require(path.join(moduleRoot, 'libs', 'deploy-binaries-fonts'))(moduleDef, options, next);
        },
        function (next) {
            require(path.join(moduleRoot, 'libs', 'deploy-binaries-templates'))(moduleDef, options, next);
        },
        function (next) {
            require(path.join(moduleRoot, 'libs', 'deploy-binaries-sounds'))(moduleDef, options, next);
        },
        function (next) {
            require(path.join(moduleRoot, 'libs', 'deploy-binaries-data'))(moduleDef, options, next);
        }
    ], function (err) {
        callback(err);
    });
};
//# sourceMappingURL=deploy-binaries.js.map