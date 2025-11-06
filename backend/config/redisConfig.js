require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

const redisConfig = isProd
  ? {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      tls: { servername: process.env.REDIS_HOST },
    }
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
    };

module.exports = redisConfig;
