'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _canvas = require('canvas');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function (gl, canvas) {
    return new Promise(function (resolve, reject) {
        var context = canvas.getContext('2d');
        var width = canvas.width,
            height = canvas.height;

        var pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        console.log(new Buffer(pixels).toString('base64'));
        var imageData = new _canvas.ImageData(new Uint8ClampedArray(pixels), width, height);
        context.putImageData(imageData, 0, 0);

        var pngStream = canvas.pngStream();
        var output = _fs2['default'].createWriteStream('out.png');
        pngStream.pipe(output);
    });
};