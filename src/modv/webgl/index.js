/* eslint-env worker */
/* globals OffscreenCanvas */

import createREGL from 'regl/dist/regl.unchecked';
import defaultShader from './default-shader';

let env;

function getEnv() {
  return env;
}

function setupWebGl(modV) {
  const canvas = typeof window === 'undefined' ? new OffscreenCanvas(256, 256) : document.createElement('canvas');
  const gl = canvas.getContext('webgl2', {
    premultipliedAlpha: false,
    antialias: true,
  });

  const regl = createREGL({
    gl,
    attributes: {
      antialias: true,
    },
  });

  env = { gl, canvas, regl };

  Object.defineProperty(env, 'defaultShader', {
    get: () => defaultShader,
  });

  if (modV && modV.webgl) modV.webgl = env;

  env.resize = (widthIn, heightIn, dpr = 1) => {
    const width = widthIn * dpr;
    const height = heightIn * dpr;

    canvas.width = width;
    canvas.height = height;
  };

  if (modV) env.resize(modV.width, modV.height);

  return env;
}

export {
  setupWebGl,
  getEnv,
};
