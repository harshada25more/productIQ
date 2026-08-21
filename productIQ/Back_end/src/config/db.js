const mongoose = require("mongoose");

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/productiq";
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB offline (${error.message}). Running in Resilient In-Memory Storage mode.`);
    return false;
  }
};

const getDbStatus = () => isMongoConnected;

module.exports = { connectDB, getDbStatus };