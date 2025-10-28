import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const router = express.Router();

const PROMPTS_DIR = process.env.PROMPTS_DIR || './prompts';
const HISTORY_DIR = process.env.HISTORY_DIR || './history';

// Ensure directories exist
async function ensureDirectories() {
  if (!existsSync(PROMPTS_DIR)) {
    await fs.mkdir(PROMPTS_DIR, { recursive: true });
  }
  if (!existsSync(HISTORY_DIR)) {
    await fs.mkdir(HISTORY_DIR, { recursive: true });
  }
}

ensureDirectories();

// Get all prompt files
router.get('/', async (req, res) => {
  try {
    const files = await fs.readdir(PROMPTS_DIR);
    const promptFiles = files.filter(file =>
      file.endsWith('.txt') || file.endsWith('.md')
    );

    const prompts = await Promise.all(
      promptFiles.map(async (filename) => {
        const filePath = path.join(PROMPTS_DIR, filename);
        const stats = await fs.stat(filePath);
        return {
          filename,
          modifiedAt: stats.mtime,
          size: stats.size
        };
      })
    );

    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific prompt content
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(PROMPTS_DIR, filename);

    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ filename, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save prompt (update existing file + create history)
router.put('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;

    if (!content && content !== '') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const filePath = path.join(PROMPTS_DIR, filename);

    // Save to prompts directory
    await fs.writeFile(filePath, content, 'utf-8');

    // Create history backup
    const timestamp = new Date().toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '')
      .replace('T', '-');

    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const historyDir = path.join(HISTORY_DIR, filename);

    // Ensure history subdirectory exists
    if (!existsSync(historyDir)) {
      await fs.mkdir(historyDir, { recursive: true });
    }

    const historyFilename = `${basename}-${timestamp}${ext}`;
    const historyPath = path.join(historyDir, historyFilename);

    await fs.writeFile(historyPath, content, 'utf-8');

    res.json({
      success: true,
      filename,
      historyFile: historyFilename
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get history tree structure
router.get('/history/tree', async (req, res) => {
  try {
    if (!existsSync(HISTORY_DIR)) {
      return res.json([]);
    }

    const folders = await fs.readdir(HISTORY_DIR);
    const tree = await Promise.all(
      folders.map(async (folder) => {
        const folderPath = path.join(HISTORY_DIR, folder);
        const stats = await fs.stat(folderPath);

        if (!stats.isDirectory()) return null;

        const files = await fs.readdir(folderPath);
        const historyFiles = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(folderPath, file);
            const fileStats = await fs.stat(filePath);
            return {
              filename: file,
              createdAt: fileStats.birthtime,
              size: fileStats.size
            };
          })
        );

        // Sort by creation time (newest first)
        historyFiles.sort((a, b) => b.createdAt - a.createdAt);

        return {
          folder,
          files: historyFiles
        };
      })
    );

    res.json(tree.filter(item => item !== null));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific history file content
router.get('/history/:folder/:filename', async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(HISTORY_DIR, folder, filename);

    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'History file not found' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ folder, filename, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
