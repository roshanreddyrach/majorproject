const sharp = require('sharp')

const convertTograyscale = () => {
  sharp('./image/image1.jpg')
  .grayscale() // or .greyscale()
  .toFile(__dirname + '/processed_images/grayscale_image1.jpg')
}

convertTograyscale()