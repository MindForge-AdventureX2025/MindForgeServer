import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
  console.warn("Warning: REDIS_HOST or REDIS_PORT not set in environment variables. Using default values.");
}

const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT
  },
  password: process.env.REDIS_PASSWORD, // Add your Redis password to .env file
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis Cloud'));
redisClient.on('ready', () => console.log('Redis Client Ready'));
 
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
};

export default connectRedis;
// use connectRedis() in your functions
// e.g., (await connectRedis()).set('key', 'value');