const productService = require("../services/productService");
const { enrichProductData } = require("../services/aiService");

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { q, status, category } = req.query;
    const products = await productService.getProducts({ q, status, category });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// GET /api/products/search?q=...
const searchProducts = async (req, res) => {
  try {
    const query = req.query.q || "";
    const results = await productService.getProducts({ q: query });
    res.json(results);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    const enriched = await enrichProductData(req.body);
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const product = await productService.createProduct(enriched, userId);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// POST /api/products/enrich
const enrichProduct = async (req, res) => {
  try {
    const { name, sku, description, category, manufacturer, technicalData } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required for enrichment",
      });
    }

    // Run AI NLP enrichment pipeline
    const enrichedData = await enrichProductData({
      name,
      sku,
      category,
      manufacturer,
      description,
      technicalData,
    });

    const userId = req.user ? (req.user._id || req.user.id) : null;
    const product = await productService.createProduct(enrichedData, userId);

    res.status(201).json({
      success: true,
      message: "Product enriched successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "AI enrichment failed",
      error: error.message,
    });
  }
};

// POST /api/products/:id/enrich (Re-enrich existing product)
const reEnrichProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await productService.getProductById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const enriched = await enrichProductData({
      name: existing.name,
      sku: existing.sku,
      category: existing.category,
      manufacturer: existing.manufacturer || existing.brand,
      description: existing.description,
      technicalData: existing.technicalData,
    });

    const updated = await productService.updateProduct(id, {
      ...enriched,
      status: "Validated",
    });

    res.json({
      success: true,
      message: "Product re-enriched successfully",
      product: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to re-enrich product",
      error: error.message,
    });
  }
};

// GET /api/products/review
const getReviewProducts = async (req, res) => {
  try {
    const products = await productService.getProducts({ status: "Needs Review" });
    res.json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch review products",
      error: error.message,
    });
  }
};

// POST /api/products/:id/approve
const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updated = await productService.updateProduct(id, {
      status: "Validated",
      confidence: Math.max(product.confidence || 85, 92),
      validation: {
        score: 94,
        attributeConsistency: "Passed",
        technicalSpecification: "Passed",
        missingInformation: 0,
        potentialConflicts: 0,
      },
    });

    res.json({
      success: true,
      message: "Product approved successfully",
      product: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve product",
      error: error.message,
    });
  }
};

// POST /api/products/:id/reject
const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updated = await productService.updateProduct(id, {
      status: "Rejected",
    });

    res.json({
      success: true,
      message: "Product rejected",
      product: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject product",
      error: error.message,
    });
  }
};

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const stats = await productService.getDashboardStats();
    res.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

// GET /api/products/health/catalog or /api/catalog-health
const getCatalogHealth = async (req, res) => {
  try {
    const health = await productService.getCatalogHealth();
    res.json({
      success: true,
      ...health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate catalog health",
      error: error.message,
    });
  }
};

// POST /api/products/batch-enrich
const batchEnrichProducts = async (req, res) => {
  try {
    const { products: items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of product objects is required in body.products",
      });
    }

    const created = [];
    const userId = req.user ? (req.user._id || req.user.id) : null;

    for (const item of items) {
      if (!item.name && !item.Part_Desc && !item.description) continue;
      const enriched = await enrichProductData({
        name: item.name || item.Part_Desc || "Industrial Product",
        sku: item.sku || item.Mfg_Part_Num || "",
        category: item.category || "",
        manufacturer: item.manufacturer || item.Part_Manuf || "",
        description: item.description || item.Part_Desc || "",
        technicalData: item.technicalData || "",
      });

      const doc = await productService.createProduct(enriched, userId);
      created.push(doc);
    }

    res.status(201).json({
      success: true,
      message: `Successfully batch enriched ${created.length} products`,
      count: created.length,
      products: created,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Batch enrichment failed",
      error: error.message,
    });
  }
};

// GET /api/products/export
const exportProducts = async (req, res) => {
  try {
    const format = req.query.format || "json";
    const products = await productService.getProducts({});

    if (format.toLowerCase() === "csv") {
      // Build Expected Output CSV
      const headers = [
        "PART_NUMBER", "Mfg_Part_Num", "Product Name", "BRAND_NAME", "MANUFACTURER_NAME",
        "Classpath", "Category", "Confidence", "Status", "SHORT_DESC", "MOBILE_DESC", "INVOICE_DESC",
        "LONG_DESC1", "Attributes"
      ];

      const rows = products.map((p) => {
        const attrStr = Object.entries(p.attributes || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | ");

        return [
          `"${p.sku || ""}"`,
          `"${p.Mfg_Part_Num || p.sku || ""}"`,
          `"${(p.name || "").replace(/"/g, '""')}"`,
          `"${(p.brand || "").replace(/"/g, '""')}"`,
          `"${(p.manufacturer || p.brand || "").replace(/"/g, '""')}"`,
          `"${(p.classpath || "").replace(/"/g, '""')}"`,
          `"${(p.category || "").replace(/"/g, '""')}"`,
          p.confidence || 0,
          `"${p.status || ""}"`,
          `"${(p.shortDescription || p.name || "").replace(/"/g, '""')}"`,
          `"${(p.mobileDescription || "").replace(/"/g, '""')}"`,
          `"${(p.invoiceDescription || "").replace(/"/g, '""')}"`,
          `"${(p.description || "").replace(/"/g, '""')}"`,
          `"${attrStr.replace(/"/g, '""')}"`
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="ProductIQ_Enriched_Catalog.csv"');
      return res.send(csvContent);
    }

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Export failed",
      error: error.message,
    });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const product = await productService.updateProduct(id, updateData);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await productService.deleteProduct(id);

    if (!success) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// POST /api/products/batch-approve
const batchApproveProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    const modifiedCount = await productService.batchApprove(ids || []);

    res.json({
      success: true,
      message: `Approved ${modifiedCount} products`,
      modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Batch approve failed",
      error: error.message,
    });
  }
};

// POST /api/products/batch-delete
const batchDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array required" });
    }

    const deletedCount = await productService.batchDelete(ids);
    res.json({
      success: true,
      message: `Deleted ${deletedCount} products`,
      deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Batch delete failed",
      error: error.message,
    });
  }
};

// POST /api/products/sanitize
const autoSanitizeCatalog = async (req, res) => {
  try {
    const sanitizedCount = await productService.autoSanitizeCatalog();

    res.json({
      success: true,
      message: `Catalog auto-sanitized! Updated ${sanitizedCount} products with standard taxonomy and parameters.`,
      sanitizedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Catalog auto-sanitization failed",
      error: error.message,
    });
  }
};

// POST /api/products/reseed
const reseedProducts = async (req, res) => {
  try {
    const products = await productService.reseedCatalog();

    res.json({
      success: true,
      message: "Catalog successfully refreshed and reseeded with verified dataset products!",
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Reseed failed",
      error: error.message,
    });
  }
};

module.exports = {
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
};