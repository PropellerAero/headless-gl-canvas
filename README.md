# headless-gl-canvas

A wrapper around isomorphic-canvas, adding web-gl context to headless environments

## Getting Started

Prerequisites and setup instructions can be found at [headless-gl](https://github.com/stackgl/headless-gl).  ```sudo apt-get install mesa-common-dev``` may be required.

## Running Headless

To run `headless-gl-canvas` in a headless Linux environment, both an X11 server and software implementations of OpenGL are required as there is generally no GPU or display server available.

* [XVFB](https://www.x.org/releases/X11R7.7/doc/man/man1/Xvfb.1.xhtml) is an X11 server which emulates a framebuffer in order to read and write pixels
* [Mesa](https://www.mesa3d.org/intro.html) provides an open source software implementation of OpenGL


## Usage

```
import createCanvas from 'headless-gl-canvas';

const canvas = createCanvas(512, 512);
const gl = canvas.getContext('webgl);
```
