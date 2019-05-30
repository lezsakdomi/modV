import CanvasSplitter from './CanvasSplitter'

const capture = {
  name: 'Splitter',

  splitter: new CanvasSplitter(),

  processFrame({ canvas }) {
    if (!this.splitter.inputCanvas) {
      this.splitter.inputCanvas = canvas
    }

    this.splitter.loop()
  }
}

export default capture
