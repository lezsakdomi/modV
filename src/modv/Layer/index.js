/**
 * @typedef {Object} Layer
 *
 * @property {String}  name                Name of the Layer
 *
 * @property {Number}  position            Position of the Layer
 *
 * @property {Array}   moduleOrder         The draw order of the Modules contained within the Layer
 *
 * @property {Boolean} enabled             Indicates whether the Layer should be drawn
 *
 * @property {Number}  alpha               The level of opacity, between 0 and 1, the Layer should
 *                                         be muxed at
 *
 * @property {Boolean} inherit             Indicates whether the Layer should inherit from another
 *                                         Layer at redraw
 *
 * @property {Number}  inheritFrom         The target Layer to inherit from, -1 being the previous
 *                                         Layer in modV#layers, 0-n being the index of
 *                                         another Layer within modV#layers
 *
 * @property {Boolean} pipeline            Indicates whether the Layer should render using pipeline
 *                                         at redraw
 *
 * @property {Boolean} clearing            Indicates whether the Layer should clear before redraw
 *
 * @property {String}  compositeOperation  The {@link Blendmode} the Layer muxes with
 *
 * @property {Boolean} drawToOutput        Indicates whether the Layer should draw to the output
 *                                         canvas
 *
 * @property {String}  drawToWindowId      The ID of the Window to draw the Layer to,
 *                                         null indicates the Layer should draw to all Windows
 *
 * @property {Number}  renderQuality       The render quality/scale of the Layer's canvas
 *
 * @example
 * const Layer = {
 *   name: 'Layer',
 *
 *   position: 0,
 *
 *   moduleOrder: [
 *     'Module Name',
 *     'Another Module Name',
 *     'Waveform',
 *   ],
 *
 *   enabled: true,
 *
 *   alpha: 1,
 *
 *   inherit: true,
 *
 *   inheritFrom: -1,
 *
 *   pipeline: false,
 *
 *   clearing: false,
 *
 *   compositeOperation: 'normal',
 *
 *   drawToWindowId: null,
 * };
 */

import store from '@/store';

/**
 * Generates a Layer Object
 * @param {Object} options.layer Overrides for the default Layer parameters
 *
 * @returns {Layer}
 */
export default function Layer(layer) {
  const defaults = {
    name: 'Layer',

    position: 0,

    moduleOrder: [],

    enabled: true,

    alpha: 1,

    inherit: true,

    inheritFrom: -1,

    pipeline: false,

    clearing: false,

    compositeOperation: 'normal',

    drawToOutput: true,

    canvas: document.createElement('canvas'),

    drawToWindowId: null,

    resize({ width, height, dpr = window.devicePixelRatio }) {
      const { _renderQuality: renderQuality } = this;

      this.canvas.width = Math.round(width * renderQuality) * dpr;
      this.canvas.height = Math.round(height * renderQuality) * dpr;
    },

    _renderQuality: 1,

    get renderQuality() {
      const { _renderQuality: renderQuality } = this;
      return renderQuality;
    },

    set renderQuality(value) {
      this._renderQuality = value; //eslint-disable-line

      const { width, height } = store.state.size;
      this.resize({ width, height });
    },
  };

  defaults.context = defaults.canvas.getContext('2d');

  return Object.assign(defaults, layer);
}
