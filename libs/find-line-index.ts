/// <reference path="../typings/index.d.ts" />

var _:any = require('lodash');

module.exports = function (lines:Array<string>, dependencyDef:any, defaultSelector:string):number {

    var dependency:any = dependencyDef.dependency;

    var selector:string = defaultSelector;

    var result:number;

    if (_.endsWith(dependencyDef.ref, 'js')) {
        selector = dependency.injectionLineSelectorJS ? ( dependency.injectionLineSelectorJS.value || dependency.injectionLineSelectorJS ) : selector;
    }

    else if (_.endsWith(dependencyDef.ref, 'css')) {
        selector = dependency.injectionLineSelectorCSS ? ( dependency.injectionLineSelectorCSS.value || dependency.injectionLineSelectorCSS ) : selector;
    }

    else if (dependency && dependency.dependencies) {
        selector = dependency.dependencies;
    }

    result = _.indexOf(lines, _.find(lines, function (line) {
        // TODO Should be refactored to support arrays by traversing all lines looking for the dependency with the highest line number
        return line.indexOf(selector) > -1;
    }));

    var offset:number = <number>_.get(dependency, 'injectionLineSelectorJS.offset') || 0;
    result += offset;

    return result;
};