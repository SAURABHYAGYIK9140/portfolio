import app from './app';
import { config } from './config/environment';

const HOST = '0.0.0.0';
const PORT = config.port;

const server = app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Saurabh Yagyik Portfolio Platform Running`);
  console.log(`📡 URL: http://${HOST}:${PORT}`);
  console.log(`📄 Resume: http://${HOST}:${PORT}/resume`);
  console.log(`📬 Inquiries: http://${HOST}:${PORT}/inquiries`);
  console.log(`🔗 API Base: http://${HOST}:${PORT}${config.apiPrefix}/portfolio`);
  console.log(`🩺 Health: http://${HOST}:${PORT}/health`);
  console.log(`=======================================================`);
});

const handleShutdown = (sig: string) => {
  console.log(`\n🛑 Received ${sig}. Graceful shutdown...`);
  server.close(() => {
    console.log('⚡ Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
