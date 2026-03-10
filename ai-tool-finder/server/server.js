import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cron from 'node-cron';
import searchRoutes from './routes/searchRoutes.js';
import toolRoutes from './routes/toolRoutes.js';
import { updateTools } from './cron/updateTools.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/search', searchRoutes);
app.use('/api/tools', toolRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-tool-finder';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });

    cron.schedule('0 */12 * * *', async () => {
      const count = await updateTools();
      console.log(`Updated ${count} tools from scraper`);
    });
  })
  .catch((error) => {
    console.error('Mongo connection failed', error);
    process.exit(1);
  });
