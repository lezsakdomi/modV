import { modV } from '@/modv';
import render2d from '@/modv/renderers/2d';
import { render as renderShader } from '@/modv/renderers/shader';
import { render as renderIsf } from '@/modv/renderers/isf';
import store from '@/store';
import mux from './mux';

function draw(δ) {
  return new Promise((resolve) => {
    const layers = store.getters['layers/allLayers'];
    const audioFeatures = store.getters['meyda/features'];
    const previewValues = store.getters['size/previewValues'];

    const { bufferCanvas, bufferContext } = modV;

    if (!modV.meyda) return;
    const features = modV.meyda.get(audioFeatures);

    layers.forEach((Layer, LayerIndex) => {
      let canvas = Layer.canvas;
      const context = Layer.context;

      const clearing = Layer.clearing;
      const alpha = Layer.alpha;
      const enabled = Layer.enabled;
      const inherit = Layer.inherit;
      const inheritFrom = Layer.inheritFrom;
      const pipeline = Layer.pipeline;

      const { width, height } = canvas;

      if (pipeline && clearing) {
        if ((bufferCanvas.width * bufferCanvas.height) !== (canvas.width * canvas.height)) {
          bufferCanvas.width = canvas.width;
          bufferCanvas.height = canvas.height;
        } else {
          bufferContext.clearRect(0, 0, width, height);
        }
      }

      if (clearing) {
        context.clearRect(0, 0, width, height);
      }

      if (inherit) {
        let lastCanvas;

        if (inheritFrom < 0) {
          if (LayerIndex - 1 > -1) {
            lastCanvas = modV.layers[LayerIndex - 1].canvas;
          } else {
            lastCanvas = modV.outputCanvas;
          }
        } else {
          lastCanvas = modV.layers[inheritFrom].canvas;
        }

        context.drawImage(lastCanvas, 0, 0, width, height);

        if (pipeline) {
          bufferContext.drawImage(lastCanvas, 0, 0, width, height);
        }
      }

      if (!enabled || alpha === 0) return;

      Layer.moduleOrder.forEach((moduleName, moduleIndex) => {
        const Module = store.getters['modVModules/outerActive'][moduleName];

        if (!Module) return;

        if (!Module.meta.enabled || Module.meta.alpha === 0) return;

        if (pipeline && moduleIndex !== 0) {
          canvas = bufferCanvas;
        } else if (pipeline) {
          canvas = Layer.canvas;
        }

        if (Module.meta.type === '2d') {
          if (pipeline) {
            context.clearRect(0, 0, width, height);
            context.drawImage(
              bufferCanvas,
              0,
              0,
              width,
              height,
            );

            render2d({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda._m, //eslint-disable-line
              delta: δ,
              kick: modV.kick,
            });

            bufferContext.clearRect(0, 0, width, height);
            bufferContext.drawImage(
              Layer.canvas,
              0,
              0,
              width,
              height,
            );
          } else {
            render2d({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda._m, //eslint-disable-line
              delta: δ,
              kick: modV.kick,
            });
          }
        }

        if (Module.meta.type === 'shader') {
          if (pipeline) {
            context.clearRect(0, 0, width, height);
            context.drawImage(
              bufferCanvas,
              0,
              0,
              width,
              height,
            );

            renderShader({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda,
              delta: δ,
              pipeline,
            });

            bufferContext.clearRect(0, 0, width, height);
            bufferContext.drawImage(
              Layer.canvas,
              0,
              0,
              width,
              height,
            );
          } else {
            renderShader({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda,
              delta: δ,
              pipeline,
            });
          }
        }

        if (Module.meta.type === 'isf') {
          if (pipeline) {
            context.clearRect(0, 0, width, height);
            context.drawImage(
              bufferCanvas,
              0,
              0,
              width,
              height,
            );

            renderIsf({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda,
              delta: δ,
              pipeline,
            });

            bufferContext.clearRect(0, 0, width, height);
            bufferContext.drawImage(
              Layer.canvas,
              0,
              0,
              width,
              height,
            );
          } else {
            renderIsf({
              Module,
              canvas,
              context,
              video: modV.videoStream,
              features,
              meyda: modV.meyda,
              delta: δ,
              pipeline,
            });
          }
        }

        if (pipeline) {
          context.clearRect(0, 0, width, height);
          context.drawImage(
            bufferCanvas,
            0,
            0,
            modV.width,
            modV.height,
          );
        }
      });
    });

    modV.webgl.regl.poll();

    mux().then(() => {
      modV.previewContext.clearRect(0, 0, modV.previewCanvas.width, modV.previewCanvas.height);
      modV.previewContext.drawImage(
        modV.outputCanvas,
        previewValues.x,
        previewValues.y,
        previewValues.width,
        previewValues.height,
      );
      resolve();
    });
  });
}

export default draw;
