/// <reference path="../typings/index.d.ts" />
var _ = require('lodash');
module.exports = function (lines, dependencyDef, defaultSelector) {
    var dependency = dependencyDef.dependency;
    var selector = defaultSelector;
    var result;
    if (_.endsWith(dependencyDef.ref, 'js')) {
        selector = dependency.injectionLineSelectorJS ? (dependency.injectionLineSelectorJS.value || dependency.injectionLineSelectorJS) : selector;
    }
    else if (_.endsWith(dependencyDef.ref, 'css')) {
        selector = dependency.injectionLineSelectorCSS ? (dependency.injectionLineSelectorCSS.value || dependency.injectionLineSelectorCSS) : selector;
    }
    else if (dependency && dependency.dependencies) {
        selector = dependency.dependencies;
    }
    result = _.indexOf(lines, _.find(lines, function (line) {
        // TODO Should be refactored to support arrays by traversing all lines looking for the dependency with the highest line number
        return line.indexOf(selector) > -1;
    }));
    if (dependency && dependency.injectionLineSelectorJS && dependency.injectionLineSelectorJS.offset) {
        result += dependency.injectionLineSelectorJS.offset;
    }
    return result;
};
//# sourceMappingURL=find-line-index.js.map