const app = require("./app");
const { connectDB, getDbStatus } = require("./config/db");
const seedDatabase = require("./config/seed");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const isMongoUp = await connectDB();
    if (isMongoUp) {
      await seedDatabase();
    } else {
      console.log("[Server] Running with In-Memory / Resilient dataset store.");
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` ProductIQ Enterprise Backend: http://localhost:${PORT}`);
      console.log(` API Endpoint: http://localhost:${PORT}/api`);
      console.log(` Storage Mode: ${isMongoUp ? "MongoDB Database" : "Resilient In-Memory"}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
  }
};

startServer();