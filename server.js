const express = require('express');
const multer = require('multer');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow your Vercel frontend to access the server
app.use(cors({
  origin: 'https://mp4-to-mp3-front-end-nu.vercel.app',
  methods: ['POST'],
  credentials: true
}));

// Set temporary upload and output folders (Render requires /tmp)
const uploadDir = '/tmp/uploads';
const outputDir = '/tmp/converted';

// Ensure both directories exist
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

// Set up multer to store uploaded files
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Conversion route
app.post('/convert', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  console.log('File received:', req.file);

  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `${Date.now()}.mp3`);

  ffmpeg(inputPath)
    .toFormat('mp3')
    .on('error', (err) => {
      console.error('FFmpeg error:', err.message);
      res.status(500).send('Error converting file.');
    })
    .on('end', () => {
      console.log('Conversion complete:', outputPath);
      res.download(outputPath, 'output.mp3', (err) => {
        if (err) {
          console.error('Download error:', err.message);
          res.status(500).send('Failed to send file.');
        }

        // Cleanup: Delete both input and output after sending
        fs.unlink(inputPath, () => {});
        fs.unlink(outputPath, () => {});
      });
    })
    .save(outputPath);
});

app.get('/', (req, res) => {
  res.send('MP4 to MP3 Converter backend is running ✅');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


 // server/server.js
// const express = require('express');
// const multer = require('multer');
// const ffmpeg = require('fluent-ffmpeg');
// const fs = require('fs');
// const cors = require('cors');

// app.use(cors({
//   origin: 'https://http://mp4-to-mp3-front-end-nu.vercel.app/',
// }));

// const app = express();
// app.use(cors());

// const upload = multer({ dest: 'uploads/' });
// const path = require('path');

// const outputDir = path.join(__dirname, 'converted');
// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir);
// }


// app.post('/convert', upload.single('video'), (req, res) => {
//   const inputPath = req.file.path;
//   const outputPath = `converted/${req.file.filename}.mp3`;

//   ffmpeg(inputPath)
//     .toFormat('mp3')
//     .on('end', () => {
//       res.download(outputPath, 'converted.mp3', () => {
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
