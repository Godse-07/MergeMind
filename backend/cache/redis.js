const { Redis } = require('ioredis');

const redis = new Redis();

redis.on("connect", () => {
    console.log("🟢🟢 Connected to Redis");
})

redis.on("error", (error) => {
    console.error("🔴🔴 Redis connection error:", error);
});

module.exports = redis;