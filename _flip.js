const sharp = require('sharp')
const flipImage = async () => {
  await sharp('./image/image1.jpg')
  .flip()
  .toFile(__dirname + '/processed_images/flip_image1.jpg');
}
flipImage()