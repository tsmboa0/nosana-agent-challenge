import dotenv from 'dotenv';
import { PrismaClient } from '../generated/prisma';
import { telegramBot } from './telegram';

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
}); 

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
async function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  
  try {
    await telegramBot.stop();
    await prisma.$disconnect();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Main application startup
async function startApp() {
  try {
    console.log('🚀 Starting Solvestor...');
    
    // Test database connection
    
    
    // Start Telegram bot
    await telegramBot.start();
    console.log('✅ Telegram bot started');
    
    console.log('🎉 Solvestor is running!');
    console.log('📱 Telegram bot is ready to receive messages');
    console.log('💾 Database is connected and ready');
    
  } catch (error) {
    console.error('❌ Failed to start Solvestor:', error);
    process.exit(1);
  }
  await prisma.$connect();
  console.log('✅ Database connected');
}

// Start the application
startApp();
