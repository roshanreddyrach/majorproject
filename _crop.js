const sharp = require('sharp')

const cropImage = () => {
  sharp('./images/image1.jpg')
  .extract({left: 50, width: 100, height: 200, top: 100})
  .toFile(__dirname + '/processed_images/crop_image1.png')
}

cropImage()