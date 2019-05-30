<template>
  <div @dblclick="sizeModalOpen = true">
    <span>{{ sizeOut }}</span>

    <b-modal :active.sync="sizeModalOpen">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Output Size</p>
        </header>

        <section class="modal-card-body">
          <b-input
            v-model.number="width"
            type="number"
            style="width: 120px; display: inline-block"
          />
          <b>𝗑</b>
          <b-input
            v-model.number="height"
            type="number"
            style="width: 120px; display: inline-block"
          /><br /><br />
          <b-checkbox v-model="reactToWindowResize"
            >reactToWindowResize</b-checkbox
          >
        </section>

        <footer class="modal-card-foot">
          <button class="button" @click="setWindowSize">Set window size</button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      sizeModalOpen: false,
      width: 0,
      height: 0
    }
  },
  computed: {
    ...mapGetters('windows', ['largestWindowSize', 'largestWindowReference']),
    sizeOut() {
      return `${this.largestWindowSize.width}𝗑${
        this.largestWindowSize.height
      }px`
    },
    reactToWindowResize: {
      get() {
        return this.$store.state.size.reactToWindowResize
      },

      set(value) {
        this.$store.dispatch('size/setReactToWindowResize', value)
      }
    }
  },
  watch: {
    largestWindowSize(value) {
      this.width = value.width
      this.height = value.height
    }
  },
  methods: {
    setWindowSize() {
      // this.resizeWindow(this.largestWindowReference(), this.width, this.height)
      this.$store.dispatch('size/setDimensions', {
        width: this.width,
        height: this.height
      })
    },
    resizeWindow(window, width, height) {
      if (window.outerWidth) {
        window.resizeTo(
          width + (window.outerWidth - window.innerWidth),
          height + (window.outerHeight - window.innerHeight)
        )
      } else {
        window.resizeTo(500, 500)
        window.resizeTo(
          width + (500 - document.body.offsetWidth),
          height + (500 - document.body.offsetHeight)
        )
      }
    }
  }
}
</script>
