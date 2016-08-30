/// <reference path="../typings/index.d.ts" />

module.exports = function(fileName:string) : string {
    var result:string = fileName
        .replace('dist', '')
        .replace('release', '')
        .replace('/src/', '');
    return result;
}