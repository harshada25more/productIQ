const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const aiRoutes = require("./routes/aiRoutes");
const {
  getDashboardStats,
  getCatalogHealth,
} = require("./controllers/productController");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Root & Health
app.get("/", (req, res) => {
  res.json({
    name: "ProductIQ API",
    status: "online",
    message: "ProductIQ AI Product Intelligence Backend is running!",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "ProductIQ Node.js Backend",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "ProductIQ Node.js Backend",
    timestamp: new Date().toISOString(),
  });
});

// Top-level convenient endpoints for dashboard & catalog health
app.get("/dashboard/stats", getDashboardStats);
app.get("/api/dashboard/stats", getDashboardStats);
app.get("/catalog-health", getCatalogHealth);
app.get("/api/catalog-health", getCatalogHealth);

// Main Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/products", productRoutes); // Compatibility for direct /products paths
app.use("/api/ai", aiRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;