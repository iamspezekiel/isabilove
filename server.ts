import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleGenerateMessage, handleDispatchWebhook } from './server/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API Endpoints
app.post('/api/gemini/generate-message', handleGenerateMessage);
app.post('/api/notifications/dispatch-webhook', handleDispatchWebhook);

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`IsabiLove production server running on port ${port}`);
});
