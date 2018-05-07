import { ImageData } from 'canvas';

const BYTES_PER_PIXEL = 4;

export default (gl, canvas) => {
    const context = canvas.getContext('2d');
    const { width, height } = canvas;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // readPixels has origin in the bottom left corner, so flip the pixels vertically before putting into canvas
    const canvasData = new Uint8ClampedArray(pixels.length);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let p = 0; p < BYTES_PER_PIXEL; p++) {
                canvasData[((height - 1 - y) * width + x) * BYTES_PER_PIXEL + p] = pixels[(y * width + x) * BYTES_PER_PIXEL + p];
            }
        }   
    }
    const imageData = new ImageData(canvasData, width, height);
    context.putImageData(imageData, 0, 0);
}