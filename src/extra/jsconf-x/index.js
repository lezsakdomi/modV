import CookieCutter from './CookieCutter'

const capture = {
  name: 'X',

  cookieCutter: new CookieCutter(),

  processFrame({ canvas }) {
    if (!this.cookieCutter.inputCanvas) {
      this.cookieCutter.inputCanvas = canvas
    }

    this.cookieCutter.loop()
  }
}

export default capture
