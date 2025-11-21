import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { createClient } from "redis";
import app from "./app.js";

import { swaggerServe, swaggerUiMiddleware } from "./swagger.js";

app.use("/docs", swaggerServe, swaggerUiMiddleware);


const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Redis
    const redis = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_PORT
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
