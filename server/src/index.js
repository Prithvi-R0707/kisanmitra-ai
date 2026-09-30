import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import farmerRoutes from './routes/farmerRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import recordsRoutes from './routes/recordsRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import syncRoutes from './routes/syncRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/farmer', farmerRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/sync', syncRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'KisanMitraAI Backend', timestamp: new Date() });
});

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🌾 KisanMitraAI Server running on http://localhost:${PORT}`);
  });
});
