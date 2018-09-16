/* eslint-env worker */

import draw from './draw';
import onmessage from './on-message';

function render(delta) {
  requestAnimationFrame(render);
  draw(delta);
}
requestAnimationFrame(render);

self.onmessage = onmessage;
