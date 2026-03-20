const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/animals',      require('./routes/animals'));
app.use('/api/cattle',       require('./routes/cattle'));
app.use('/api/breeding',     require('./routes/breeding'));
app.use('/api/feeding',      require('./routes/feeding'));
app.use('/api/installments', require('./routes/installments'));
app.use('/api/vouchers',     require('./routes/vouchers'));
app.use('/api/progress',     require('./routes/progress'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'FarmFusion API running 🌾', env: process.env.NODE_ENV }));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// MongoDB + Start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000} in ${process.env.NODE_ENV || 'development'} mode`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });