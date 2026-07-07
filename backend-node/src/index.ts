import dotenv from 'dotenv';
import app from './app';
import logger from './logger';
import net from 'net';

dotenv.config();

const port = Number(process.env.PORT) || 4000;

async function startServer(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      console.log(`Server running on port ${port}`);
      resolve();
    });
    server.on('error', (err: any) => {
      server.close?.();
      reject(err);
    });
  });
}

(async () => {
  try {
    await startServer(port);
  } catch (err: any) {
    logger.error(`Cannot bind backend to port ${port}: ${err?.message ?? err}`);
    console.error(`Cannot bind backend to port ${port}: ${err?.message ?? err}`);
    process.exit(1);
  }
})();
