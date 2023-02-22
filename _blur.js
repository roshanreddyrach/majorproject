const sharp = require('sharp')

const blurImage = () => {
  sharp('./images/image1.jpg')
  .blur(9)
  .toFile(__dirname + '/processed_images/blur_image1.jpg')
}

blurImage()