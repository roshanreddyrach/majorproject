// installed modules
const express = require("express");
const multer = require('multer');
const sharp = require('sharp');
// const archiver = require("archiver");
const imageSize = require('image-size');
const AdmZip = require("adm-zip");

// in built modules
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');



const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// declared variables of all inputs
var format;
var width;
var height;
var blurValue;
var sharpenValue;
var rotateAngle;
var LCroppingSpace;
var CroppedWidth;
var CroppedHeight;
var TCroppingSpace;
var InputText;
// var TxtColor;
// var FontSize;   for future updates
// var MoveLeft;
// var MoveTop;
var redValue;
var greenValue;
var blueValue;


// to create the public directory
var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {

  fs.mkdirSync(dir);
  fs.mkdirSync(subDirectory);
}

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
  // providing acess to all permisions to user to public/uploads directory
  fs.chmod(__dirname + '/public/uploads', 0o777, (err) => {
    if (err) {
      console.error('Error changing directory permissions:', err);
    } else {
      console.log('public/uploads Directory permissions changed successfully');
    }
  });

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});

app.post('/processed_images',upload.single('file'),(req,res) => {

  const processedDir = __dirname + '/processed_images';

  // create directory for processed images if it doesn't exist
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir);
  }
  // providing acess to all permisions to user to processed_images directory
  fs.chmod(__dirname + '/processed_images', 0o777, (err) => {
    if (err) {
      console.error('Error changing directory permissions:', err);
    } else {
      console.log(' Processed_images Directory permissions changed successfully');
    }
  });

    // declaring and initializing the inputs
     format = req.body.format;
     width = parseInt(req.body.width);
     height = parseInt(req.body.height);
     blurValue = parseInt(req.body.Bvalue);
     sharpenValue = parseInt(req.body.Svalue);
     rotateAngle = parseInt(req.body.angle);

     const grayscale = req.body.grayscale;
     const flipflop = req.body.flipflop;

     const dummy = req.body.dummy;

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

    // logic for resizing
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

    // logic for grayscale
       if(req.file){

        if (grayscale === "true") {
          convertTograyscale(req, res);
          console.log(grayscale);
        }

    // logic for flipflop
        if (flipflop === "flip") {
          flipImage(req,res);
          console.log(flipflop);
        }

        if (flipflop === "flop") {
          flopImage(req,res);
          console.log(flipflop);
        }

    // logic for  blur
        if(blurValue){
          blurImage(blurValue,req,res);
          console.log(blurValue);
        }

    // logic for sharpen
        if(sharpenValue){
          sharpenImage(sharpenValue,req,res);
          console.log(sharpenValue);
        }

    // logic for rotate
        if(rotateAngle){
          rotateImage(rotateAngle,req,res);
          console.log(rotateAngle);
        }

    // logic for croping
        if(LCroppingSpace,CroppedWidth,CroppedHeight,TCroppingSpace){
          cropImage(LCroppingSpace,CroppedWidth,CroppedHeight,TCroppingSpace,req,res);
          console.log(LCroppingSpace,CroppedWidth,CroppedHeight,TCroppingSpace);
        }

        // if(InputText,TxtColor,FontSize,MoveLeft,MoveTop){
        //   addText(InputText,TxtColor,FontSize,MoveLeft,MoveTop,req,res);   for future updates
        //   console.log(InputText,TxtColor,FontSize,MoveLeft,MoveTop);
        // }

    // logic for adding text
        if(InputText){
          addText(InputText,req,res);
          console.log(InputText);
        }

    // logic for tinting
        if(redValue,greenValue,blueValue,req,res){
          tintImage( redValue,greenValue,blueValue,req,res);
          console.log(redValue,greenValue,blueValue)
        }

        // logic to process a dummy image so that we could use it as a channel to  send the imagePeocessed.html
        if (dummy === "true") {
          dummyImage(req,res);
          console.log(dummy);
        }
     }
   })

// download all processed images as a zip file
app.get('/download_all', (req, res) => {



  const processedDir = __dirname + '/processed_images';
  const zipFilePath = __dirname + '/processed_images.zip';

// send the zip file to the client for download
  res.download(zipFilePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
    } else {
      console.log('File download successful');

      // delete the zip file from the server after sending it to the client
      fs.unlinkSync(zipFilePath);

    // delete the processed_images directory after the zip file is downloaded
          if (fs.existsSync(processedDir)) {
               console.log('Deleting processed_images directory...');
               fs.rm(processedDir, { recursive: true }, (err) => {
          if (err) {
                console.error('Error deleting processed_images directory:', err);
          } else {
                console.log('processed_images directory deleted.');
              }
          });
        }
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
    const processedDir = __dirname + '/processed_images';
    const processedFileName = 'processed_image' + `${index}output.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
      sharp(req.file.path)
        .resize(width, height)
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          }
        });
      }
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
    const processedDir = __dirname + '/processed_images';
    const processedFileName ='processed_image' + `${index}output.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
      sharp(req.file.path)
      .grayscale()
      .toFile(processedFilePath, (err, info) => {
        if (err) {
          console.error('Error processing image:', err);
          res.status(500).send('Error processing image');
        }
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
    const processedDir = __dirname + '/processed_images';
    const processedFileName = 'processed_image' + `${index}output.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
      sharp(req.file.path)
      .flip()
      .toFile(processedFilePath, (err, info) => {
        if (err) {
          console.error('Error processing image:', err);
          res.status(500).send('Error processing image');
        }
      });
    }
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
    const processedDir = __dirname + '/processed_images';
    const processedFileName = 'processed_image' + `${index}output.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
      sharp(req.file.path)
      .flop()
      .toFile(processedFilePath, (err, info) => {
        if (err) {
          console.error('Error processing image:', err);
          res.status(500).send('Error processing image');
        }
      });
    }
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
    const processedDir = __dirname + '/processed_images';
    const processedFileName = 'processed_image' + `${index}output.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
       sharp(req.file.path)
      .blur(blurValue)
      .toFile(processedFilePath, (err, info) => {
            if (err) {
              console.error('Error processing image:', err);
              res.status(500).send('Error processing image');
            }
          });
        }
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
    const processedDir = __dirname + '/processed_images';
    const processedFileName = 'processed_image' + `${index}output.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
        sharp(req.file.path)
        .sharpen(sharpenValue)
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          }
        });
      }
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
    const processedDir = __dirname + '/processed_images';
    const processedFileName = 'processed_image' + `${index}output.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
        sharp(req.file.path)
        .rotate(rotateAngle)
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          }
        });
      }
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
    const processedDir = __dirname + '/processed_images';
    const processedFileName = 'processed_image' + `${index}output.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
        sharp(req.file.path)
        .extract({left: LCroppingSpace, width: CroppedWidth, height: CroppedHeight, top: TCroppingSpace})
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          }
        });
      }
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
        .toFile(processedFilePath, (err, info) => {
          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          }
        });
    }
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
    const processedDir = __dirname + '/processed_images';
    const processedFileName = 'processed_image' + `${index}output.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
        sharp(req.file.path)
        .tint({r: redValue, g: greenValue, b: blueValue})
        .toFile(processedFilePath, (err, info) => {

          if (err) {
            console.error('Error processing image:', err);
            res.status(500).send('Error processing image');
          }
        });
      }
    }


  function dummyImage(req,res){

    if(req.file){

      var dir = "public";
      var subDirectory = "public/uploads";

    if (!fs.existsSync(dir)) {

       fs.mkdirSync(dir);
       fs.mkdirSync(subDirectory);
     }

    const filePath = req.file.path;
    const processedDir = __dirname + '/processed_images';
    const processedFileName ='processed_image' + `dummyoutput.${format}`;
    const processedFilePath = processedDir + '/' + processedFileName;
      sharp(req.file.path)
      .grayscale()
      .toFile(processedFilePath, (err, info) => {

        if (err) {
          console.error('Error processing image:', err);
          res.status(500).send('Error processing image');
        }else {
          console.log('Image processed successfully');

          // creating the zip file
          createZipArchive();

          // send the processed image message back to the client
          res.sendFile(__dirname + '/imageProcessed.html', (err) => {

            if (err) {
              console.error('Error sending file:', err);
              res.status(500).send('Error sending file');
            } else {
              console.log('File sent successfully');

              // delete the processed image from the server
              fs.unlinkSync(processedFilePath);
            }
          });
        }
        // delete the uploaded image from the server
        fs.unlinkSync(filePath);
      });
  }
}

async function createZipArchive() {
  try {
    const processedDir = __dirname + '/processed_images';
    const zip = new AdmZip();
    const outputFile = "processed_images.zip";
    zip.addLocalFolder(processedDir);
    zip.writeZip(outputFile);
    console.log(`Created ${outputFile} successfully`);
  } catch (e) {
    console.log(`Something went wrong. ${e}`);
  }
}

