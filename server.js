const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();

// ── Create uploads folder if it doesn't exist ──────────────────────
const uploadsDir = path.join(__dirname, 'uploads', 'videos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads/videos folder');
}

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// ── Serve uploaded videos as static files ──────────────────────────
// Videos will be accessible at: http://yourserver.com/uploads/videos/filename.mp4
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'FarmFusion API running 🌾',
    env: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'
  });
});

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/animals',      require('./routes/animals'));
app.use('/api/cattle',       require('./routes/cattle'));
app.use('/api/breeding',     require('./routes/breeding'));
app.use('/api/feeding',      require('./routes/feeding'));
app.use('/api/installments', require('./routes/installments'));
app.use('/api/vouchers',     require('./routes/vouchers'));
app.use('/api/progress',     require('./routes/progress'));
app.use('/api/enquiries',    require('./routes/enquiries'));
app.use('/api/vaccinations', require('./routes/vaccinations'));

// ── MongoDB + Start server ─────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });
