// const express = require('express');
// const multer = require('multer');
// const ffmpeg = require('fluent-ffmpeg');
// const fs = require('fs');
// const cors = require('cors');
// const path = require('path');

// const app = express();

// app.use(cors({
//   origin: 'https://mp4-to-mp3-front-end-nu.vercel.app',
// }));

// const upload = multer({ dest: 'uploads/' });

// const outputDir = path.join(__dirname, 'converted');
// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir);
// }

// app.post('/convert', upload.single('video'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No file uploaded');
//   }

//   const inputPath = req.file.path;
//   const outputPath = path.join(outputDir, `${req.file.filename}.mp3`);

//   ffmpeg(inputPath)
//     .toFormat('mp3')
//     .on('end', () => {
//       res.setHeader('Content-Type', 'audio/mpeg');
//       res.setHeader('Content-Disposition', 'attachment; filename="converted.mp3"');

//       res.sendFile(path.resolve(outputPath), () => {
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//       });
//     })
//     .on('error', (err) => {
//       console.error('Conversion error:', err);
//       res.status(500).send('Conversion failed');
//     })
//     .save(outputPath);
// });

// app.listen(5000, () => {
//   console.log('✅ Server running on http://localhost:5000');
// });

 server/server.js
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const cors = require('cors');

app.use(cors({
  origin: 'https://http://mp4-to-mp3-front-end-nu.vercel.app/',
}));

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });
const path = require('path');

const outputDir = path.join(__dirname, 'converted');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}


app.post('/convert', upload.single('video'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `converted/${req.file.filename}.mp3`;

  ffmpeg(inputPath)
    .toFormat('mp3')
    .on('end', () => {
      res.download(outputPath, 'converted.mp3', () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', (err) => {
      console.error('Conversion error:', err);
      res.status(500).send('Conversion failed');
    })
    .save(outputPath);
});

app.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
});
