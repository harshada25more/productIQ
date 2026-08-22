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

// Enable CORS for all origins and headers (needed for Vercel -> Render)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

app.use(express.json());

// Root Health & Service API
app.get("/", (req, res) => {
  res.json({
    name: "ProductIQ API",
    status: "online",
    message: "ProductIQ AI Product Intelligence Backend is running!",
    version: "2.0.0",
  });
});

// Health checks
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

// Dashboard stats endpoints
app.get("/dashboard/stats", getDashboardStats);
app.get("/api/dashboard/stats", getDashboardStats);

// Catalog health endpoints
app.get("/catalog-health", getCatalogHealth);
app.get("/api/catalog-health", getCatalogHealth);

// Main API routes (mounted on both /api/... and /... for URL robustness)
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/products", productRoutes);
app.use("/products", productRoutes);

app.use("/api/ai", aiRoutes);
app.use("/ai", aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Server Error]:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;