import Hydra from 'hydra-synth'
import store from '@/store/'

const hydraCanvas = document.createElement('canvas')

const hydra = new Hydra({
  canvas: hydraCanvas,
  makeGlobal: false,
  autoLoop: true
})

store.subscribe(({ type, payload }) => {
  // if (type === 'layers/addLayer') {
  //   debugger
  //   const src = hydra.newSource()
  //   src.init({ src: payload.layer.canvas, dynamic: true })
  // }
})

export default function renderHydra({
  Module,
  canvas,
  context,
  video,
  features,
  meyda,
  delta,
  bpm,
  kick
}) {
  if (Module.needsUpdate) {
    Module.update({ hydra })
    Module.needsUpdate = false
  }

  context.drawImage(hydraCanvas, 0, 0)
}
