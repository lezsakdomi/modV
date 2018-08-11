import Vue from 'vue';
import { Layer } from 'modv';
import store from '@/../store';
import getNextName from '@/utils/get-next-name';

const state = {
  focusedLayer: 0,
  layers: [],
};

// getters
const getters = {
  allLayers: state => state.layers,
  focusedLayerIndex: state => state.focusedLayer,
  focusedLayer: state => state.layers[state.focusedLayer],
};

// actions
const actions = {
  addLayer({ commit, state }) {
    return new Promise(async (resolve) => {
      const layerName = await getNextName(
        'Layer',
        state.layers.map(layer => layer.name),
      );
      const layer = new Layer();
      layer.setName(layerName);

      const width = store.getters['size/width'];
      const height = store.getters['size/height'];
      let dpr = 1;
      if (store.getters['user/useRetina']) {
        dpr = window.devicePixelRatio;
      }

      layer.resize({ width, height, dpr });
      commit('addLayer', { layer });
      commit('setLayerFocus', {
        LayerIndex: state.layers.length - 1,
      });

      resolve({
        Layer: layer,
        index: state.layers.length - 1,
      });
    });
  },
  removeFocusedLayer({ commit, state }) {
    const layer = state.layers[state.focusedLayer];
    Object.keys(layer.modules).forEach((moduleName) => {
      store.dispatch(
        'modVModules/removeActiveModule',
        { moduleName },
      );
    });
    commit('removeLayer', { layerIndex: state.focusedLayer });
    if (state.focusedLayer > 0) commit('setLayerFocus', { LayerIndex: state.focusedLayer - 1 });
  },
  toggleLocked({ commit, state }, { layerIndex }) {
    const layer = state.layers[layerIndex];

    if (layer.locked) commit('unlock', { layerIndex });
    else commit('lock', { layerIndex });
  },
  toggleCollapsed({ commit, state }, { layerIndex }) {
    const layer = state.layers[layerIndex];

    if (layer.collapsed) commit('uncollapse', { layerIndex });
    else commit('collapse', { layerIndex });
  },
  addModuleToLayer({ commit }, { module, layerIndex, position }) {
    let positionShadow = position;
    if (typeof positionShadow !== 'number') {
      if (positionShadow < 0) {
        positionShadow = 0;
      }
    }
    commit('addModuleToLayer', {
      moduleName: module.meta.name,
      position: positionShadow,
      layerIndex,
    });

    store.commit(
      'modVModules/setModuleFocus',
      { activeModuleName: module.meta.name },
      { root: true },
    );
  },
  updateModuleOrder({ commit }, { layerIndex, order }) {
    commit('updateModuleOrder', { layerIndex, order });
  },
  resize({ state }, { width, height, dpr }) {
    state.layers.forEach((layer) => {
      layer.resize({ width, height, dpr });
    });
  },
  moveModuleInstance({ commit, state }, { fromLayerIndex, toLayerIndex, moduleName }) {
    const moduleInstance = state.layers[fromLayerIndex].modules[moduleName];

    commit('addModuleInstanceToLayer', { moduleName, moduleInstance, layerIndex: toLayerIndex });
    commit('removeModuleInstanceFromLayer', { moduleName, layerIndex: fromLayerIndex });
  },
  removeAllLayers({ commit, state }) {
    state.layers.forEach((layer, layerIndex) => {
      Object.keys(layer.modules).forEach((moduleName) => {
        store.dispatch(
          'modVModules/removeActiveModule',
          { moduleName },
        );
      });

      commit('removeLayer', { layerIndex });
    });
  },
  presetData({ state }) {
    return state.layers.map((layer) => {
      const layerData = {};
      layerData.alpha = layer.alpha;
      layerData.blending = layer.blending;
      layerData.clearing = layer.clearing;
      layerData.collapsed = layer.collapsed;
      layerData.drawToOutput = layer.drawToOutput;
      layerData.enabled = layer.enabled;
      layerData.inherit = layer.inherit;
      layerData.inheritFrom = layer.inheritFrom;
      layerData.locked = layer.locked;
      layerData.moduleOrder = layer.moduleOrder;
      layerData.name = layer.name;
      layerData.pipeline = layer.pipeline;
      return layerData;
    });
  },
  async setLayerName({ state, commit }, { layerIndex, name }) {
    const layerName = await getNextName(
      name,
      state.layers.map(layer => layer.name),
    );

    commit('setLayerName', { LayerIndex: layerIndex, name: layerName });
  },
};

// mutations
const mutations = {
  addModuleToLayer(state, { moduleName, layerIndex, position }) {
    const layer = state.layers[layerIndex];
    if (layer.locked) return;

    if (!layer) {
      throw `Cannot find Layer with index ${layerIndex}`; //eslint-disable-line
    } else {
      layer.addModule(moduleName, position);
    }
  },
  removeModuleFromLayer(state, { moduleName, layerIndex }) {
    const layer = state.layers[layerIndex];

    const moduleIndex = layer.moduleOrder.indexOf(moduleName);
    if (moduleIndex < 0) return;

    layer.moduleOrder.splice(moduleIndex, 1);
    Vue.delete(layer.modules, moduleName);
  },
  addModuleInstanceToLayer(state, { moduleName, moduleInstance, layerIndex }) {
    Vue.set(state.layers[layerIndex].modules, moduleName, moduleInstance);
  },
  removeModuleInstanceFromLayer(state, { moduleName, layerIndex }) {
    const layer = state.layers[layerIndex];
    Vue.delete(layer.modules, moduleName);
  },
  addLayer(state, { layer }) {
    state.layers.push(layer);
  },
  removeLayer(state, { layerIndex }) {
    state.layers.splice(layerIndex, 1);
  },
  setLayerName(state, { LayerIndex, name }) {
    state.layers[LayerIndex].setName(name);
  },
  setName(state, { layerIndex, name }) {
    state.layers[layerIndex].setName(name);
  },
  setLayerFocus(state, { LayerIndex }) {
    Vue.set(state, 'focusedLayer', LayerIndex);
  },
  lock(state, { layerIndex }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'locked', true);
  },
  unlock(state, { layerIndex }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'locked', false);
  },
  setLocked(state, { layerIndex, locked }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'locked', locked);
  },
  collapse(state, { layerIndex }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'collapsed', true);
  },
  uncollapse(state, { layerIndex }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'collapsed', false);
  },
  setCollapsed(state, { layerIndex, collapsed }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'collapsed', collapsed);
  },
  updatelayers(state, { layers }) {
    state.layers = layers;
  },
  updateModuleOrder(state, { layerIndex, order }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'moduleOrder', order);
  },
  setClearing(state, { layerIndex, clearing }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'clearing', clearing);
  },
  setAlpha(state, { layerIndex, alpha }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'alpha', alpha);
  },
  setEnabled(state, { layerIndex, enabled }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'enabled', enabled);
  },
  setInherit(state, { layerIndex, inherit }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'inherit', inherit);
  },
  setInheritFrom(state, { layerIndex, inheritFrom }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'inheritFrom', inheritFrom);
  },
  setPipeline(state, { layerIndex, pipeline }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'pipeline', pipeline);
  },
  setBlending(state, { layerIndex, blending }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'blending', blending);
  },
  setDrawToOutput(state, { layerIndex, drawToOutput }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'drawToOutput', drawToOutput);
  },
  setModuleOrder(state, { layerIndex, moduleOrder }) {
    const layer = state.layers[layerIndex];
    Vue.set(layer, 'moduleOrder', moduleOrder);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
