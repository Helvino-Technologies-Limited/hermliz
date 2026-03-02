require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { syncDatabase } = require('./models');
const { startScheduler } = require('./utils/scheduler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS - allow Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://hermliz.vercel.app',
    /\.vercel\.app$/,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/installments', require('./routes/installments'));
app.use('/api/underwriters', require('./routes/underwriters'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Hermliz IBMS',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Hermliz IBMS API is running', version: '1.0.0' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await syncDatabase();
  startScheduler();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Hermliz IBMS Backend running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health\n`);
  });
};

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
