'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _gl = require('gl');

var _gl2 = _interopRequireDefault(_gl);

var _canvas = require('canvas');

var _drawGlToCanvas = require('./draw-gl-to-canvas');

var _drawGlToCanvas2 = _interopRequireDefault(_drawGlToCanvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = function (width, height) {
    var canvas = (0, _canvas.createCanvas)(width, height);
    var getContext = canvas.getContext;


    canvas.getPatchedGL = function () {
        var gl = (0, _gl2['default'])(this.width, this.height);
        var getUniformLocation = gl.getUniformLocation,
            drawArrays = gl.drawArrays,
            drawElements = gl.drawElements;

        // headless-gl has issues getting location of vector arrays...
        // Patch with addition of `[0]` as necessary

        gl.getUniformLocation = function (program, name) {
            var location = getUniformLocation.call(gl, program, name);
            if (!location) {
                console.log('Patching uniform', name);
                var arrayLocation = getUniformLocation.call(gl, program, String(name) + '[0]');
                if (arrayLocation) return arrayLocation;
            }
            return location;
        };

        gl.drawArrays = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            drawArrays.call.apply(drawArrays, [gl].concat(args));
            (0, _drawGlToCanvas2['default'])(gl, canvas);
        };

        gl.drawElements = function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            drawElements.call.apply(drawElements, [gl].concat(args));
            (0, _drawGlToCanvas2['default'])(gl, canvas);
        };

        return gl;
    };

    // canvas.getPatchedContext = function(type) {
    //     const context = getContext.call(canvas, type);
    //     const { drawImage } = context;
    //     if (type === '2d') {
    //         context.drawImage = (image, ...args) => {
    //             if (image.gl) {                    
    //                 drawGLToContext(image, image.gl, width, height);
    //             }
    //             else {
    //                 drawImage.call(context, image, ...args);
    //             }
    //         };
    //     }
    //     return context;
    // }

    canvas.getContext = function (type) {
        switch (type) {
            case 'webgl':
            case 'experimental-webgl':
                this.gl = this.getPatchedGL();
                if (!this.gl) {
                    throw new Error('Failed to initialize WebGL Context');
                }
                return this.gl;
            default:
                return getContext.call(this, type);
        }
    };

    return canvas;
};