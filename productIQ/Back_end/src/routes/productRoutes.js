const express = require("express");
const router = express.Router();

const {
  getProducts,
  searchProducts,
  getProductById,
  createProduct,
  enrichProduct,
  reEnrichProduct,
  batchEnrichProducts,
  exportProducts,
  updateProduct,
  deleteProduct,
  getReviewProducts,
  approveProduct,
  rejectProduct,
  batchApproveProducts,
  batchDeleteProducts,
  getDashboardStats,
  getCatalogHealth,
  reseedProducts,
  autoSanitizeCatalog,
} = require("../controllers/productController");

const { optionalProtect } = require("../middleware/authMiddleware");

// Specific routes first to avoid catching by /:id
router.get("/search", searchProducts);
router.get("/review", getReviewProducts);
router.get("/export", exportProducts);
router.get("/stats/dashboard", getDashboardStats);
router.get("/health/catalog", getCatalogHealth);

router.post("/enrich", optionalProtect, enrichProduct);
router.post("/batch-enrich", optionalProtect, batchEnrichProducts);
router.post("/batch-approve", optionalProtect, batchApproveProducts);
router.post("/batch-delete", optionalProtect, batchDeleteProducts);
router.post("/sanitize", optionalProtect, autoSanitizeCatalog);
router.post("/reseed", optionalProtect, reseedProducts);

// Root products route
router.get("/", getProducts);
router.post("/", optionalProtect, createProduct);

// By ID routes
router.get("/:id", getProductById);
router.put("/:id", optionalProtect, updateProduct);
router.delete("/:id", optionalProtect, deleteProduct);
router.post("/:id/enrich", optionalProtect, reEnrichProduct);
router.post("/:id/approve", optionalProtect, approveProduct);
router.post("/:id/reject", optionalProtect, rejectProduct);

module.exports = router;