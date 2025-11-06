require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
  ...(isProd ? { tls: { rejectUnauthorized: false } } : {}),
};

module.exports = redisConfig;
