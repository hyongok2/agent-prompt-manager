import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import promptRoutes from './routes/prompts.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow all origins
app.use(express.json());

// Routes
app.use('/api/prompts', promptRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Agent Prompt Manager API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Agent Prompt Manager API running on port ${PORT}`);
  console.log(`📁 Prompts directory: ${process.env.PROMPTS_DIR || './prompts'}`);
  console.log(`📜 History directory: ${process.env.HISTORY_DIR || './history'}`);
});
