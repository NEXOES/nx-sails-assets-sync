/// <reference path="../typings/index.d.ts" />
module.exports = function (fileName) {
    var result = fileName
        .replace('dist', '')
        .replace('release', '');
    if (result.indexOf('src') > -1 && result.indexOf('src.') == -1) {
        result = result.replace('/src', '');
    }
    return result;
};
//# sourceMappingURL=normalize-filename.js.map