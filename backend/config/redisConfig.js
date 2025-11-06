const isProd = process.env.NODE_ENV === "production";

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: isProd ? {} : undefined,
};

module.exports = redisConfig;