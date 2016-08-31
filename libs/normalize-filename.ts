/// <reference path="../typings/index.d.ts" />

module.exports = function(fileName:string) : string {

    var result:string = fileName
        .replace('dist', '')
        .replace('release', '');

    if(result.indexOf('src') > -1 && result.indexOf('src.') == -1) {
        result = result.replace('/src', '');
    }

    return result;
}