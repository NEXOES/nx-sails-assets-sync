/// <reference path="../typings/index.d.ts" />
var path = require('path');
module.exports = function (fileName) {
    var result;
    var fileType = path.extname(fileName).replace('.', '');
    switch (fileType) {
        case 'htmnl':
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
//# sourceMappingURL=determine-asset-section.js.map