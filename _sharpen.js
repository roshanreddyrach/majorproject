const sharp = require('sharp')

const sharpenImage = () => {
  sharp ('./image/image1.jpg')
  .sharpen(13)
  .toFile(__dirname + '/processed_images/sharpen_image1.jpg')
}

sharpenImage()