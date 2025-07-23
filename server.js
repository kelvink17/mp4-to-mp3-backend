// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const ffmpeg = require('fluent-ffmpeg');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const port = process.env.PORT || 3000;

// // Create uploads and output folders if not exist
// const uploadDir = path.join(__dirname, 'uploads');
// const outputDir = path.join(__dirname, 'output');
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
// if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
// });
// const upload = multer({ storage });

// // Middleware
// app.use(cors({
//   origin: 'https://mp4-to-mp3-front-end-nu.vercel.app', // ✅ allow frontend
//   methods: ['POST', 'OPTIONS'],
//   allowedHeaders: ['Content-Type']
// }));
// app.use(express.json());

// // Test route
// app.get('/', (req, res) => {
//   res.send('🎧 MP4 to MP3 Converter API is running!');
// });

// // Main convert route
// app.post('/convert', upload.single('video'), (req, res) => {
//   if (!req.file) {
//     console.log('❌ No file uploaded');
//     return res.status(400).send('No file uploaded.');
//   }

//   console.log('✅ File received:', req.file.originalname);
//   console.log('📍 File path:', req.file.path);

//   const inputPath = req.file.path;
//   const outputFileName = `${Date.now()}.mp3`;
//   const outputPath = path.join(outputDir, outputFileName);

//   ffmpeg(inputPath)
//     .audioCodec('libmp3lame')
//     .toFormat('mp3')
//     .on('error', (err) => {
//       console.error('❌ FFmpeg error:', err.message);
//       res.status(500).send('Error during conversion.');
//     })
//     .on('end', () => {
//       console.log('✅ Conversion finished:', outputPath);

//       res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
//       res.download(outputPath, outputFileName, (err) => {
//         if (err) {
//           console.error('❌ Download failed:', err.message);
//           res.status(500).send('Download failed.');
//         }

//         // Cleanup
//         fs.unlink(inputPath, () => {});
//         fs.unlink(outputPath, () => {});
//       });
//     })
//     .save(outputPath);
// });

// // Start server
// app.listen(port, () => {
//   console.log(`🚀 Server running on port ${port}`);
// });

// server/server.js
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

// ✅ Initialize app BEFORE using it
const app = express();

// ✅ CORS for Vercel frontend
app.use(cors({
  origin: 'http://localhost:3000/convert',
}));


// ✅ Create temp upload + output directories (safe for Render too)
const upload = multer({ dest: '/tmp/uploads' });
const outputDir = '/tmp/converted';
fs.mkdirSync(outputDir, { recursive: true });

app.post('/convert', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const inputPath = req.file.path;
  const outputPath = path.join(outputDir, `${req.file.filename}.mp3`);

  ffmpeg(inputPath)
    .toFormat('mp3')
    .on('end', () => {
      res.setHeader('Content-Disposition', 'attachment; filename=converted.mp3');
      res.download(outputPath, 'converted.mp3', () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', (err) => {
      console.error('Conversion error:', err.message);
      res.status(500).send('Conversion failed');
    })
    .save(outputPath);
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Backend is running');
});

app.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
});
