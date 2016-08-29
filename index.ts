/// <reference path="typings/index.d.ts" />
/// <reference path="../typings/index.d.ts" />

import ISailsServer = sails.ISailsServer;
import ISailsHook = sails.ISailsHook;
import ISailsHookDefaults = sails.ISailsHookDefaults;
import ISailsHookConfigure = sails.ISailsHookConfigure;
import ISailsHookConfig = sails.ISailsHookConfig;

var async:Async = require('async');
var lodash:_.LoDashStatic = require('lodash');
var path:any = require('path');


const NAME:string = 'nx-sails-assets-sync';


module.exports = function NXConvexConfig(sails:ISailsServer):ISailsHook {

    var $this:ISailsHook = {

        defaults: function (sails:ISailsServer):ISailsHookDefaults {

            if (!_.isFunction(this.defaults)) {
                return this.defaults;
            }

            console.log(NAME + ' defaults...');

            this.sails = sails;

            var configPath:string = path.join(__dirname, 'config');
            var appConfig:ISailsHookDefaults = <ISailsHookDefaults>_.get(sails, NAME);
            var defaults:ISailsHookDefaults = require(configPath);
            var config:ISailsHookDefaults = _.assign({}, defaults, appConfig);

            this.defaults = <ISailsHookDefaults>config;

            return config;
        }
        ,

        configure: function ():void {

            if (!_.isFunction(this.configure)) {
                return;
            }

            console.log(NAME + ' configure...');

            var appConfig:ISailsHookConfigure = <ISailsHookConfigure>_.get(this.sails.config, NAME);
            var config:ISailsHookConfig = _.assign({}, this.defaults, appConfig);

            this.config = config;
        }
        ,

        initialize: function (done:Function):void {
            var $this:ISailsHook = this;

            console.log(NAME + ' initialize...');

            async.waterfall(
                [

                    function (nextAction:Function):void {

                        var appRoot:string = require('nx-app-root-path').path;

                        var clientDependenciesSourceDir:string = path.join(appRoot, $this.config.sourceDir);
                        var ClientDependencies:Function = require(path.join(__dirname, 'libs/client-dependencies'));
                        ClientDependencies(clientDependenciesSourceDir)
                            .then(function (clientDependencies:Array<string>) {
                                nextAction(null, clientDependencies);
                            })
                            .catch(function (err:Error) {
                                nextAction(err);
                            });
                    }

                    ,

                    function (clientDependencies:Array<any>, nextAction:Function):void {

                        async.eachSeries(
                            clientDependencies,
                            function (clientDependency:any, nextClientDependency:Function):void {

                                async.series(
                                    [
                                        function(nextClientDependencyAction:Function) : void {

                                            var applyDependenciesToPipeline = require(path.join(__dirname, 'libs/apply-dependencies-order'));
                                            applyDependenciesToPipeline(clientDependency, $this.config, function ():void {
                                                nextClientDependencyAction();
                                            });
                                        }
                                        ,
                                        function(nextClientDependencyAction:Function) : void {

                                            var deployDependencies = require(path.join(__dirname, 'libs/deploy-dependencies'));
                                            deployDependencies(clientDependency, $this.config, function ():void {
                                                nextClientDependencyAction();
                                            });
                                        }
                                    ],
                                    function(err:Error) : void {
                                        // console.log(err);
                                        nextClientDependency();
                                    }
                                );
                            },
                            function (err:Error):void {
                                nextAction(err);
                            }
                        );
                    }
                ],
                function (err:Error, result:any):void {
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
