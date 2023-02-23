const sharp = require('sharp');

const addText = () => {
  const width = 400;
  const height = 100;
  const text = "PurpleKing ";

  const svgText = `
  <svg width="${width}" height="${height}" viewBox="0 0 100 100">
    <style>
      .title { fill: purple; font-size: 20px}
    </style>
    <text x="5%" y="40%" text-anchor="start" class="title">${text}</text>
  </svg>`

  const svgBuffer = Buffer.from(svgText);

  sharp ('./image/image1.jpg')
  .composite([{input: svgBuffer, left: 1, top: 2}])
  .toFile(__dirname + '/processed_images/text_image1.jpg')
}

addText()