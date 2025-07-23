const express = require('express');
const multer = require('multer');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS - Allow frontend from Vercel
app.use(cors({
  origin: 'https://mp4-to-mp3-front-end-nu.vercel.app',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// ✅ Safe paths for Render (/tmp)
const uploadDir = '/tmp/uploads';
const outputDir = '/tmp/converted';
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

// ✅ Multer setup (limit: 100MB)
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// ✅ Conversion route
app.post('/convert', upload.single('video'), (req, res) => {
  if (!req.file) {
    console.log('❌ No file uploaded');
    return res.status(400).send('No file uploaded.');
  }

  // ✅ These will now run if file exists
  console.log('✅ File received:', req.file.originalname);
  console.log('📍 File path:', req.file.path);

  const inputPath = req.file.path;
  const outputFileName = `${Date.now()}.mp3`;
  const outputPath = path.join(outputDir, outputFileName);

  ffmpeg(inputPath)
    .audioCodec('libmp3lame')
    .toFormat('mp3')
    .on('error', (err) => {
      console.error('FFmpeg error:', err.message);
      res.status(500).send('Error during conversion.');
    })
    .on('end', () => {
      console.log('✅ Conversion finished:', outputPath);
      res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);

      res.download(outputPath, outputFileName, (err) => {
        if (err) {
          console.error('Download failed:', err.message);
          res.status(500).send('Download failed.');
        }

        fs.unlink(inputPath, () => {});
        fs.unlink(outputPath, () => {});
      });
    })
    .save(outputPath);
});


// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ MP4 to MP3 Converter backend is running.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is live on port ${PORT}`);
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
