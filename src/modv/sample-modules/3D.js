export default {
  meta: {
    name: '3D',
    type: '3d'
  },

  props: {
    size: {
      label: 'Size',
      type: 'float',
      min: 1,
      max: 20,
      step: 0.2,
      default: 1
    },

    speed: {
      label: 'Speed',
      type: 'float',
      min: 0,
      max: 20,
      step: 1,
      default: 0
    },

    objectType: {
      type: 'enum',
      label: 'Object Type',
      enum: [
        { label: 'Icosahedron', value: 'ico', default: true },
        { label: 'Cube', value: 'cube' },
        { label: 'Sphere', value: 'sphere' }
      ]
    }
  },

  init({ canvas, THREE }) {
    const scene = this.getScene()
    const material = this.getMaterial()

    this.size = 1
    this.speed = 0
    this.objectType = 'ico'

    var aspect = canvas.width / canvas.height
    var d = 12

    // var VIEW_ANGLE = 45
    // var ASPECT = canvas.width / canvas.height
    // var NEAR = 0.1
    // var FAR = 10000

    /* camera = new THREE.PerspectiveCamera(VIEW_ANGLE,
			ASPECT,
			NEAR,
			FAR
		); */

    var camera = new THREE.OrthographicCamera(
      -d * aspect,
      d * aspect,
      d,
      -d,
      1,
      1000
    )
    camera.position.z = 30

    this.geometry = new THREE.IcosahedronGeometry(5, 0)
    this.ico = new THREE.Mesh(this.geometry, material)
    scene.add(this.ico)

    this.geometry = new THREE.BoxGeometry(7, 7, 7)
    this.cube = new THREE.Mesh(this.geometry, material)
    scene.add(this.cube)

    this.geometry = new THREE.SphereGeometry(5, 32, 32)
    this.sphere = new THREE.Mesh(this.geometry, material)
    scene.add(this.sphere)

    this.setScene(scene)
    this.setCamera(camera)
  },

  resize({ canvas }) {
    const camera = this.getCamera()

    var WIDTH = canvas.width
    var HEIGHT = canvas.height

    var ratio = WIDTH / HEIGHT
    var zoom = camera.top
    var newWidth = zoom * ratio
    camera.left = -Math.abs(newWidth)
    camera.right = newWidth
    camera.bottom = -Math.abs(zoom)

    // camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix()
  },

  draw({ scene, camera, material, texture, features }) {
    var obj
    if (this.objectType === 'sphere') obj = this.sphere
    else this.sphere.visible = false

    if (this.objectType === 'ico') obj = this.ico
    else this.ico.visible = false

    if (this.objectType === 'cube') obj = this.cube
    else this.cube.visible = false

    obj.visible = true

    obj.rotation.x += this.speed * 0.005
    obj.rotation.y += this.speed * 0.01
    var scale = this.size + features.rms
    obj.scale.set(scale, scale, scale)
  }
}
