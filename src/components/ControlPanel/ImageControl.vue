<template>
  <div class="image-control" :data-moduleName="moduleName">
    <label :for="inputId">
      {{ label }}
    </label>

    <b-dropdown class="dropdown" v-model="dropdownValue" :id="inputId">
      <button class="button is-primary is-small" slot="trigger">
        <span>{{ selectedLabel | capitalize }}</span>
        <b-icon icon="angle-down"></b-icon>
      </button>

      <b-dropdown-item
        v-for="data, idx in dropdownData"
        :key="idx"
        :value="data.value"
      >{{ data.label | capitalize }}</b-dropdown-item>
    </b-dropdown>

    <input type="text" v-model="url">
    <b-radio v-model="urlType"
      native-value="image">
      Image
    </b-radio>
    <b-radio v-model="urlType"
      native-value="video">
      Video
    </b-radio>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { modV } from 'modv';

  const image = new Image();
  image.crossOrigin = 'anonymous';

  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.loop = true;
  video.addEventListener('canplaythrough', () => {
    video.play();
  });

  export default {
    name: 'imageControl',
    props: [
      'module',
      'control',
    ],
    data() {
      return {
        dropdownValue: 'inherit:',
        url: '',
        urlType: 'image',
      };
    },
    computed: {
      ...mapGetters('layers', {
        layers: 'allLayers',
      }),
      ...mapGetters('profiles', [
        'allProfiles',
      ]),
      layerNames() {
        const data = [];
        const allLayers = this.layers;

        if (allLayers.length < 1) return data;

        data.push({
          label: 'Inherit',
          value: 'inherit:',
          selected: typeof this.dropdownValue === 'undefined',
        });

        data.push({
          label: 'Webcam',
          value: 'webcam:',
          selected: this.dropdownValue === 'webcam:',
        });

        allLayers.forEach((Layer, idx) => {
          const name = Layer.name;
          data.push({
            label: name,
            value: `layer:${idx}`,
            selected: this.dropdownValue === `layer:${idx}`,
          });
        });

        return data;
      },
      value() {
        if (this.dropdownValue.indexOf('inherit:') > -1) {
          return undefined;
        }

        if (this.dropdownValue.indexOf('webcam:') > -1) {
          return modV.videoStream;
        }

        if (this.dropdownValue.indexOf('layer:') > -1) {
          return this.layers[parseInt(this.dropdownValue.replace('layer:', ''), 10)];
        }

        if (this.dropdownValue.indexOf('image:') > -1) {
          image.src = this.dropdownValue.replace('image:', '');

          return image;
        }

        if (this.dropdownValue.indexOf('video:') > -1) {
          const src = encodeURI(this.dropdownValue.replace('video:', ''));

          if (src !== video.src) {
            video.src = src;
          }

          return video;
        }

        return undefined;
      },
      moduleName() {
        return this.module.info.name;
      },
      variable() {
        return this.control.variable;
      },
      inputId() {
        return `${this.moduleName}-${this.variable}`;
      },
      label() {
        return this.control.label;
      },
      selectedLabel() {
        if (!this.dropdownValue) return 'Inherit';

        return this.dropdownValue.indexOf('inherit:') > -1 ? 'Inherit' : this.dropdownData.find(datum => datum.value === this.dropdownValue).label;
      },
      images() {
        const data = [];

        Object.keys(this.allProfiles).forEach((key) => {
          const profile = this.allProfiles[key];

          Object.keys(profile.images).forEach((key) => {
            data.push({
              label: key,
              value: `image:${profile.images[key]}`,
            });
          });
        });

        return data;
      },
      videos() {
        const data = [];

        Object.keys(this.allProfiles).forEach((key) => {
          const profile = this.allProfiles[key];

          Object.keys(profile.videos).forEach((key) => {
            data.push({
              label: key,
              value: `video:${profile.videos[key]}`,
            });
          });
        });

        return data;
      },
      dropdownData() {
        return this.layerNames.concat(this.images).concat(this.videos);
      },
    },
    watch: {
      value() {
        this.module[this.variable] = this.value;
        this.module[`cache-${this.variable}`] = this.dropdownValue;
      },
      url(value) {
        this.dropdownValue = `${this.urlType}:${value}`;
      },
    },
    mounted() {
      if (this.module[`cache-${this.variable}`]) {
        this.dropdownValue = this.module[`cache-${this.variable}`];
      }

      this.module[this.variable] = this.value;
      // this.module[this.variable] = this.value;
    },
  };
</script>

<style scoped>
  .profile-selector-container {
    display: inline-block;
  }

  .profile-selector.hsy-dropdown {
      display: inline-block;
      vertical-align: middle;

    & > .selected {
      // height: 28px !important;
      // line-height: 28px !important;

      font-family: inherit;
      /* font-size: 100%; */
      padding: .5em 22px .5em 1em;
      color: #444;
      color: rgba(0,0,0,.8);
      border: 1px solid #999;
      border: 0 rgba(0,0,0,0);
      background-color: #E6E6E6;
      text-decoration: none;
      border-radius: 2px;
    }
  }
</style>
