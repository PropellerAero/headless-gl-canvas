import savePixels from 'save-pixels';
import ndarray from 'ndarray';

export default (pixels, width, height) => {    
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
