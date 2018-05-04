import fs from 'fs';
import path from 'path';
import ndarray from 'ndarray';
import getPixels from 'get-pixels';
import savePixels from 'save-pixels';
import { Image } from 'canvas';

export function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
};


export function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
};

export function drawVertices(gl, program, attribute, vertices, indices) {
    // look up where the vertex data needs to go.
    const attributeLocation = gl.getAttribLocation(program, attribute);

    // Create a buffer and put three 2d clip space points in it
    const vertexBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Turn on the attribute
    gl.enableVertexAttribArray(attributeLocation);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2;          // 2 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(attributeLocation, size, type, normalize, stride, offset)

    // draw
    const primitiveType = gl.TRIANGLES;
    const count = vertices.length / size;

    if (indices) {
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(primitiveType, indices.length, gl.UNSIGNED_SHORT, 0);
    } else {
        gl.drawArrays(primitiveType, offset, count);
    }
};

export function loadShader(shaderPath) {
    return fs.readFileSync(path.join(__dirname, shaderPath)).toString('utf8');
}

export async function createTexture(gl, image, activeTexture = gl.TEXTURE0) {
    const rawData = new Uint8Array(image.data);
    const texture = gl.createTexture();
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
        texture,
        width: image.width,
        height: image.height
    };
}

export function loadImage(imagePath) {
    return new Promise(function(resolve, error) {
        console.log('Loading', imagePath);
        getPixels(imagePath, function(err, pixels) {
            if (err) {
                return error(err);
            }

            console.log(`Loaded ${pixels.shape}`);
            resolve({
                width: pixels.shape[0],
                height: pixels.shape[1],
                data: pixels.data,
            });
        });
    });
}

export function streamToImage(pixels, width, height) {    
    const data = ndarray(new Uint8Array(width * height * 4), [width, height, 4]);
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            for (var c = 0; c < 4; c++) { 
                data.set(x, y, c, pixels[4 * (width * y + x) + c]);
            }
        }
    }
    
    return savePixels(data, 'png');
}

export function renderToImage(pixels, width, height, texturePath) {
    streamToImage(pixels, width, height).pipe(fs.createWriteStream(texturePath));
}

export function rgba(red, green, blue, alpha) {
    return {
        red,
        green,
        blue,
        alpha
    };
}

export function drawGLToContext(context, gl, width, height) {
    const pixels = new Uint8Array(width * height * 4);
    const dataStream = gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    const image = new Image();
    image.onload = () => {
        console.log('Drawing GL to 2D Context');
        context.drawImage(image);
    };

    image.onerror = console.error;

    image.src = dataStream;
}
