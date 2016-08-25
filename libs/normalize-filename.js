/// <reference path="../typings/main.d.ts" />
module.exports = function (fileName) {
    var result = fileName
        .replace('dist', '')
        .replace('release', '')
        .replace('src', '');
    return result;
};
//# sourceMappingURL=normalize-filename.js.map