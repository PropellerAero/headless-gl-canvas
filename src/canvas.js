import createContext from 'gl';
import { createCanvas, Image } from 'canvas';
import drawGLToCanvas from './draw-gl-to-canvas';

export default (width, height) => {
    const canvas = createCanvas(width, height);
    const { getContext } = canvas;

    canvas.getPatchedGL = function() {
        const gl = createContext(this.width, this.height);
        const { getUniformLocation, drawArrays, drawElements } = gl;

        // headless-gl has issues getting location of vector arrays...
        // Patch with addition of `[0]` as necessary
        gl.getUniformLocation = (program, name) => {
            const location = getUniformLocation.call(gl, program, name);
            if (!location) {
                console.log('Patching uniform', name);
                const arrayLocation = getUniformLocation.call(gl, program, `${name}[0]`);
                if (arrayLocation) return arrayLocation;
            }
            return location;
        }

        gl.drawArrays = (...args) => {
            drawArrays.call(gl, ...args);
            drawGLToCanvas(gl, canvas);
        }

        gl.drawElements = (...args) => {
            drawElements.call(gl, ...args);
            drawGLToCanvas(gl, canvas);
        }

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

    canvas.getContext = function(type) {
        switch(type) {
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
