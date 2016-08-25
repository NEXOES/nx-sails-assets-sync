/// <reference path="typings/index.d.ts" />
/// <reference path="../typings/index.d.ts" />
var async = require('async');
var lodash = require('lodash');
var path = require('path');
var NAME = 'nx-sails-assets-sync';
module.exports = function NXConvexConfig(sails) {
    var $this = {
        defaults: function (sails) {
            if (!_.isFunction(this.defaults)) {
                return this.defaults;
            }
            console.log(NAME + ' defaults...');
            this.sails = sails;
            var configPath = path.join(__dirname, 'config');
            var appConfig = _.get(sails.config, NAME);
            var defaults = require(configPath);
            var config = _.assign({}, defaults, appConfig);
            this.defaults = config;
            return config;
        },
        configure: function () {
            if (!_.isFunction(this.configure)) {
                return;
            }
            console.log(NAME + ' configure...');
            var appConfig = _.get(this.sails.config, NAME);
            var config = _.assign({}, this.defaults, appConfig);
            this.config = config;
        },
        initialize: function (done) {
            var $this = this;
            console.log(NAME + ' initialize...');
            async.waterfall([
                function (nextAction) {
                    var clientDependenciesSourceDir = path.join(__dirname, $this.config.sourceDir);
                    var ClientDependencies = require(path.join(__dirname, 'libs/client-dependencies'));
                    ClientDependencies(clientDependenciesSourceDir)
                        .then(function (clientDependencies) {
                        nextAction(null, clientDependencies);
                    })
                        .catch(function (err) {
                        nextAction(err);
                    });
                },
                function (clientDependencies, nextAction) {
                    async.eachSeries(clientDependencies, function (clientDependency, nextClientDependency) {
                        async.series([
                            function (nextClientDependencyAction) {
                                var applyDependenciesToPipeline = require(path.join(__dirname, 'libs/apply-dependencies-order'));
                                applyDependenciesToPipeline(clientDependency, $this.config, function () {
                                    nextClientDependencyAction();
                                });
                            },
                            function (nextClientDependencyAction) {
                                var deployDependencies = require(path.join(__dirname, 'libs/deploy-dependencies'));
                                deployDependencies(clientDependency, $this.config, function () {
                                    nextClientDependencyAction();
                                });
                            }
                        ], function (err) {
                            // console.log(err);
                            nextClientDependency();
                        });
                    }, function (err) {
                        nextAction(err);
                    });
                }
            ], function (err, result) {
                done();
            });
        },
        routes: {
            before: {},
            after: {}
        }
    };
    return $this;
};
//# sourceMappingURL=index.js.map