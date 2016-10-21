/// <reference path="typings/index.d.ts" />
/// <reference path="../stengg-typings/index.d.ts" />
var fs = require('fs-extra');
var async = require('async');
var _ = require('lodash');
var gulp = require('gulp');
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
            var appConfig = _.get(sails, NAME);
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
            var config = _.defaults({}, this.defaults, appConfig);
            _.assign(config, {
                appRootAbsolute: path.resolve(config.appRoot || require('nx-app-root-path').path)
            });
            this.timeout = config.timeout;
            this.config = config;
        },
        initialize: function (done) {
            var $this = this;
            var clientSourceRoot = path.join(this.config.appRootAbsolute, 'node_modules');
            if (!_.isUndefined($this.config.enabled) && $this.config.enabled == false) {
                console.log(NAME + ' is disabled... not initializing...');
                return done();
            }
            console.log(NAME + ' initialize...');
            async.waterfall([
                function (nextAction) {
                    var clientDependenciesSourceDir = path.resolve(path.join($this.config.appRoot, $this.config.sourceDir));
                    var ClientDependencies = require(path.join(__dirname, 'libs/client-dependencies'));
                    ClientDependencies(clientDependenciesSourceDir)
                        .then(function (clientDependencies) {
                        nextAction(null, clientDependencies);
                    })
                        .catch(function (err) {
                        if (err) {
                            console.error(err);
                        }
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
                            },
                            function (nextClientDependencyAction) {
                                var deployBinaries = require(path.join(__dirname, 'libs/deploy-binaries'));
                                deployBinaries(clientDependency, $this.config, function () {
                                    nextClientDependencyAction();
                                });
                            }
                        ], function (err) {
                            if (err) {
                                console.error(err);
                            }
                            nextClientDependency(err, clientDependencies);
                        });
                    }, function (err) {
                        nextAction(err, clientDependencies);
                    });
                },
                function (clientDependencies, nextAction) {
                    // start listener
                    function watchFunc(done) {
                        var clientDependencyFiles = _.flatten(_.map(_.uniqBy(_.flattenDeep(_.map(clientDependencies, function (clientDependenciesItem) {
                            var result = _.map(_.keys(clientDependenciesItem.clientDependencies), function (clientDependencyName) {
                                var clientDependencyItem = _.get(clientDependenciesItem.clientDependencies, clientDependencyName);
                                var files;
                                if (clientDependencyItem.files) {
                                    files = _.map(clientDependencyItem.files, function (file) {
                                        return path.join($this.config.appRootAbsolute, 'node_modules', clientDependencyName, file);
                                    });
                                }
                                else {
                                    files = [path.join($this.config.appRootAbsolute, 'node_modules', clientDependencyName, clientDependencyName + '.js')];
                                }
                                var result = _.assign({}, clientDependencyItem, {
                                    name: clientDependencyName,
                                    files: files
                                });
                                return result;
                            });
                            return result;
                        })), 'name'), 'files'));
                        gulp
                            .watch(clientDependencyFiles, function (event) {
                            var fileSourceAppPath = path.join($this.config.appRootAbsolute, 'node_modules');
                            var fileSourcePath = event.path;
                            var fileDestinationSegment = event.path.replace(fileSourceAppPath, '');
                            var fileDestinationAppPath = path.join($this.config.appRootAbsolute, 'assets');
                            var fileDestinationAssetSection = require(path.join(__dirname, 'libs/determine-asset-section.js'))(fileDestinationSegment);
                            var fileDestinationPath = path.join(fileDestinationAppPath, fileDestinationAssetSection, 'dependencies', fileDestinationSegment);
                            fs.copy(fileSourcePath, fileDestinationPath, function (err) {
                                if (err) {
                                    console.error(err);
                                }
                                else {
                                    console.log(NAME + '... file synced... ' + fileSourcePath + ' to ' + fileDestinationPath);
                                }
                            });
                            console.dir(event);
                        });
                        console.log(NAME + '.... now watching ' + clientDependencyFiles.length + ' client dependency files for changes...');
                        done();
                    }
                    watchFunc(function () {
                        nextAction(null, clientDependencies);
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