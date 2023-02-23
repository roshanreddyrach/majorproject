const express = require("express");
const multer = require('multer');
const sharp = require('sharp');



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

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post('/processed_images',upload.single('file'),(req,res) => {

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

        if(InputText,TxtColor,FontSize,MoveLeft,MoveTop){
          addText(InputText,TxtColor,FontSize,MoveLeft,MoveTop,req,res);
          console.log(InputText,TxtColor,FontSize,MoveLeft,MoveTop);
        }



       }
})
app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});

function resizeImage(width,height,req,res){

    if (req.file) {
    let index = 1;
      outputFilePath = `${index}output.${format}`;
      sharp(req.file.path)
        .resize(width, height)
        .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
          if (err) throw err;
          res.download(__dirname + '/processed_images/'+ outputFilePath)
        });
    }
  }


  function convertTograyscale(req,res){
    if(req.file){
    let index = 2;
   outputFilePath = `${index}output.${format}`;
      sharp(req.file.path)
      .grayscale()
      .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
        if (err) throw err;
        res.download(__dirname + '/processed_images/'+ outputFilePath)
        });
    }
  }

  function flipImage(req,res){
    if(req.file){
    let index = 3;
   outputFilePath = `${index}output.${format}`;
      sharp(req.file.path)
      .flip()
      .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
        if (err) throw err;
        res.download(__dirname + '/processed_images/'+ outputFilePath)
        });
    }
  }
  function flopImage(req,res){
    if(req.file){
    let index = 4;
   outputFilePath = `${index}output.${format}`;
      sharp(req.file.path)
      .flop()
      .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
        if (err) throw err;
        res.download(__dirname + '/processed_images/'+ outputFilePath)
        });
    }
  }

  function blurImage(blurValue,req,res){

    if(req.file){
      if(req.file){
        let index = 5;
       outputFilePath = `${index}output.${format}`;
          sharp(req.file.path)
          .blur(blurValue)
          .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
            if (err) throw err;
            res.download(__dirname + '/processed_images/'+ outputFilePath)
            });
    }
  }
}

function sharpenImage(sharpenValue,req,res){

  if(req.file){
    if(req.file){
      let index = 6;
     outputFilePath = `${index}output.${format}`;
        sharp(req.file.path)
        .sharpen(sharpenValue)
        .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
          if (err) throw err;
          res.download(__dirname + '/processed_images/'+ outputFilePath)
          });
  }
}
}

function rotateImage(rotateAngle,req,res){

  if(req.file){
    if(req.file){
      let index = 7;
     outputFilePath = `${index}output.${format}`;
        sharp(req.file.path)
        .rotate(rotateAngle)
        .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
          if (err) throw err;
          res.download(__dirname + '/processed_images/'+ outputFilePath)
          });
  }
}
}


function cropImage(LCroppingSpace,CroppedWidth,CroppedHeight,TCroppingSpace,req,res){
  if(req.file){
    if(req.file){
      let index = 8;
     outputFilePath = `${index}output.${format}`;
        sharp(req.file.path)
        .extract({left: LCroppingSpace, width: CroppedWidth, height: CroppedHeight, top: TCroppingSpace})
        .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
          if (err) throw err;
          res.download(__dirname + '/processed_images/'+ outputFilePath)
          });
  }
}
}


function addText(InputText,TxtColor,FontSize,MoveLeft,MoveTop,req,res){
  if(req.file){
    if(req.file){
      let index = 9;
     outputFilePath = `${index}output.${format}`;

        const txtwidth = 400;
        const txtheight = 100;

        const svgText = `
        <svg width="${txtwidth}" height="${txtheight}" viewBox="0 0 100 100">
          <style>
            .title { fill:"${TxtColor}" ; font-size:"${FontSize}px"}
          </style>
          <text x="5%" y="40%" text-anchor="start" class="title">${InputText}</text>
        </svg>`

        const svgBuffer = Buffer.from(svgText);
        sharp(req.file.path)
        .composite([{input: svgBuffer, left: MoveLeft, top: MoveTop}])
        .toFile(__dirname + '/processed_images/'+ outputFilePath , (err, info) => {
          if (err) throw err;
          res.download(__dirname + '/processed_images/'+ outputFilePath)
          });
  }
}
}

