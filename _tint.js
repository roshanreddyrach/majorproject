const sharp = require('sharp')

const tintImage = () => {
  sharp ('./image/image1.jpg')
  .tint({r: 255, g: 0, b: 0})
  .toFile(__dirname + '/processed_images/tint_image1.jpg')
}

tintImage()