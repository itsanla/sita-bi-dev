import 'dotenv/config';
import app from './app';
import { createServer } from 'http';
import { initSocket } from './socket';
import { whatsappService } from './services/whatsapp.service';

const PORT = process.env['PORT'] ?? 3000;

const httpServer = createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// Initialize WhatsApp Service
whatsappService.initialize().catch((err: unknown) => {
  console.error('Failed to initialize WhatsApp service:', err);
});

httpServer.listen(PORT, () => {
  console.warn(`Backend server running on http://localhost:${PORT}`);
  console.warn(`Health check: http://localhost:${PORT}/health`);
  console.warn(`Ready for frontend connections from port 3001`);
});
