require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

const redisConfig = isProd
  ? {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      tls: {
        servername: process.env.REDIS_HOST,
        rejectUnauthorized: false,
      },

      maxRetriesPerRequest: null,
      reconnectOnError: (err) => {
        console.error("🔁 Redis Cloud reconnecting after error:", err.message);
        return true;
      },
      retryStrategy(times) {
        const delay = Math.min(times * 200, 5000);
        console.log(`⏳ Reconnecting to Redis Cloud in ${delay}ms`);
        return delay;
      },
    }
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 5000);
        console.log(`⏳ Reconnecting to Local Redis in ${delay}ms`);
        return delay;
      },
    };

module.exports = redisConfig;
