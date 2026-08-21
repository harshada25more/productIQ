const {
  enrichProductData,
  generateProductAnalysis,
  extractAttributesFromText,
  extractEntitiesFromText,
  generateDescriptions,
} = require("../services/aiService");

const analyzeProduct = async (req, res) => {
  try {
    const { product } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product data is required",
      });
    }

    const analysis = await generateProductAnalysis(product);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "AI analysis failed",
      error: error.message,
    });
  }
};

const batchAnalyze = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of products is required for batch analysis",
      });
    }

    const analyses = await Promise.all(
      products.map(async (p) => {
        try {
          return await generateProductAnalysis(p);
        } catch (e) {
          return { error: e.message, product: p };
        }
      })
    );

    res.json({
      success: true,
      count: analyses.length,
      analyses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Batch analysis failed",
      error: error.message,
    });
  }
};

const extractAttributes = async (req, res) => {
  try {
    const { text, category } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    const entities = extractEntitiesFromText(text);
    const attributes = extractAttributesFromText(text, category || entities.product_type);

    res.json({
      success: true,
      entities,
      attributes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Extraction failed",
      error: error.message,
    });
  }
};

const getAiStatus = async (req, res) => {
  try {
    let pythonEngineOnline = false;
    let pythonResponseTime = null;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const pyRes = await fetch("http://localhost:8000/health", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (pyRes.ok) {
        pythonEngineOnline = true;
        pythonResponseTime = `${Date.now() - startTime}ms`;
      }
    } catch (e) {
      pythonEngineOnline = false;
    }

    res.json({
      status: "operational",
      engines: {
        nodeJsNLP: {
          status: "online",
          version: "2.0.0",
          features: ["Regex Heuristics", "Multi-Domain Tokenizer", "Standard Units Parser"],
        },
        pythonFastAPIML: {
          status: pythonEngineOnline ? "online" : "offline",
          endpoint: "http://localhost:8000/pipeline/process",
          responseTime: pythonResponseTime,
          version: "1.0.0",
        },
      },
      activePipeline: pythonEngineOnline ? "Python FastAPI Pipeline" : "Node.js Resilient NLP Pipeline",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to query AI status",
      error: error.message,
    });
  }
};

module.exports = {
  analyzeProduct,
  batchAnalyze,
  extractAttributes,
  getAiStatus,
};