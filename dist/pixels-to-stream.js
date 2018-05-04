'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _savePixels = require('save-pixels');

var _savePixels2 = _interopRequireDefault(_savePixels);

var _ndarray = require('ndarray');

var _ndarray2 = _interopRequireDefault(_ndarray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function (pixels, width, height) {
    var data = (0, _ndarray2['default'])(new Uint8Array(width * height * 4), [width, height, 4]);
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            for (var c = 0; c < 4; c++) {
                data.set(x, y, c, pixels[4 * (width * y + x) + c]);
            }
        }
    }
    return (0, _savePixels2['default'])(data, 'png');
};