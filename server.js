const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// CORS setup: allow both dev and production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://mp4-to-mp3-front-end-nu.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  }
}));

// Ensure 'uploads' and 'outputs' folders exist
const uploadPath = path.join(__dirname, 'uploads');
const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Convert MP4 to MP3
app.post('/convert', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const inputPath = req.file.path;
  const outputFileName = Date.now() + '.mp3';
  const fullOutputPath = path.join(outputPath, outputFileName);

  const command = `ffmpeg -i "${inputPath}" -vn -ar 44100 -ac 2 -b:a 192k "${fullOutputPath}"`;

  console.log(`Running: ${command}`);

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error('FFmpeg error:', stderr);
      return res.status(500).json({ error: 'Conversion failed' });
    }

    res.download(fullOutputPath, outputFileName, (downloadErr) => {
      if (downloadErr) {
        console.error('Download error:', downloadErr);
      }

      // Cleanup
      try {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(fullOutputPath);
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr);
      }
    });
  });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
