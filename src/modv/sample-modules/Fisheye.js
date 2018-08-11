import fragmentShader from './Fisheye/fisheye.frag';

export default {
  meta: {
    name: 'Fisheye',
    author: '???',
    version: '1.0.0',
    previewWithOutput: true,
    type: 'shader',
  },

  fragmentShader,

  props: {
    aperture: {
      type: 'float',
      label: 'Aperture',
      min: 1.0,
      max: 360.0,
      step: 0.5,
      default: 180.0,
    },
  },
};
