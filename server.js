// server/server.js
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ Correct CORS config
app.use(cors({
  origin: 'https://mp4-to-mp3-front-end-nu.vercel.app',
}));

// ✅ Set upload location
const upload = multer({ dest: 'uploads/' });

// ✅ Ensure converted directory exists
const outputDir = path.join(__dirname, 'converted');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// ✅ Conversion endpoint
app.post('/convert', upload.single('video'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `${req.file.filename}.mp3`);

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

// ✅ Start server
app.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
});
