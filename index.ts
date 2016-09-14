/// <reference path="typings/index.d.ts" />
/// <reference path="../typings/index.d.ts" />

import ISailsServer = sails.ISailsServer;
import ISailsHookDefaults = sails.ISailsHookDefaults;
import ISailsHookConfigure = sails.ISailsHookConfigure;

var fs: any = require('fs-extra');
var async: Async = require('async');
var _: _.LoDashStatic = require('lodash');
var gulp: any = require('gulp');
var path: any = require('path');


const NAME: string = 'nx-sails-assets-sync';


module.exports = function NXConvexConfig(sails: ISailsServer): sails.ISailsHook {

    var $this: ISailsHook = {

        defaults: function (sails: ISailsServer): ISailsHookDefaults {

            if (!_.isFunction(this.defaults)) {
                return this.defaults;
            }

            console.log(NAME + ' defaults...');

            this.sails = sails;

            var configPath: string = path.join(__dirname, 'config');
            var appConfig: ISailsHookDefaults = <ISailsHookDefaults>_.get(sails, NAME);
            var defaults: ISailsHookDefaults = require(configPath);
            var config: ISailsHookDefaults = _.assign({}, defaults, appConfig);

            this.defaults = <ISailsHookDefaults>config;

            return config;
        }
        ,

        configure: function (): void {

            if (!_.isFunction(this.configure)) {
                return;
            }

            console.log(NAME + ' configure...');

            var appConfig: ISailsHookConfigure = <ISailsHookConfigure>_.get(this.sails.config, NAME);
            var config: ISailsHookConfig = _.defaults(
                {},
                this.defaults,
                appConfig
            );
            _.assign(config, {
                appRootAbsolute: path.resolve(config.appRoot || require('nx-app-root-path').path)
            });

            this.timeout = config.timeout;

            this.config = config;
        }
        ,

        initialize: function (done: Function): void {
            var $this: ISailsHook = this;

            var clientSourceRoot: string = path.join(this.config.appRootAbsolute, 'node_modules');

            if (!_.isUndefined($this.config.enabled) && $this.config.enabled == false) {
                console.log(NAME + ' is disabled... not initializing...');
                return done();
            }

            console.log(NAME + ' initialize...');

            async.waterfall(
                [

                    function (nextAction: Function): void {

                        var clientDependenciesSourceDir: string = path.resolve(path.join($this.config.appRoot, $this.config.sourceDir));
                        var ClientDependencies: Function = require(path.join(__dirname, 'libs/client-dependencies'));
                        ClientDependencies(clientDependenciesSourceDir)
                            .then(function (clientDependencies: Array<string>) {
                                nextAction(null, clientDependencies);
                            })
                            .catch(function (err: Error) {
                                if (err) {
                                    console.error(err);
                                }
                                nextAction(err);
                            });
                    }

                    ,

                    function (clientDependencies: Array<any>, nextAction: Function): void {

                        async.eachSeries(
                            clientDependencies,
                            function (clientDependency: any, nextClientDependency: Function): void {

                                async.series(
                                    [
                                        function (nextClientDependencyAction: Function): void {

                                            var applyDependenciesToPipeline = require(path.join(__dirname, 'libs/apply-dependencies-order'));
                                            applyDependenciesToPipeline(clientDependency, $this.config, function (): void {
                                                nextClientDependencyAction();
                                            });
                                        }
                                        ,
                                        function (nextClientDependencyAction: Function): void {

                                            var deployDependencies = require(path.join(__dirname, 'libs/deploy-dependencies'));
                                            deployDependencies(clientDependency, $this.config, function (): void {
                                                nextClientDependencyAction();
                                            });
                                        }
                                        ,
                                        function (nextClientDependencyAction: Function): void {

                                            var deployBinaries = require(path.join(__dirname, 'libs/deploy-binaries'));
                                            deployBinaries(clientDependency, $this.config, function (): void {
                                                nextClientDependencyAction();
                                            });
                                        }
                                    ],
                                    function (err: Error): void {
                                        if (err) {
                                            console.error(err);
                                        }
                                        nextClientDependency(err, clientDependencies);
                                    }
                                );
                            },
                            function (err: Error): void {
                                nextAction(err, clientDependencies);
                            }
                        );
                    },

                    function (clientDependencies: Array<any>, nextAction: Function): void {

                        // start listener

                        function watchFunc(done: Function): void {

                            var clientDependencyFiles: Array<string> = <Array<string>>_.flatten(_.map(_.uniqBy(_.flattenDeep(_.map(clientDependencies, function (clientDependenciesItem: any): any {
                                var result: any = _.map(_.keys(clientDependenciesItem.clientDependencies), function (clientDependencyName: string): any {

                                    var clientDependencyItem: any = _.get(clientDependenciesItem.clientDependencies, clientDependencyName);

                                    var files: Array<string>;

                                    if (clientDependencyItem.files) {
                                        files = _.map(clientDependencyItem.files, function (file: string): string {
                                            return path.join($this.config.appRootAbsolute, 'node_modules', clientDependencyName, file);
                                        });
                                    }
                                    else {
                                        files = [path.join($this.config.appRootAbsolute, 'node_modules', clientDependencyName, clientDependencyName + '.js')];
                                    }

                                    var result: any = _.assign({}, clientDependencyItem, {
                                        name: clientDependencyName,
                                        files: files
                                    });

                                    return result
                                });
                                return result;
                            })), 'name'), 'files'));

                            gulp
                                .watch(clientDependencyFiles, function (event: any) {

                                    var fileSourceAppPath: string = path.join($this.config.appRootAbsolute, 'node_modules');
                                    var fileSourcePath: string = event.path;
                                    var fileDestinationSegment: string = event.path.replace(fileSourceAppPath, '');
                                    var fileDestinationAppPath: string = path.join($this.config.appRootAbsolute, 'assets');
                                    var fileDestinationAssetSection: string = require(path.join(__dirname, 'libs/determine-asset-section.js'))(fileDestinationSegment);
                                    var fileDestinationPath: string = path.join(fileDestinationAppPath, fileDestinationAssetSection, 'dependencies', fileDestinationSegment);

                                    fs.copy(fileSourcePath, fileDestinationPath, function (err: Error): void {
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
                ],
                function (err: Error, result: any): void {
                    done();
                }
            );
        }
        ,

        routes: {
            before: {},
            after: {}
        }

    };
    return $this;
};
