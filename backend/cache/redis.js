const { Redis } = require('ioredis');
const redisConfig = require('../config/redisConfig');

const redis = new Redis(redisConfig);

redis.on("connect", () => {
    console.log("🟢🟢 Connected to Redis");
})

redis.on("error", (error) => {
    console.error("🔴🔴 Redis connection error:", error);
});

module.exports = redis;