/// <reference path="../typings/index.d.ts" />
var _ = require('lodash');
var path = require('path');
var async = require('async');
var fs = require('fs');
module.exports = function (moduleDef, options, callback) {
    var loadLib = function (libName) {
        return require(path.join(__dirname, libName));
    };
    var dependencies = moduleDef.clientDependencies;
    var determineAssetSection = loadLib('determine-asset-section');
    var appRoot = options.appRoot || require('nx-app-root-path').path;
    var tasksRoot = path.join(appRoot, options.tasksDir);
    var pipelineScriptPath = path.join(tasksRoot, 'pipeline.js');
    var pipelineIndentation = '  ';
    var searchPatternJS = dependencies.injectionLineSelectorJS || '// Dependencies like jQuery, or Angular are brought in here';
    var searchPatternCSS = dependencies.injectionLineSelectorCSS || 'var cssFilesToInject = [';
    var assetsRoot = '';
    var dependencyStatementJS = [];
    var dependencyStatementCSS = [];
    var dependencyIndex = _.sortBy(_.keys(dependencies), function (name) {
        var dependency = dependencies[name];
        return dependency.priority || 0;
    });
    var pathUrify = loadLib('path-urify');
    _.each(dependencyIndex, function (name) {
        var dependency = dependencies[name];
        if (!dependency.files) {
            var scriptRef = path.join('js/dependencies', name, name + '.js');
            scriptRef = pathUrify(scriptRef);
            dependencyStatementJS.push({ dependency: dependency, ref: scriptRef });
        }
        else {
            _.each(_.reverse(dependency.files), function (file) {
                if (!_.endsWith(file, '.js')) {
                    return;
                }
                var normalizeFilename = loadLib('normalize-filename');
                var normalisedFile = normalizeFilename(file);
                var scriptRef = path.join(assetsRoot, name, normalisedFile);
                scriptRef = pathUrify(scriptRef);
                dependencyStatementJS.push({ dependency: dependency, ref: scriptRef });
            });
        }
    });
    dependencyStatementJS = _.filter(dependencyStatementJS, function (dependency) {
        return _.endsWith(dependency.ref, '.js');
    });
    _.each(dependencyStatementJS, function (dependencyDef) {
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
            injectionLineSelectorJS: { value: '// All of the rest of your client-side js files', offset: -2 }
        },
        ref: 'js/dependencies/**/*.core.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: { value: 'js/dependencies/**/*.js', offset: 0 }
        },
        ref: 'js/dependencies/**/*.init.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: { value: 'js/dependencies/**/*.init.js', offset: 0 }
        },
        ref: 'js/dependencies/**/*.module.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: { value: 'js/dependencies/**/*.module.js', offset: 0 }
        },
        ref: 'js/**/*.module.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: { value: 'js/**/*.module.js', offset: 0 }
        },
        ref: 'js/**/*.config.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: { value: 'js/**/*.config.js', offset: 0 }
        },
        ref: 'js/**/*.service.js'
    });
    dependencyStatementJS.push({
        dependency: {
            injectionLineSelectorJS: { value: 'js/**/*.service.js', offset: 0 }
        },
        ref: 'js/**/*.run.js'
    });
    _.each(dependencyIndex, function (name) {
        var dependency = dependencies[name];
        if (dependency.files) {
            _.each(_.reverse(dependency.files), function (file) {
                var normalizeFilename = loadLib('normalize-filename');
                var normalisedFile = normalizeFilename(file);
                var styleRef = path.join('styles/dependencies', name, normalisedFile);
                styleRef = pathUrify(styleRef);
                dependencyStatementCSS.push({ dependency: dependency, ref: styleRef });
            });
        }
    });
    // SELECT ONLY CSS
    dependencyStatementCSS = _.filter(dependencyStatementCSS, function (dependency) {
        return _.endsWith(dependency.ref, '.css');
    });
    function ReadAppend(file, appendFile) {
        fs.readFile(appendFile, 'utf-8', function (err, content) {
            if (err)
                return callback(err);
            var lines = content.split('\n');
            for (var $index = 0; $index < dependencyStatementJS.length; $index++) {
                var dependencyLine = dependencyStatementJS[$index];
                var dependencyLineRef = pathUrify(dependencyLine.ref);
                var existingLine = _.find(lines, function (line) {
                    return _.trim(line).indexOf(_.trim(dependencyLineRef)) > -1;
                });
                if (!existingLine) {
                    var dependencyLineOutput = pipelineIndentation + '\'' + dependencyLineRef + '\',';
                    var findLineIndex = loadLib('find-line-index');
                    var targetLineIndex = findLineIndex(lines, dependencyLine, searchPatternJS) + 1;
                    lines.splice(targetLineIndex, 0, dependencyLineOutput);
                }
                else {
                }
            }
            ;
            for (var $index = 0; $index < dependencyStatementCSS.length; $index++) {
                var dependencyLine = dependencyStatementCSS[$index];
                var dependencyLineRef = pathUrify(dependencyLine.ref);
                var existingLine = _.find(lines, function (line) {
                    return _.trim(line).indexOf(_.trim(dependencyLineRef)) > -1;
                });
                if (!existingLine) {
                    var dependencyLineOutput = pipelineIndentation + '\'' + dependencyLineRef + '\',';
                    var findLineIndex = loadLib('find-line-index');
                    var targetLineIndex = findLineIndex(lines, dependencyLine, searchPatternCSS) + 1;
                    lines.splice(targetLineIndex, 0, dependencyLineOutput);
                }
                else {
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
//# sourceMappingURL=apply-dependencies-order.js.map