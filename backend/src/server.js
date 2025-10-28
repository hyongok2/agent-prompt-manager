import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';
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
  console.log('='.repeat(60));
  console.log(`🚀 Agent Prompt Manager API v1.0.0`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log('='.repeat(60));

  const promptsDir = process.env.PROMPTS_DIR || './prompts';
  const historyDir = process.env.HISTORY_DIR || './history';

  console.log(`\n📁 Configuration:`);
  console.log(`   PROMPTS_DIR: ${promptsDir}`);
  console.log(`   HISTORY_DIR: ${historyDir}`);

  console.log(`\n🔍 Directory Status:`);
  console.log(`   Prompts exists: ${existsSync(promptsDir)}`);
  console.log(`   History exists: ${existsSync(historyDir)}`);

  if (existsSync(promptsDir)) {
    try {
      const files = readdirSync(promptsDir);
      console.log(`\n📄 Files in prompts directory (${files.length}):`);
      files.forEach(file => {
        console.log(`   - ${file}`);
      });
    } catch (error) {
      console.error(`\n❌ Error reading prompts directory:`, error.message);
    }
  } else {
    console.log(`\n⚠️  WARNING: Prompts directory does not exist!`);
  }

  console.log('\n' + '='.repeat(60) + '\n');
});
