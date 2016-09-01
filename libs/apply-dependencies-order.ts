/// <reference path="../typings/index.d.ts" />

var _:any = require('lodash');
var path:any = require('path');
var async:Async = require('async');
var fs:any = require('fs');

module.exports = function (moduleDef:any, options:any, callback:Function) {

    var loadLib = function (libName:string):any {
        return require(path.join(appRoot, 'node_modules', 'nx-sails-assets-sync', 'libs', libName));
    };

    var dependencies = moduleDef.clientDependencies;

    var cwd = path.join(__dirname);

    // var appRoot = path.join(cwd, '../../../');mj
    var appRoot = require('nx-app-root-path').path;
    var tasksRoot = path.join(appRoot, options.tasksDir);
    var pipelineScriptPath:string = path.join(tasksRoot, 'pipeline.js');
    var pipelineIndentation:string = '  ';
    var searchPatternJS:string = dependencies.injectionLineSelectorJS || '// Dependencies like jQuery, or Angular are brought in here';
    var searchPatternCSS:string = dependencies.injectionLineSelectorCSS || 'var cssFilesToInject = [';
    var assetsRoot:string = 'js/dependencies';

    var dependencyStatementJS:Array<any> = [];
    var dependencyStatementCSS:Array<any> = [];

    var dependencyIndex:Array<string> = _.sortBy(_.keys(dependencies), function (name:string):number {
        var dependency:any = dependencies[name];
        return dependency.priority || 0;
    });

    var pathUrify:any = loadLib('path-urify');

    _.each(dependencyIndex, function (name:string):void {

        var dependency:any = dependencies[name];

        if (!dependency.files) {

            var scriptRef:string = path.join(assetsRoot, name, name + '.js');
            scriptRef = pathUrify(scriptRef);

            dependencyStatementJS.push({dependency: dependency, ref: scriptRef})
        }
        else {
            _.each(_.reverse(dependency.files), function (file:string):void {

                if(!_.endsWith(file, '.js')) {
                    return;
                }

                var normalizeFilename:any = loadLib('normalize-filename');
                var normalisedFile:string = normalizeFilename(file);

                var scriptRef:string = path.join(assetsRoot, name, normalisedFile);
                scriptRef = pathUrify(scriptRef);

                dependencyStatementJS.push({dependency: dependency, ref: scriptRef})
            });
        }
    });

    dependencyStatementJS = _.filter(dependencyStatementJS, function (dependency:any):boolean {
        return _.endsWith(dependency.ref, '.js');
    });

    _.each(dependencyStatementJS, function (dependencyDef:any):void {
        if (!dependencyDef.dependency.injectionLineSelectorJS) {
            switch (dependencyDef.dependency.dependencies) {
                case '/jquery.js':
                    dependencyDef.dependency.injectionLineSelectorJS = "'js/dependencies/jquery/jquery.js',";
                    break;
                case '/angular.js':
                    dependencyDef.dependency.injectionLineSelectorJS = "'js/dependencies/angular/angular.js',";
                    break;
            }
        }
    });

    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: {value: '// All of the rest of your client-side js files', offset: -2}
        },
        ref: 'js/dependencies/**/*.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: {value: 'js/dependencies/**/*.js', offset: 0}
        },
        ref: 'js/dependencies/**/*.init.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: {value: 'js/dependencies/**/*.init.js', offset: 0}
        },
        ref: 'js/dependencies/**/*.module.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: {value: 'js/dependencies/**/*.module.js', offset: 0}
        },
        ref: 'js/**/*.module.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: {value: 'js/**/*.module.js', offset: 0}
        },
        ref: 'js/**/*.config.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: {value: 'js/**/*.config.js', offset: 0}
        },
        ref: 'js/**/*.service.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: {value: 'js/**/*.service.js', offset: 0}
        },
        ref: 'js/**/*.run.js'
    });

    dependencyStatementCSS.push({
        dependency: {
            injectionLineSelectorCSS: {value: searchPatternCSS, offset: -1}
        },
        ref: 'js/**/*.css',
    });
    dependencyStatementCSS.push({
        dependency: {
            injectionLineSelectorCSS: {value: searchPatternCSS, offset: -1}
        },
        ref: 'templates/**/*.css',
    });


    _.each(dependencyIndex, function (name:string):void {

        var dependency:any = dependencies[name];

        if (dependency.files) {
            _.each(_.reverse(dependency.files), function (file:string):void {

                var normalizeFilename:any = loadLib('normalize-filename');
                var normalisedFile:string = normalizeFilename(file);

                var styleRef:string = path.join(assetsRoot, name, normalisedFile);
                styleRef = pathUrify(styleRef);

                dependencyStatementCSS.push({dependency: dependency, ref: styleRef})
            });
        }
    });

    // SELECT ONLY CSS
    dependencyStatementCSS = _.filter(dependencyStatementCSS, function (dependency:any):boolean {
        return _.endsWith(dependency.ref, '.css');
    });


    function ReadAppend(file, appendFile) {

        fs.readFile(appendFile, 'utf-8', function (err:Error, content:string) {

            if (err) return callback(err);

            var lines:Array<string> = content.split('\n');

            for (var $index:number = 0; $index < dependencyStatementJS.length; $index++) {

                var dependencyLine:any = dependencyStatementJS[$index];

                var dependencyLineRef:string = pathUrify(dependencyLine.ref);

                var existingLine:string = _.find(lines, function (line:string):boolean {
                    return _.trim(line).indexOf(_.trim(dependencyLineRef)) > -1;
                });

                if (!existingLine) {

                    var dependencyLineOutput:string = pipelineIndentation + '\'' + dependencyLineRef + '\',';

                    var findLineIndex:any = loadLib('find-line-index');
                    var targetLineIndex:number = findLineIndex(lines, dependencyLine, searchPatternJS) + 1;

                    lines.splice(targetLineIndex, 0, dependencyLineOutput);
                    console.log('Dependency being injected... ' + dependencyLineRef);
                }
                else {
                    console.log('Dependency already injected, leaving as is...')
                }
            }
            ;

            for (var $index:number = 0; $index < dependencyStatementCSS.length; $index++) {

                var dependencyLine:any = dependencyStatementCSS[$index];

                var dependencyLineRef:string = pathUrify(dependencyLine.ref);

                var existingLine:string = _.find(lines, function (line:string):boolean {
                    return _.trim(line).indexOf(_.trim(dependencyLineRef)) > -1;
                });

                if (!existingLine) {

                    var dependencyLineOutput:string = pipelineIndentation + '\'' + dependencyLineRef + '\',';

                    var findLineIndex:any = loadLib('find-line-index');
                    var targetLineIndex:number = findLineIndex(lines, dependencyLine, searchPatternCSS) + 1;

                    lines.splice(targetLineIndex, 0, dependencyLineOutput);
                    console.log('Dependency being injected... ' + dependencyLineRef);
                }
                else {
                    console.log('Dependency already injected, leaving as is...')
                }
            }
            ;

            content = lines.join('\n');

            fs.writeFile(file, content, function (err) {
                callback(err);
            });
        });
    }

    ReadAppend(pipelineScriptPath, pipelineScriptPath);
};