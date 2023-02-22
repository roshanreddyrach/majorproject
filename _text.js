const sharp = require('sharp');

const addText = () => {
  const width = 200;
  const height = 400;
  const text = "E.T, go home";

  const svgText = `
  <svg width="${width}" height="${height}">
    <style>
      .title { fill: red; font-size: 30px}
    </style>
    <text x="45%" y="40%" text-anchor="middle" class="title">${text}</text>
  </svg>`

  const svgBuffer = Buffer.from(svgText);

  sharp ('./image/image1.jpg')
  .composite([{input: svgBuffer, left: 50, top: 100}])
  .toFile(__dirname + '/processed_images/text_image1.jpg')
}

addText()
