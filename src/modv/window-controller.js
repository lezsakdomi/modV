import store from '@/../store';
import { modV } from '@/modv';

class WindowController {
  constructor(Vue) {
    return new Promise((resolve) => {
      if (window.nw) {
        if (window.nw.open) {
          window.nw.Window.open('output.html', (newWindow) => {
            this.window = newWindow.window;
            if (this.window.document.readyState === 'complete') {
              this.configureWindow(resolve);
            } else {
              this.window.onload = () => {
                this.configureWindow(resolve);
              };
            }
          });
        } else {
          this.window = window.open(
            '',
            '_blank',
            'width=250, height=250, location=no, menubar=no, left=0',
          );

          if (this.window === null || typeof this.window === 'undefined') {
            Vue.$dialog.alert({
              title: 'Could not create Output Window',
              message: 'modV couldn\'t open an Output Window. Please check you\'ve allowed pop-ups - then reload',
              type: 'is-danger',
              hasIcon: true,
              icon: 'times-circle',
              iconPack: 'fa',
            });
            return;
          }

          if (this.window.document.readyState === 'complete') {
            this.configureWindow(resolve);
          } else {
            this.window.onload = () => {
              this.configureWindow(resolve);
            };
          }
        }
      }
    });
  }


  configureWindow(callback) {
    const windowRef = this.window;
    windowRef.document.title = 'modV Output';
    windowRef.document.body.style.margin = '0px';
    windowRef.document.body.style.backgroundColor = 'black';
    windowRef.document.body.style.position = 'relative';
    windowRef.document.body.style.overflow = 'hidden';

    this.canvas = document.createElement('canvas');
    const offscreen = this.canvas.transferControlToOffscreen();
    modV.drawWorker.postMessage({ windowCanvas: offscreen }, [offscreen]);

    this.canvas.style.backgroundColor = 'transparent';
    this.canvas.style.left = '50%';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '50%';
    this.canvas.style.transform = 'translate(-50%, -50%)';

    this.canvas.addEventListener('dblclick', () => {
      if (!this.canvas.ownerDocument.webkitFullscreenElement) {
        this.canvas.webkitRequestFullscreen();
      } else {
        this.canvas.ownerDocument.webkitExitFullscreen();
      }
    });

    let mouseTimer;

    function movedMouse() {
      if (mouseTimer) mouseTimer = null;
      this.canvas.ownerDocument.body.style.cursor = 'none';
    }

    this.canvas.addEventListener('mousemove', () => {
      if (mouseTimer) clearTimeout(mouseTimer);
      this.canvas.ownerDocument.body.style.cursor = 'default';
      mouseTimer = setTimeout(movedMouse.bind(this), 200);
    });

    this.window.document.body.appendChild(this.canvas);

    let lastArea = 0;
    let resizeRaf = false;

    const checkResize = () => {
      resizeRaf = requestAnimationFrame(checkResize);
      const { innerWidth: width, innerHeight: height } = windowRef;

      const thisArea = width * height;

      if (thisArea === lastArea) {
        this.resize(width, height, window.devicePixelRatio, true);
        cancelAnimationFrame(resizeRaf);
        resizeRaf = false;
        return;
      }

      lastArea = thisArea;
    };

    this.resize = (width = 256, height = 256, dpr = window.devicePixelRatio || 1, emit = false) => {
      if (emit) {
        store.dispatch('size/setDimensions', { width, height });
        return;
      }

      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
    };

    windowRef.addEventListener('resize', () => {
      if (!resizeRaf) resizeRaf = requestAnimationFrame(checkResize);
    });

    windowRef.addEventListener('beforeunload', () => 'You sure about that, you drunken mess?');
    windowRef.addEventListener('unload', () => {
      store.dispatch('windows/destroyWindow', { windowRef: this.window });
    });

    if (callback) callback(this);
  }
}

export default WindowController;
