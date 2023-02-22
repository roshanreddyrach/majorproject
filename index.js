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
     blurValue =parseInt(req.body.Bvalue)
     sharpenValue =parseInt(req.body.Svalue)
     rotateAngle =parseInt(req.body.angle)


     if (req.file){
          // console.log(req.file.path);


          if(isNaN(width) || isNaN(height)){

            var dimensions = imageSize(req.file.path);

            console.log(dimensions);

            width = parseInt(dimensions.width);
            height = parseInt(dimensions.height);

            processImage(width,height,blurValue,req,res);

          }
          else{

            processImage(width,height,blurValue,req,res);


          }
       }
})
app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});

function processImage(width,height,blurValue,req,res){


    outputFilePath = Date.now() + "output." + format;
    if (req.file) {
      sharp(req.file.path)
        .resize(width, height)
        .blur(blurValue)
        .sharpen(sharpenValue)
        .rotate(rotateAngle)
        .grayscale()
        .toFile(outputFilePath, (err, info) => {
          if (err) throw err;
          res.download(outputFilePath, (err) => {
            if (err) throw err;
            fs.unlinkSync(req.file.path);
            fs.unlinkSync(outputFilePath);
          });
        });
    }
  }
