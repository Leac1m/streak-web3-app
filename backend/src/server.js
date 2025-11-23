import mongoose from "mongoose";
import { createClient } from "redis";
import { env } from "./config/env.js";
import app from "./app.js";

import { swaggerServe, swaggerUiMiddleware } from "./swagger.js";

const PORT = env.port;

app.use("/", swaggerServe, swaggerUiMiddleware);

(async () => {
  try {
    // MongoDB
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");

    // Redis
    const redis = createClient({
      username: env.redis.username,
      password: env.redis.password,
      socket: {
        host: env.redis.url,
        port: env.redis.port
      }
    });


    redis.on("error", (err) => console.log("Redis Error:", err));

    await redis.connect();
    console.log("Redis connected");

    global.redis = redis; // make redis available anywhere

    // Start server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
})();
