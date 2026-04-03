const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const isTLS = redisUrl.startsWith('rediss://'); // Upstash uses rediss://, local uses redis://

const redisClient = redis.createClient({
  url: redisUrl,
  socket: isTLS ? { tls: true, rejectUnauthorized: false } : {}
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Connected...'));

// Connect immediately
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
       console.error('Could not connect to Redis:', err);
    }
})();

module.exports = redisClient;
