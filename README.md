# Agent Prompt Manager

A web-based tool for managing AI agent prompts with version history tracking.

## Features

- 📝 Edit agent prompts via web interface
- 📁 Manage multiple prompt files (.txt, .md)
- 🕐 Automatic version history tracking
- 🐳 Docker containerized deployment
- 🔄 Real-time file synchronization

## Quick Start

```bash
# Start with Docker Compose
docker-compose up -d

# Access web interface
http://localhost:5173

# API endpoint
http://localhost:3000
```

## Project Structure

```
agent-prompt-manager/
├── backend/          # Node.js API server
├── frontend/         # Vite + React web app
├── prompts/         # Agent prompt files (volume mounted)
├── history/         # Version history (volume mounted)
└── docker-compose.yml
```

## Configuration

### Environment Variables

**Backend:**
- `PORT`: API server port (default: 3000)
- `PROMPTS_DIR`: Prompts directory path
- `HISTORY_DIR`: History directory path

**Frontend:**
- `VITE_API_URL`: API server URL

## Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## License

MIT
