import 'dotenv/config';
import app from './app';

const PORT = process.env['PORT'];

app.listen(PORT, () => {
  console.warn(`Backend server running on http://localhost:${PORT}`);
  console.warn(`Health check: http://localhost:${PORT}/health`);
  console.warn(`Ready for frontend connections from port 3001`);
});
