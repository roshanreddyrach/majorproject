const sharp = require('sharp')
const flopImage = async () => {
  await sharp('./image/image1.jpg')
  .flop()
  .toFile(__dirname + '/processed_images/flop_image1.jpg');
}
flopImage()