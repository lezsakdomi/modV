/* eslint-env worker */
/* globals OffscreenCanvas */

// import { Layer } from '@/modv';

import cloneDeep from 'lodash.clonedeep';

import { setup as shaderSetup } from '@/modv/renderers/shader';
import { setup as isfSetup, resize as resizeIsf } from '@/modv/renderers/isf';
import { getEnv } from '@/modv/webgl';

import state from './state';
import { setDimensions, getOutputCanvas, setOutputCanvas } from './canvas';

self.document = {};
self.document.createElement = (element) => {
  if (element.toLowerCase() === 'canvas') {
    return new OffscreenCanvas(256, 256);
  }

  console.warn('This is a Polyfill for Canvas element creation only, sorry.'); //eslint-disable-line
  return undefined;
};

self.window = {};
self.window.devicePixelRatio = 1;

const textureResolve = (sourceDef) => {
  const { source, sourceData } = sourceDef;

  switch (source) {
    case 'layer': {
      if (sourceData < 0) return false;
      return state.layers.layers[sourceData].canvas;
    }

    case 'image': {
      return false;
    }

    case 'video': {
      return false;
    }

    default: {
      return false;
    }
  }
};

export default async function onmessage(e) {
  if (e.data.dumpState) {
    console.log(state); //eslint-disable-line
    return;
  }

  if (e.data.canvas) {
    setOutputCanvas(e.data.canvas);
    return;
  }

  if (e.data.previewCanvas) {
    state.previewCanvas.canvas = e.data.previewCanvas;
    state.previewCanvas.context = state.previewCanvas.canvas.getContext('2d');
    return;
  }

  if (e.data.layerCanvas) {
    const layer = state.layers.find(layer => layer.name === e.data.layerName);
    layer.canvas = e.data.layerCanvas;
    layer.context = layer.canvas.getContext('2d');
    return;
  }

  if (e.data.windowCanvas) {
    const canvas = e.data.windowCanvas;
    const context = canvas.getContext('2d');
    state.windows.push({
      canvas,
      context,
    });
    return;
  }

  if (e.data.features) {
    state.audioFeatures = e.data.features;
    return;
  }

  let parsed;

  try {
    parsed = Function(`"use strict";return (${e.data})`)(); //eslint-disable-line
  } catch (err) {
    console.error(err, e.data);
    return;
  }

  const { type, payload } = parsed;

  switch (type) {
    case 'modVModules/addModuleToRegistry': {
      const { data, name } = payload;

      state.registry[name] = data;
      break;
    }

    case 'layers/addLayer': {
      const { layer } = payload;
      const { canvas } = getOutputCanvas();

      layer.canvas = new OffscreenCanvas(canvas.width, canvas.height);
      layer.context = layer.canvas.getContext('2d');

      state.layers.push(layer);
      break;
    }

    case 'modVModules/addModuleToActive': {
      const { canvas } = getOutputCanvas();

      const name = payload.data.meta.originalName || payload.name;

      const existingModuleData = state.registry[name];
      if (!existingModuleData) return;

      let newModuleData = cloneDeep(existingModuleData);

      switch (newModuleData.meta.type) {
        case 'shader':
          newModuleData = await shaderSetup(newModuleData);
          break;

        case 'isf':
          newModuleData = isfSetup(newModuleData);
          break;

        default:
          break;
      }

      const { data, props, presets } = newModuleData;

      if (data) {
        Object.keys(data).forEach((key) => {
          const value = data[key];
          newModuleData[key] = value;
        });
      }

      if (props) {
        Object.keys(props).forEach((key) => {
          const value = props[key];

          if (typeof value.default !== 'undefined') {
            newModuleData[key] = value.default;
          }

          if (value.type === 'group') {
            newModuleData[key] = {};

            newModuleData[key].length = value.default > -1 ? value.default : 1;
            newModuleData[key].props = {};

            Object.keys(value.props).forEach((groupProp) => {
              const groupValue = value.props[groupProp];
              newModuleData[key].props[groupProp] = [];

              if (value.default && typeof groupValue.default !== 'undefined') {
                for (let i = 0; i < value.default; i += 1) {
                  newModuleData[key].props[groupProp][i] = groupValue.default;
                }
              }
            });
          }
        });
      }

      if (presets) {
        newModuleData.presets = {};

        Object.keys(presets).forEach((key) => {
          const value = presets[key];
          newModuleData.presets[key] = value;
        });
      }

      state.active[payload.name || payload.data.meta.originalName] = newModuleData;

      if ('init' in newModuleData) {
        newModuleData.init({ canvas });
      }

      if ('resize' in newModuleData) {
        newModuleData.resize({ canvas });
      }

      break;
    }

    case 'layers/addModuleToLayer': {
      const { moduleName, layerIndex, position } = payload;

      const Layer = state.layers[layerIndex];
      if (Layer.locked) return;

      if (!Layer) {
        throw new Error(`Cannot find Layer with index ${layerIndex}`);
      } else {
        Layer.moduleOrder.splice(position, 0, moduleName);
      }

      break;
    }

    case 'layers/updateModuleOrder': {
      const { layerIndex, order } = payload;
      const Layer = state.layers[layerIndex];
      Layer.moduleOrder = order;

      break;
    }

    case 'modVModules/removeActiveModule': {
      const { moduleName } = payload;

      delete state.active[moduleName];
      break;
    }

    case 'layers/removeLayer': {
      const { layerIndex } = payload;

      state.layers.splice(layerIndex, 1);
      break;
    }

    case 'modVModules/updateProp': {
      const { name, prop, data, group, groupName } = payload;
      if (!state.active[name]) return;

      let value;

      if (data.type === 'texture') {
        value = textureResolve(data.value);
      } else {
        value = data.value;
      }

      if (typeof group === 'number') {
        state.active[name][groupName].props[prop][group] = value;
      } else {
        state.active[name][prop] = value;
      }

      break;
    }

    case 'modVModules/updateMeta': {
      const { name, metaKey, data } = payload;

      if (state.active[name]) state.active[name].meta[metaKey] = data;
      break;
    }

    case 'size/setDimensions': {
      setDimensions(payload);
      resizeIsf(payload);
      getEnv().resize(payload);
      state.queueWidth = payload.width;
      state.queueHeight = payload.height;

      break;
    }

    case 'size/setPreviewValues': {
      const { width, height, x, y } = payload;

      state.previewCanvas.width = width;
      state.previewCanvas.height = height;
      state.previewCanvas.x = x;
      state.previewCanvas.y = y;
      break;
    }

    case 'layers/setClearing': {
      const { layerIndex, clearing } = payload;
      const Layer = state.layers[layerIndex];
      Layer.clearing = clearing;
      break;
    }

    case 'layers/setAlpha': {
      const { layerIndex, alpha } = payload;
      const Layer = state.layers[layerIndex];
      Layer.alpha = alpha;
      break;
    }

    case 'layers/setEnabled': {
      const { layerIndex, enabled } = payload;
      const Layer = state.layers[layerIndex];
      Layer.enabled = enabled;
      break;
    }

    case 'layers/setInherit': {
      const { layerIndex, inherit } = payload;
      const Layer = state.layers[layerIndex];
      Layer.inherit = inherit;
      break;
    }

    case 'layers/setInheritFrom': {
      const { layerIndex, inheritFrom } = payload;
      const Layer = state.layers[layerIndex];
      Layer.inheritFrom = inheritFrom;
      break;
    }

    case 'layers/setPipeline': {
      const { layerIndex, pipeline } = payload;
      const Layer = state.layers[layerIndex];
      Layer.pipeline = pipeline;
      break;
    }

    case 'layers/setBlending': {
      const { layerIndex, blending } = payload;
      const Layer = state.layers[layerIndex];
      Layer.blending = blending;
      break;
    }

    case 'layers/setDrawToOutput': {
      const { layerIndex, drawToOutput } = payload;
      const Layer = state.layers[layerIndex];
      Layer.drawToOutput = drawToOutput;
      break;
    }

    default:
      break;
  }

  // self['console']['log'](state);
  // postMessage(JSON.stringify(state));
}
