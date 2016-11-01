/// <reference path="../typings/index.d.ts" />

var path:any = require('path');

module.exports = function(fileName:string) : string {

    var result;

    var fileType:string = path.extname(fileName).replace('.', '');

    switch(fileType) {

        case 'html':
            result = 'templates';
            break;

        case 'css':
            result = 'styles';
            break;

        case 'png':
        case 'jpg':
        case 'gif':
        case 'svg':
            result = 'images';
            break;

        case 'eot':
        case 'ttf':
        case 'otf':
        case 'woff':
        case 'woff2':
            result = 'fonts';
            break;

        case 'js':
        default:
            result = fileType;
            break;
    }

    return result;
};
