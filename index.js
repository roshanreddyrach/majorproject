const express = require("express");
const multer = require('multer');
const sharp = require('sharp');

const archiver = require("archiver");

var width;
var format;
var outputFilePath;
var height;
var blurValue;
var sharpenValue;
var rotateAngle;
var LCroppingSpace;
var CroppedWidth;
var CroppedHeight;
var TCroppingSpace;
var InputText;
var TxtColor;
var FontSize;
var MoveLeft;
var MoveTop;


var redValue;
var greenValue;
var blueValue;




const imageSize = require('image-size');

const bodyParser = require('body-parser');

const fs = require('fs');

const path = require('path');

var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}


const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static("public"));


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  const imageFilter = function (req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  };

  var upload = multer({ storage: storage, fileFilter: imageFilter });

  fs.chmod('E:/webdev/project/mainProject/majorproject/public/uploads', 0o777, (err) => {
    if (err) {
      console.error('Error changing directory permissions:', err);
    } else {
      console.log('Directory permissions changed successfully');
    }
  });

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post('/processed_images',upload.single('file'),(req,res) => {
  let index = 1;
  const filePath = req.file.path;
  const processedDir = __dirname + '/processed_images';
  const processedFileName = 'processed_image' + `${index}output.${format}`;
  const processedFilePath = processedDir + '/' + processedFileName;

  // create directory for processed images if it doesn't exist
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir);
  }

  fs.chmod('E:/webdev/project/mainProject/majorproject/processed_images', 0o777, (err) => {
    if (err) {
      console.error('Error changing directory permissions:', err);
    } else {
      console.log('Directory permissions changed successfully');
    }
  });

     format = req.body.format;
     width = parseInt(req.body.width);
     height = parseInt(req.body.height);
     blurValue = parseInt(req.body.Bvalue);
     sharpenValue = parseInt(req.body.Svalue);
     rotateAngle = parseInt(req.body.angle);

     const grayscale = req.body.grayscale;
     const flipflop = req.body.flipflop;


     LCroppingSpace = parseInt(req.body.LeftCropingSpace);
     CroppedWidth = parseInt(req.body.croppedWidth);
     CroppedHeight = parseInt(req.body.croppedHeight)
     TCroppingSpace = parseInt(req.body.TopCropingSpace);

     InputText = req.body.inputText;
     TxtColor = req.body.txtColor;
     FontSize = parseInt(req.body.fontSize);
     MoveLeft = parseInt(req.body.moveLeft);
     MoveTop = parseInt(req.body.moveTop);


     redValue = parseInt(req.body.rvalue);
     blueValue = parseInt(req.body.gvalue);
     greenValue = parseInt(req.body.bvalue);


     if (req.file){
          // console.log(req.file.path);


          if(isNaN(width) || isNaN(height)){

            var dimensions = imageSize(req.file.path);

            console.log(dimensions);

            width = parseInt(dimensions.width);
            height = parseInt(dimensions.height);

            resizeImage(width,height,req,res);
            console.log(width,height);

          }
          else{

            resizeImage(width,height,req,res);
            console.log(width,height);
          }
       }

       if(req.file){

        if (grayscale === "true") {
          convertTograyscale(req, res);
          console.log(grayscale);
        }

        if (flipflop === "flip") {
          flipImage(req,res);
          console.log(flipflop);

        }

        if (flipflop === "flop") {
          flopImage(req,res);
          console.log(flipflop);

        }

        if(blurValue){
          blurImage(blurValue,req,res);
          console.log(blurValue);
        }

        if(sharpenValue){
          sharpenImage(sharpenValue,req,res);
          console.log(sharpenValue);
        }

        if(rotateAngle){
          rotateImage(rotateAngle,req,res);
          console.log(rotateAngle);
        }

        if(LCroppingSpace,CroppedWidth,CroppedHeight,TCroppingSpace){
          cropImage(LCroppingSpace,CroppedWidth,CroppedHeight,TCroppingSpace,req,res);
          console.log(LCroppingSpace,CroppedWidth,CroppedHeight,TCroppingSpace);
        }

        // if(InputText,TxtColor,FontSize,MoveLeft,MoveTop){
        //   addText(InputText,TxtColor,FontSize,MoveLeft,MoveTop,req,res);
        //   console.log(InputText,TxtColor,FontSize,MoveLeft,MoveTop);
        // }

        if(InputText){
          addText(InputText,req,res);
          console.log(InputText);
        }

        if(redValue,greenValue,blueValue,req,res){
          tintImage( redValue,greenValue,blueValue,req,res);
          console.log(redValue,greenValue,blueValue)

        }

       }
})

// download all processed images as a zip file
app.get('/download_all', (req, res) => {
  const processedDir = __dirname + '/processed_images';
  const zipFilePath = __dirname + '/processed_images.zip';

  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir);
  }


  // create a zip file of all images in the processed_images directory
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.directory(processedDir, false);
  archive.pipe(fs.createWriteStream(zipFilePath));
  archive.finalize();

  // send the zip file to the client for download
  res.download(zipFilePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
    } else {
      console.log('File download successful');
      // delete the zip file from the server after sending it to the client
      fs.unlinkSync(zipFilePath);
    }
  });
});

app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});

function resizeImage(width,height,req,res){

    if (req.file) {
      var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);

       fs.mkdirSync(subDirectory);
     }

    let index = 1;
    //   outputFilePath = `${index}output.${format}`;
    const filePath = req.file.path;
    const processedDir = __dirname + '/processed_images';
    const processedFileName = 'processed_image' + `${index}output.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
      sharp(req.file.path)
        .resize(width, height)
        // .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
        //   if (err) throw err;
        // });
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          } else {
            console.log('resizeImage processed successfully');
            // send the processed image back to the client
            // res.sendFile(processedFilePath, (err) => {
            //   if (err) {
            //     console.error('Error sending file:', err);
            //     res.status(500).send('Error sending file');
            //   } else {
                console.log('File sent successfully');
                // delete the processed image from the server
                // fs.unlinkSync(processedFilePath);
              }
            });
          }
          // delete the uploaded image from the server
          // fs.unlinkSync(filePath);
        // });
    // }
  }


  function convertTograyscale(req,res){
    if(req.file){
      var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);

       fs.mkdirSync(subDirectory);
     }

    let index = 2;
  //  outputFilePath = `${index}output.${format}`;
  const filePath = req.file.path;
  const processedDir = __dirname + '/processed_images';
  const processedFileName ='processed_image' + `${index}output.${format}`;
  const processedFilePath = processedDir + '/' + processedFileName;
      sharp(req.file.path)
      .grayscale()
      // .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
      //   if (err) throw err;
      //   });
      .toFile(processedFilePath, (err, info) => {
        if (err) {
          console.error('Error processing image:', err);
          res.status(500).send('Error processing image');
        } else {
          console.log('grayscaleImage processed successfully');
          // send the processed image back to the client
          // res.sendFile(processedFilePath, (err) => {
          //   if (err) {
          //     console.error('Error sending file:', err);
          //     res.status(500).send('Error sending file');
          //   } else {
              console.log('File sent successfully');
          //     delete the processed image from the server
          //     fs.unlinkSync(processedFilePath);
          //   }
          // });
        }
        // delete the uploaded image from the server
        // fs.unlinkSync(filePath);
      });
    }
  }

  function flipImage(req,res){
    if(req.file){
      var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);

       fs.mkdirSync(subDirectory);
     }
    let index = 3;
  //  outputFilePath = `${index}output.${format}`;
  const filePath = req.file.path;
  const processedDir = __dirname + '/processed_images';
  const processedFileName = 'processed_image' + `${index}output.${format}`;
  const processedFilePath = processedDir + '/' + processedFileName;
      sharp(req.file.path)
      .flip()
      // .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
      //   if (err) throw err;
      //   });
      .toFile(processedFilePath, (err, info) => {
        if (err) {
          console.error('Error processing image:', err);
          res.status(500).send('Error processing image');
        } else {
          console.log('flipImage processed successfully');
          // send the processed image back to the client
          // res.sendFile(processedFilePath, (err) => {
          //   if (err) {
          //     console.error('Error sending file:', err);
          //     res.status(500).send('Error sending file');
          //   } else {
              console.log('File sent successfully');
              // delete the processed image from the server
              // fs.unlinkSync(processedFilePath);
            }
          });
        }
        // delete the uploaded image from the server
        // fs.unlinkSync(filePath);
      // });
    // }
  }
  function flopImage(req,res){
    if(req.file){
      var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);

       fs.mkdirSync(subDirectory);
     }

    let index = 4;
  //  outputFilePath = `${index}output.${format}`;
  const filePath = req.file.path;
  const processedDir = __dirname + '/processed_images';
  const processedFileName = 'processed_image' + `${index}output.${format}`;
  const processedFilePath = processedDir + '/' + processedFileName;
      sharp(req.file.path)
      .flop()
      // .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
      //   if (err) throw err;
      //   });
      .toFile(processedFilePath, (err, info) => {
        if (err) {
          console.error('Error processing image:', err);
          res.status(500).send('Error processing image');
        } else {
          console.log('flopImage processed successfully');
          // send the processed image back to the client
          // res.sendFile(processedFilePath, (err) => {
          //   if (err) {
          //     console.error('Error sending file:', err);
          //     res.status(500).send('Error sending file');
          //   } else {
              console.log('File sent successfully');
              // delete the processed image from the server
              fs.unlinkSync(processedFilePath);
            }
          });
        }
        // delete the uploaded image from the server
        // fs.unlinkSync(filePath);
      // });
    // }
  }

  function blurImage(blurValue,req,res){
      if(req.file){
        var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);

       fs.mkdirSync(subDirectory);
     }

        let index = 5;
      //  outputFilePath = `${index}output.${format}`;
      const filePath = req.file.path;
  const processedDir = __dirname + '/processed_images';
  const processedFileName = 'processed_image' + `${index}output.${format}`;
  const processedFilePath = processedDir + '/' + processedFileName;
          sharp(req.file.path)
          .blur(blurValue)
          // .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
          //   if (err) throw err;
          //   });
          .toFile(processedFilePath, (err, info) => {
            if (err) {
              console.error('Error processing image:', err);
              res.status(500).send('Error processing image');
            } else {
              console.log('blurImage processed successfully');
              // send the processed image back to the client
              // res.sendFile(processedFilePath, (err) => {
              //   if (err) {
              //     console.error('Error sending file:', err);
              //     res.status(500).send('Error sending file');
              //   } else {
                  console.log('File sent successfully');
                  // delete the processed image from the server
                  // fs.unlinkSync(processedFilePath);
                }
              });
            }
            // delete the uploaded image from the server
            // fs.unlinkSync(filePath);
          // });
    // }
  }


function sharpenImage(sharpenValue,req,res){
    if(req.file){
      var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);

       fs.mkdirSync(subDirectory);
     }

      let index = 6;
    //  outputFilePath = `${index}output.${format}`;
    const filePath = req.file.path;
  const processedDir = __dirname + '/processed_images';
  const processedFileName = 'processed_image' + `${index}output.${format}`;
  const processedFilePath = processedDir + '/' + processedFileName;
        sharp(req.file.path)
        .sharpen(sharpenValue)
        // .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
        //   if (err) throw err;
        //   });
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          } else {
            console.log('sharpenImage processed successfully');
            // send the processed image back to the client
            // res.sendFile(processedFilePath, (err) => {
            //   if (err) {
            //     console.error('Error sending file:', err);
            //     res.status(500).send('Error sending file');
            //   } else {
                console.log('File sent successfully');
                // delete the processed image from the server
                // fs.unlinkSync(processedFilePath);
              }
            });
          }
          // delete the uploaded image from the server
          // fs.unlinkSync(filePath);
        // });
  // }
}

function rotateImage(rotateAngle,req,res){
    if(req.file){
      var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);

       fs.mkdirSync(subDirectory);
     }

      let index = 7;
    //  outputFilePath = `${index}output.${format}`;
    const filePath = req.file.path;
  const processedDir = __dirname + '/processed_images';
  const processedFileName = 'processed_image' + `${index}output.${format}`;
  const processedFilePath = processedDir + '/' + processedFileName;
        sharp(req.file.path)
        .rotate(rotateAngle)
        // .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
        //   if (err) throw err;
        //   });
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          } else {
            console.log('rotateImage processed successfully');
            // send the processed image back to the client
            // res.sendFile(processedFilePath, (err) => {
            //   if (err) {
            //     console.error('Error sending file:', err);
            //     res.status(500).send('Error sending file');
            //   } else {
                console.log('File sent successfully');
                // delete the processed image from the server
                // fs.unlinkSync(processedFilePath);
              }
            });
          }
          // delete the uploaded image from the server
          // fs.unlinkSync(filePath);
        // });
  // }
}


function cropImage(LCroppingSpace,CroppedWidth,CroppedHeight,TCroppingSpace,req,res){
    if(req.file){
      var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);

       fs.mkdirSync(subDirectory);
     }

      let index = 8;
    //  outputFilePath = `${index}output.${format}`;
    const filePath = req.file.path;
  const processedDir = __dirname + '/processed_images';
  const processedFileName = 'processed_image' + `${index}output.${format}`;
  const processedFilePath = processedDir + '/' + processedFileName;
        sharp(req.file.path)
        .extract({left: LCroppingSpace, width: CroppedWidth, height: CroppedHeight, top: TCroppingSpace})
        // .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
        //   if (err) throw err;
        //   });
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          } else {
            console.log('cropImage processed successfully');
            // send the processed image back to the client
            // res.sendFile(processedFilePath, (err) => {
            //   if (err) {
            //     console.error('Error sending file:', err);
            //     res.status(500).send('Error sending file');
            //   } else {
                console.log('File sent successfully');
                // delete the processed image from the server
                // fs.unlinkSync(processedFilePath);
              }
            });
          }
          // delete the uploaded image from the server
          // fs.unlinkSync(filePath);
        // });
  // }
}


// function addText(InputText,TxtColor,FontSize,MoveLeft,MoveTop,req,res){
//     if(req.file){
//       let index = 9;
//      outputFilePath = `${index}output.${format}`;

//         const txtwidth = 400;
//         const txtheight = 100;

//         const svgText = `
//         <svg width="${txtwidth}" height="${txtheight}" viewBox="0 0 100 100">
//           <style>
//             .title { fill:"${TxtColor}" ; font-size:"${FontSize}px"}
//           </style>
//           <text x="5%" y="40%" text-anchor="start" class="title">${InputText}</text>
//         </svg>`

//         const svgBuffer = Buffer.from(svgText);
//         sharp(req.file.path)
//         .composite([{input: svgBuffer, left: MoveLeft, top: MoveTop}])
//         .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
//           if (err) throw err;
//           res.download(__dirname + '/processed_images/'+ outputFilePath)
//           });
//   }
// }


function addText(InputText,req,res){
    if(req.file){
      var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);

       fs.mkdirSync(subDirectory);
     }

      let index = 9;
    //  outputFilePath = `${index}output.${format}`;
    const filePath = req.file.path;
  const processedDir = __dirname + '/processed_images';
  const processedFileName = 'processed_image' + `${index}output.${format}`;
  const processedFilePath = processedDir + '/' + processedFileName;

        const txtwidth = 400;
        const txtheight = 100;

        const svgText = `
        <svg width="${txtwidth}" height="${txtheight}" viewBox="0 0 100 100">
          <style>
            .title { fill:"purple" ; font-size:"20px"}
          </style>
          <text x="5%" y="40%" text-anchor="start" class="title">${InputText}</text>
        </svg>`

        const svgBuffer = Buffer.from(svgText);
        sharp(req.file.path)
        .composite([{input: svgBuffer, left: 10, top: 20}])
        // .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
        //   if (err) throw err;
        //   });
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          } else {
            console.log('addtext Image processed successfully');
            // send the processed image back to the client
            // res.sendFile(processedFilePath, (err) => {
            //   if (err) {
            //     console.error('Error sending file:', err);
            //     res.status(500).send('Error sending file');
            //   } else {
                console.log('File sent successfully');
                // delete the processed image from the server
                // fs.unlinkSync(processedFilePath);
              }
            });
          }
          // delete the uploaded image from the server
          // fs.unlinkSync(filePath);
        // });
  // }
}

function tintImage( redValue,greenValue,blueValue,req,res){
    if(req.file){
      var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {
       fs.mkdirSync(dir);

       fs.mkdirSync(subDirectory);
     }

      let index = 10;
    //  outputFilePath = `${index}output.${format}`;
    const filePath = req.file.path;
  const processedDir = __dirname + '/processed_images';
  const processedFileName = 'processed_image' + `${index}output.${format}`;
  const processedFilePath = processedDir + '/' + processedFileName;
        sharp(req.file.path)
        .tint({r: redValue, g: greenValue, b: blueValue})
        // .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
        //   if (err) throw err;
        //   });
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          } else {
            console.log('tintImage processed successfully');
            // send the processed image back to the client
            // res.sendFile(processedFilePath, (err) => {
            //   if (err) {
            //     console.error('Error sending file:', err);
            //     res.status(500).send('Error sending file');
            //   } else {
                console.log('File sent successfully');
                // delete the processed image from the server
                // fs.unlinkSync(processedFilePath);
              }
            });
          }
          // delete the uploaded image from the server
          // fs.unlinkSync(filePath);
        // });
  // }
}
