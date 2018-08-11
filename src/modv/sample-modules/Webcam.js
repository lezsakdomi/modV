export default {
  meta: {
    name: 'Webcam',
    author: '2xAA',
    version: '1.0.0',
    type: '2d',
  },

  draw({ canvas, context, video }) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  },
};
