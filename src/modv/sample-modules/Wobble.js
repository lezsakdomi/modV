import fragmentShader from './Wobble/wobble.frag';

export default {
  meta: {
    name: 'Wobble',
    author: '2xAA',
    version: '1.0.0',
    previewWithOutput: true,
    type: 'shader',
  },

  fragmentShader,

  props: {
    strength: {
      type: 'float',
      label: 'Strength',
      min: 0.0,
      max: 0.05,
      step: 0.001,
      default: 0.001,
    },

    size: {
      type: 'float',
      min: 1,
      max: 50,
      step: 1.0,
      default: 1.0,
    },
  },
};
