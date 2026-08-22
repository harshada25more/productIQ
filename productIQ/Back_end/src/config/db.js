const mongoose = require("mongoose");

let isMongoConnected = false;

// CRITICAL: Disable query buffering so Mongoose never hangs when MongoDB is offline
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", false);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes("127.0.0.1") || uri.includes("localhost")) {
    console.log("[Database] No cloud MONGO_URI configured. Running in Resilient In-Memory Storage mode.");
    isMongoConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Atlas connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB connection failed (${error.message}). Running in Resilient In-Memory Storage mode.`);
    return false;
  }
};

const getDbStatus = () => isMongoConnected;

module.exports = { connectDB, getDbStatus };