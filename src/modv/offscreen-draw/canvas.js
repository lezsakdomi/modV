/* eslint-env worker */

let outputCanvas;
let outputContext;

let bufferCanvas;
let bufferContext;

function setOutputCanvas(canvasIn) {
  outputCanvas = canvasIn;
  outputContext = outputCanvas.getContext('2d');
}

function getOutputCanvas() {
  return {
    canvas: outputCanvas,
    context: outputContext,
  };
}

function setBufferCanvas(canvasIn) {
  bufferCanvas = canvasIn;
  bufferContext = bufferCanvas.getContext('2d');
}

function getBufferCanvas() {
  return {
    canvas: bufferCanvas,
    context: bufferContext,
  };
}

function setDimensions({ width, height }) {
  outputCanvas.width = width;
  outputCanvas.height = height;
  bufferCanvas.width = width;
  bufferCanvas.height = height;
}

export {
  setOutputCanvas,
  getOutputCanvas,
  setBufferCanvas,
  getBufferCanvas,
  setDimensions,
};
