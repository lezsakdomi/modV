import EventEmitter2 from 'eventemitter2';
import BeatDetektor from '@/extra/beatdetektor';
import store from '@/../store/';
import Layer from './Layer';
import { scan, setSource } from './MediaStream';
import { setupWebGl } from './webgl';
import PaletteWorker from './palette-worker/palette-worker';
import MediaManagerClient from './MediaManagerClient';
import installPlugin from './install-plugin';

const DrawWorker = require('worker-loader!./offscreen-draw'); //eslint-disable-line

function convertToText(obj) {
  // Create an array that will later be joined into a string.
  const string = [];

  if (obj === null) return '';

  // is Object
  if ((typeof obj === 'object') && (obj.join === undefined)) {
    string.push('{');

    for (let prop in obj) { //eslint-disable-line
      if (typeof obj[prop] !== 'undefined') {
        string.push(prop, ':', convertToText(obj[prop]), ',');
      }
    }

    string.push('}');

  // is Array
  } else if ((typeof obj === 'object') && (obj.join !== undefined)) {
    string.push('[');

    for (let prop in obj) { //eslint-disable-line
      if (typeof obj[prop] !== 'undefined') {
        string.push(convertToText(obj[prop]), ',');
      }
    }

    string.push(']');

  // is Function
  } else if (typeof obj === 'function') {
    // function shorthand conversion
    let functionString = obj.toString();

    if (functionString.indexOf(`${obj.name}(`) > -1) {
      functionString = functionString.replace(`${obj.name}(`, 'function(');
    }

    string.push(functionString);

  // all other values can be done with JSON.stringify (not really, but good enough for this example)
  } else {
    string.push(JSON.stringify(obj));
  }

  return string.join('');
}

class ModV extends EventEmitter2 {
  /**
   * [constructor description]
   * @param  {ModVOptions} options
   */
  constructor() {
    super();

    this.assignmentMax = 1;

    this.layers = store.getters['layers/allLayers'];
    this.registeredModules = store.getters['modVModules/registeredModules'];
    this.activeModules = store.getters['modVModules/outerActive'];
    this.getActiveModule = store.getters['modVModules/getActiveModule'];
    this.windows = store.getters['windows/allWindows'];
    this.windowReference = store.getters['windows/windowReference'];
    this.audioFeatures = store.getters['meyda/features'];
    this.mediaStreamDevices = {
      audio: store.getters['mediaStream/audioSources'],
      video: store.getters['mediaStream/videoSources'],
    };
    this.palettes = store.getters['palettes/allPalettes'];

    this.useDetectedBpm = store.getters['tempo/detect'];
    this.bpm = store.getters['tempo/bpm'];

    this.beatDetektor = new BeatDetektor(85, 169);
    this.beatDetektorKick = new BeatDetektor.modules.vis.BassKick();
    this.kick = false;

    this.mediaStreamScan = scan.bind(this);
    this.setMediaStreamSource = setSource.bind(this);

    this.width = 200;
    this.height = 200;

    this.webgl = setupWebGl(this);

    const ISFcanvas = document.createElement('canvas');
    const ISFgl = ISFcanvas.getContext('webgl2', {
      premultipliedAlpha: false,
    });

    this.isf = {
      canvas: ISFcanvas,
      gl: ISFgl,
    };

    this.mainRaf = null;
    this.workers = {};

    window.addEventListener('unload', () => {
      this.windows.forEach((windowController) => {
        const windowRef = this.windowReference(windowController.window);
        windowRef.close();
      });
    });

    this.delta = 0;

    this.outputCanvas = document.createElement('canvas');
    const offscreenOutputCanvas = this.outputCanvas.transferControlToOffscreen();

    this.drawWorker = new DrawWorker();

    this.drawWorker.postMessage({ canvas: offscreenOutputCanvas }, [offscreenOutputCanvas]);

    const mutations = [
      'layers/addLayer',
      'modVModules/addModuleToRegistry',
      'modVModules/addModuleToActive',
      'modVModules/updateProp',
      'size/setDimensions',
      'modVModules/updateMeta',
      'layers/setClearing',
      'layers/setAlpha',
      'layers/setEnabled',
      'layers/setInherit',
      'layers/setInheritFrom',
      'layers/setPipeline',
      'layers/setBlending',
      'layers/setDrawToOutput',
      'size/setPreviewValues',
      'layers/removeLayer',
      'modVModules/removeActiveModule',
      'layers/addModuleToLayer',
      'layers/updateModuleOrder',
    ];

    /* Subscribe to the store's actions (or mutations) to send state updates to the worker */
    store.subscribe((mutationIn) => {
      const type = mutationIn.type;

      if (mutations.indexOf(type) < 0) return;

      const mutation = Object.assign({}, mutationIn);

      if (type === 'modVModules/addModuleToActive') {
        if (mutation.payload.data.meta.name.indexOf('-gallery') > -1) {
          return;
        }

        if (mutation.payload.data.renderer) {
          delete mutation.payload.data.renderer;
        }
      }

      if (type === 'layers/addLayer') {
        delete mutation.payload.layer.canvas;
        delete mutation.payload.layer.context;
        delete mutation.payload.layer.resize;
      }

      let stringified = convertToText(mutation);
      stringified = stringified.replace(/function function/g, 'function');
      this.drawWorker.postMessage(stringified);
    });
  }

  start(Vue) {
    const mediaStreamScan = this.mediaStreamScan;
    const setMediaStreamSource = this.setMediaStreamSource;

    this.previewCanvas = document.getElementById('preview-canvas');
    const previewOffscreen = this.previewCanvas.transferControlToOffscreen();
    this.drawWorker.postMessage({ previewCanvas: previewOffscreen }, [previewOffscreen]);

    this.videoStream = document.createElement('video');
    this.videoStream.autoplay = true;
    this.videoStream.muted = true;

    store.dispatch('windows/createWindow', { Vue });

    mediaStreamScan().then((mediaStreamDevices) => {
      mediaStreamDevices.audio.forEach(source => store.commit('mediaStream/addAudioSource', { source }));
      mediaStreamDevices.video.forEach(source => store.commit('mediaStream/addVideoSource', { source }));

      let audioSourceId;
      let videoSourceId;

      if (store.getters['user/currentAudioSource']) {
        audioSourceId = store.getters['user/currentAudioSource'];
      } else if (mediaStreamDevices.audio.length > 0) {
        audioSourceId = mediaStreamDevices.audio[0].deviceId;
      }

      if (store.getters['user/setCurrentVideoSource']) {
        videoSourceId = store.getters['user/setCurrentVideoSource'];
      } else if (mediaStreamDevices.video.length > 0) {
        videoSourceId = mediaStreamDevices.video[0].deviceId;
      }

      return {
        audioSourceId,
        videoSourceId,
      };
    }).then(setMediaStreamSource).then(({ audioSourceId, videoSourceId }) => {
      store.commit('user/setCurrentAudioSource', { sourceId: audioSourceId });
      store.commit('user/setCurrentVideoSource', { sourceId: videoSourceId });

      this.mainRaf = requestAnimationFrame(this.loop.bind(this));
    });

    this.workers = this.createWorkers();
    this.MediaManagerClient = new MediaManagerClient();

    store.dispatch('size/resizePreviewCanvas');
  }

  loop(δ) {
    this.mainRaf = requestAnimationFrame(this.loop.bind(this));
    this.delta = δ;
    let features = [];

    if (this.audioFeatures.length > 0) {
      features = this.meyda.get(this.audioFeatures);
      if (features) this.drawWorker.postMessage({ features });
    }

    if (features) {
      this.activeFeatures = features;

      const assignments = store.getters['meyda/controlAssignments'];
      assignments.forEach((assignment) => {
        const featureValue = features[assignment.feature];

        store.dispatch('modVModules/updateProp', {
          name: assignment.moduleName,
          prop: assignment.controlVariable,
          data: featureValue,
        });
      });

      this.beatDetektor.process((δ / 1000.0), features.complexSpectrum.real);
      this.updateBPM(this.beatDetektor.win_bpm_int_lo);
    }

    store.getters['plugins/enabledPlugins']
      .filter(plugin => ('process' in plugin.plugin))
      .forEach(plugin => plugin.plugin.process({
        delta: δ,
      }));

    this.beatDetektorKick.process(this.beatDetektor);
    this.kick = this.beatDetektorKick.isKick();

    store.dispatch('modVModules/syncQueues');

    this.webgl.regl.poll();

    this.emit('tick', δ);
  }

  use(plugin) { //eslint-disable-line
    installPlugin(plugin);
  }

  addContextMenuHook(hook) { //eslint-disable-line
    store.commit('contextMenu/addHook', {
      hookName: hook.hook,
      hook,
    });
  }

  register(Module) { //eslint-disable-line
    store.dispatch('modVModules/register', Module);
  }

  resize(width, height, dpr = 1) {
    this.width = width * dpr;
    this.height = height * dpr;

    this.isf.canvas.width = this.width;
    this.isf.canvas.height = this.height;

    this.webgl.resize(this.width, this.height);
  }

  updateBPM(newBpm) {
    this.bpm = store.getters['tempo/bpm'];
    this.useDetectedBpm = store.getters['tempo/detect'];

    if (!newBpm || !this.useDetectedBpm) return;

    const bpm = Math.round(newBpm);
    if (this.bpm !== bpm) {
      store.dispatch('tempo/setBpm', { bpm });
    }
  }

  /** @return {WorkersDataType} */
  createWorkers() {//eslint-disable-line
    const palette = new PaletteWorker();

    return {
      palette,
    };
  }


  static get Layer() {
    return Layer;
  }
}

const modV = new ModV();

window.modV = modV;
const webgl = modV.webgl;
const isf = modV.isf;

export default modV;
export {
  modV,
  Layer,
  webgl,
  isf,
};
