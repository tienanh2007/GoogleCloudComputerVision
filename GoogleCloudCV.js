const vision = require('@google-cloud/vision');
const fs = require('fs');

// Creates a client
const client = new vision.ImageAnnotatorClient();


/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
// const fileName = 'Local image file, e.g. /path/to/image.png';

// function faceDetection(file, callback) {
//
//   client
//     .faceDetection('../headshot.jpg')
//     .then(results => {
//       const faces = results[0].faceAnnotations;
//       console.log('Faces:');
//       faces.forEach((face, i) => {
//         console.log(`  Face #${i + 1}:`);
//         console.log(`    Joy: ${face.joyLikelihood}`);
//         console.log(`    Anger: ${face.angerLikelihood}`);
//         console.log(`    Sorrow: ${face.sorrowLikelihood}`);
//         console.log(`    Surprise: ${face.surpriseLikelihood}`);
//         console.log(face.boundingPoly)
//       });
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });
// }

function detectFaces(inputFile, callback) {
  // Make a call to the Vision API to detect the faces
  const request = {image: {source: {filename: inputFile}}};
  client
    .faceDetection(request)
    .then(results => {
      const faces = results[0].faceAnnotations;
      var numFaces = faces.length;
      console.log('Found ' + numFaces + (numFaces === 1 ? ' face' : ' faces'));
      callback(null, faces);
    })
    .catch(err => {
      console.error('ERROR:', err);
      callback(err);
    });
}

function highlightFaces(inputFile, faces, outputFile, Canvas, callback) {
  fs.readFile(inputFile, (err, image) => {
    if (err) {
      return callback(err);
    }

    var Image = Canvas.Image;
    // Open the original image into a canvas
    var img = new Image();
    img.src = image;
    var canvas = new Canvas(img.width, img.height);
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height);

    // Now draw boxes around all the faces
    context.strokeStyle = 'rgba(0,255,0,0.8)';
    context.lineWidth = '5';

    faces.forEach(face => {
      context.beginPath();
      let origX = 0;
      let origY = 0;
      face.boundingPoly.vertices.forEach((bounds, i) => {
        if (i === 0) {
          origX = bounds.x;
          origY = bounds.y;
        }
        context.lineTo(bounds.x, bounds.y);
      });
      context.lineTo(origX, origY);
      context.stroke();
    });

    // Write the result to a file
    console.log('Writing to file ' + outputFile);
    var writeStream = fs.createWriteStream(outputFile);
    var pngStream = canvas.pngStream();

    pngStream.on('data', chunk => {
      writeStream.write(chunk);
    });
    pngStream.on('error', console.log);
    pngStream.on('end', callback);
  });
}
function main(inputFile, outputFile, Canvas, callback) {
  console.log(inputFile, outputFile)
  detectFaces(inputFile, (err, faces) => {
    if (err) {
      return callback(err);
    }

    console.log('Highlighting...');
    highlightFaces(inputFile, faces, outputFile, Canvas, err => {
      if (err) {
        return callback(err);
      }
      console.log('Finished!');
      callback(null, faces);
    });
  });
}

exports.main = main;

if (module === require.main) {
  if (process.argv.length < 3) {
    console.log('Usage: node faceDetection <inputFile> [outputFile]');
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
  var inputFile = process.argv[2];
  var outputFile = process.argv[3] || 'out';
  inputFiles = fs.readdirSync(inputFile)
  console.log(inputFiles)
  for(i = 0 ; i < inputFile.length; i++)
    exports.main(inputFile + '/' + inputFiles[i], outputFile + '/' + inputFiles[i], require('canvas'), console.log);
}
