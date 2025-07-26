import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  socket: {
    host: 'redis-16064.c9.us-east-1-4.ec2.redns.redis-cloud.com',
    port: 16064
  },
  password: process.env.REDIS_PASSWORD, // Add your Redis password to .env file
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis Cloud'));
redisClient.on('ready', () => console.log('Redis Client Ready'));

await redisClient.connect();

export default redisClient;
// use redisClient in your functions
// e.g., redisClient.set('key', 'value');