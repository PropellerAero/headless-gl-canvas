'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createShader = createShader;
exports.createProgram = createProgram;
exports.drawVertices = drawVertices;
exports.loadShader = loadShader;
exports.createTexture = createTexture;
exports.loadImage = loadImage;
exports.streamToImage = streamToImage;
exports.renderToImage = renderToImage;
exports.rgba = rgba;
exports.drawGLToContext = drawGLToContext;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ndarray = require('ndarray');

var _ndarray2 = _interopRequireDefault(_ndarray);

var _getPixels = require('get-pixels');

var _getPixels2 = _interopRequireDefault(_getPixels);

var _savePixels = require('save-pixels');

var _savePixels2 = _interopRequireDefault(_savePixels);

var _canvas = require('canvas');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
};

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
};

function drawVertices(gl, program, attribute, vertices, indices) {
    // look up where the vertex data needs to go.
    var attributeLocation = gl.getAttribLocation(program, attribute);

    // Create a buffer and put three 2d clip space points in it
    var vertexBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Turn on the attribute
    gl.enableVertexAttribArray(attributeLocation);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(attributeLocation, size, type, normalize, stride, offset);

    // draw
    var primitiveType = gl.TRIANGLES;
    var count = vertices.length / size;

    if (indices) {
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(primitiveType, indices.length, gl.UNSIGNED_SHORT, 0);
    } else {
        gl.drawArrays(primitiveType, offset, count);
    }
};

function loadShader(shaderPath) {
    return _fs2['default'].readFileSync(_path2['default'].join(__dirname, shaderPath)).toString('utf8');
}

async function createTexture(gl, image) {
    var activeTexture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : gl.TEXTURE0;

    var rawData = new Uint8Array(image.data);
    var texture = gl.createTexture();
    gl.activeTexture(activeTexture);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, rawData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return {
        texture: texture,
        width: image.width,
        height: image.height
    };
}

function loadImage(imagePath) {
    return new Promise(function (resolve, error) {
        console.log('Loading', imagePath);
        (0, _getPixels2['default'])(imagePath, function (err, pixels) {
            if (err) {
                return error(err);
            }

            console.log('Loaded ' + String(pixels.shape));
            resolve({
                width: pixels.shape[0],
                height: pixels.shape[1],
                data: pixels.data
            });
        });
    });
}

function streamToImage(pixels, width, height) {
    var data = (0, _ndarray2['default'])(new Uint8Array(width * height * 4), [width, height, 4]);
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            for (var c = 0; c < 4; c++) {
                data.set(x, y, c, pixels[4 * (width * y + x) + c]);
            }
        }
    }

    return (0, _savePixels2['default'])(data, 'png');
}

function renderToImage(pixels, width, height, texturePath) {
    streamToImage(pixels, width, height).pipe(_fs2['default'].createWriteStream(texturePath));
}

function rgba(red, green, blue, alpha) {
    return {
        red: red,
        green: green,
        blue: blue,
        alpha: alpha
    };
}

function drawGLToContext(context, gl, width, height) {
    var pixels = new Uint8Array(width * height * 4);
    var dataStream = gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    var image = new _canvas.Image();
    image.onload = function () {
        console.log('Drawing GL to 2D Context');
        context.drawImage(image);
    };

    image.onerror = console.error;

    image.src = dataStream;
}