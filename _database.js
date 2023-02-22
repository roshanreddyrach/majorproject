const usingAsync = async() => {
    try{
      const sharp = require('sharp')
      const image = await sharp('./image/image1.jpg')
      .grayscale() // or .greyscale()
      .toFile(__dirname + '/processed_images/grayscale_image1.1.jpg')
  
      // Write code to store image to the database
  
      return image
  
    }catch(e){
       // handles error if any
       console.log(e);
    }
  }
  usingAsync()