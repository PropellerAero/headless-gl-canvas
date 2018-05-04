import { ImageData } from 'canvas';
import fs from 'fs';

export default (gl, canvas) => {
    return new Promise((resolve, reject) => {
        const context = canvas.getContext('2d');
        const { width, height } = canvas;
        const pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
        context.putImageData(imageData, 0, 0);
    });
}