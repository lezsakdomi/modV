import { modV } from '@/modv';
import store from '@/../store';

function mux() {
  return new Promise((resolve) => {
    const layers = store.getters['layers/allLayers'];
    const windows = store.getters['windows/allWindows'];
    const { width, height } = modV;

    const { outputCanvas, outputContext } = modV;

    outputContext.clearRect(0, 0, width, height);

    layers.forEach((Layer) => {
      if (!Layer.enabled || Layer.alpha === 0 || !Layer.drawToOutput) return;
      const { canvas } = Layer;
      outputContext.drawImage(canvas, 0, 0, width, height);
    });

    resolve();

    store.getters['plugins/enabledPlugins'].filter(plugin => ('processFrame' in plugin.plugin))
      .forEach(plugin => plugin.plugin.processFrame({
        canvas: outputCanvas,
        context: outputContext,
      }));

    windows.forEach((windowController) => {
      const { canvas, context } = windowController;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(outputCanvas, 0, 0, canvas.width, canvas.height);
    });
  });
}

export default mux;
