import { createClient } from "redis";

const redisClient = createClient();

redisClient.on('error', (err) => console.error('Redis Client Error', err));
await redisClient.connect();

export default redisClient;
// use redisClient in your functions
// e.g., redisClient.set('key', 'value');