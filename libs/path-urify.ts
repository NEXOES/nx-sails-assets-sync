/// <reference path="../typings/main.d.ts" />

module.exports = function (path:string):string {
    return path.replace(/\\/g, '/')
};