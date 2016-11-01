/// <reference path="../typings/index.d.ts" />

module.exports = function (path:string):string {
    return path.replace(/\\/g, '/')
};