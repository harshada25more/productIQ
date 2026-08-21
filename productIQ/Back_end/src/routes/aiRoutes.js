const express = require("express");
const router = express.Router();

const {
  analyzeProduct,
  batchAnalyze,
  extractAttributes,
  getAiStatus,
} = require("../controllers/aiController");

router.get("/status", getAiStatus);
router.post("/analyze", analyzeProduct);
router.post("/batch-analyze", batchAnalyze);
router.post("/extract", extractAttributes);

module.exports = router;