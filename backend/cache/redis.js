const { Redis } = require("ioredis");
const redisConfig = require("../config/redisConfig");

const isProd = process.env.NODE_ENV === "production";

let redis;

if (isProd) {
  const connectionUrl = `rediss://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
  redis = new Redis(connectionUrl, redisConfig);
  console.log("🔒 Using Redis Cloud (TLS enabled)");
} else {
  redis = new Redis(redisConfig);
  console.log("🧩 Using Local Redis (no TLS)");
}

redis.on("connect", () => {
  console.log(`🟢 Connected to Redis (${isProd ? "Cloud" : "Local"})`);
});

redis.on("ready", () => console.log("✅ Redis connection ready"));
redis.on("error", (error) =>
  console.error("🔴 Redis connection error:", error)
);
redis.on("end", () => console.warn("⚠️ Redis connection closed"));

module.exports = redis;
