/* eslint-env worker */
/* globals OffscreenCanvas */

import meyda from 'meyda';

import { render as renderIsf } from '@/modv/renderers/isf';
import { render as renderShader } from '@/modv/renderers/shader';
import { getEnv } from '@/modv/webgl';

import { getOutputCanvas, setBufferCanvas, getBufferCanvas } from './canvas';
import state from './state';

import render2d from '../renderers/2d';

setBufferCanvas(new OffscreenCanvas(256, 256));

function draw(delta) {
  const { canvas: outputCanvas, context: outputContext } = getOutputCanvas();
  const { canvas: bufferCanvas, context: bufferContext } = getBufferCanvas();

  state.layers.forEach((Layer, LayerIndex) => {
    let canvas = Layer.canvas;
    const { context, clearing, alpha, enabled, inherit, inheritFrom, pipeline } = Layer;

    if (!enabled || alpha === 0) return;

    if (pipeline && clearing) {
      bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    }

    if (clearing) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (inherit) {
      let lastCanvas;

      if (inheritFrom < 0) {
        if (LayerIndex - 1 > -1) {
          lastCanvas = state.layers[LayerIndex - 1].canvas;
        } else {
          lastCanvas = outputCanvas;
        }
      } else {
        lastCanvas = state.layers[inheritFrom].canvas;
      }

      context.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);

      if (pipeline) {
        bufferContext.drawImage(lastCanvas, 0, 0, lastCanvas.width, lastCanvas.height);
      }
    }

    Layer.moduleOrder.forEach((moduleName, moduleIndex) => {
      const Module = state.active[moduleName];

      if (!Module) return;

      if (!Module.meta.enabled || Module.meta.alpha === 0) return;

      if (pipeline && moduleIndex !== 0) {
        canvas = bufferCanvas;
      } else if (pipeline) {
        canvas = Layer.canvas;
      }

      if (Module.meta.type === '2d') {
        if (pipeline) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(
            bufferCanvas,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          render2d({
            Module,
            canvas,
            context,
            // video: modV.videoStream,
            features: state.audioFeatures,
            meyda,
            delta,
          });

          bufferContext.clearRect(0, 0, canvas.width, canvas.height);
          bufferContext.drawImage(
            Layer.canvas,
            0,
            0,
            canvas.width,
            canvas.height,
          );
        } else {
          render2d({
            Module,
            canvas,
            context,
            // video: modV.videoStream,
            features: state.audioFeatures,
            meyda,
            delta,
          });
        }
      }

      if (Module.meta.type === 'shader') {
        if (pipeline) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(
            bufferCanvas,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          renderShader({
            Module,
            canvas,
            context,
            // video: modV.videoStream,
            features: state.audioFeatures,
            meyda,
            delta,
            pipeline,
          });

          bufferContext.clearRect(0, 0, canvas.width, canvas.height);
          bufferContext.drawImage(
            Layer.canvas,
            0,
            0,
            canvas.width,
            canvas.height,
          );
        } else {
          renderShader({
            Module,
            canvas,
            context,
            // video: modV.videoStream,
            features: state.audioFeatures,
            meyda,
            delta,
            pipeline,
          });
        }
      }

      if (Module.meta.type === 'isf') {
        if (pipeline) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(
            bufferCanvas,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          renderIsf({
            Module,
            canvas,
            context,
            // video: modV.videoStream,
            features: state.audioFeatures,
            meyda,
            delta,
            pipeline,
          });

          bufferContext.clearRect(0, 0, canvas.width, canvas.height);
          bufferContext.drawImage(
            Layer.canvas,
            0,
            0,
            canvas.width,
            canvas.height,
          );
        } else {
          renderIsf({
            Module,
            canvas,
            context,
            // video: modV.videoStream,
            features: state.audioFeatures,
            meyda,
            delta,
            pipeline,
          });
        }
      }
    });
  });

  const webGlEnv = getEnv();
  if (webGlEnv) {
    webGlEnv.regl.poll();
  }

  outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

  state.layers.forEach((Layer) => {
    if (!Layer.enabled || Layer.alpha === 0 || !Layer.drawToOutput) return;
    const canvas = Layer.canvas;
    outputContext.drawImage(canvas, 0, 0, outputCanvas.width, outputCanvas.height);
  });

  state.windows.forEach((windowController) => {
    const canvas = windowController.canvas;
    const context = windowController.context;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(outputCanvas, 0, 0, canvas.width, canvas.height);
  });

  const previewCanvas = state.previewCanvas.canvas;
  const previewContext = state.previewCanvas.context;

  previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewContext.drawImage(
    outputCanvas,
    state.previewCanvas.x,
    state.previewCanvas.y,
    state.previewCanvas.width,
    state.previewCanvas.height,
  );
}

export default draw;
