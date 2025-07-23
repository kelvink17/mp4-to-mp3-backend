// server/server.js
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('file'), (req, res) => {
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
