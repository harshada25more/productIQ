import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Database,
  CheckCircle,
  AlertTriangle,
  LayoutGrid,
  List,
  Download,
  Eye,
  Trash2,
  Check,
  X,
  Layers,
  ArrowUpDown,
  Filter
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import {
  getProducts,
  reseedCatalog,
  batchApproveProducts,
  batchDeleteProducts,
  exportCatalogUrl
} from "../services/api";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "confidence-high", "confidence-low", "name-asc"
  const [viewMode, setViewMode] = useState("table"); // "table", "grid"
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewProduct, setPreviewProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const fetchProductList = async (query, status, category) => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (query && query.trim()) params.q = query.trim();
      if (status && status !== "All Status") params.status = status;
      if (category && category !== "All Categories") params.category = category;

      const data = await getProducts(params);
      if (data?.products) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Unable to load product catalog. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductList(searchQuery, statusFilter, categoryFilter);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, categoryFilter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const handleReseed = async () => {
    setReloading(true);
    try {
      const res = await reseedCatalog();
      if (res?.products) {
        setProducts(res.products);
        setToast("Catalog refreshed with verified dataset products!");
        setTimeout(() => setToast(""), 4000);
      }
    } catch (err) {
      setError("Failed to refresh catalog dataset");
    } finally {
      setReloading(false);
    }
  };

  // Batch Select Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = products.map((p) => p._id || p.id).filter(Boolean);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      await batchApproveProducts(selectedIds);
      setToast(`Approved ${selectedIds.length} selected products!`);
      setSelectedIds([]);
      fetchProductList(searchQuery, statusFilter, categoryFilter);
      setTimeout(() => setToast(""), 4000);
    } catch (err) {
      setError("Batch approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected products?`)) return;
    setActionLoading(true);
    try {
      await batchDeleteProducts(selectedIds);
      setToast(`Deleted ${selectedIds.length} products`);
      setSelectedIds([]);
      fetchProductList(searchQuery, statusFilter, categoryFilter);
      setTimeout(() => setToast(""), 4000);
    } catch (err) {
      setError("Batch delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "confidence-high") return (b.confidence || 0) - (a.confidence || 0);
    if (sortBy === "confidence-low") return (a.confidence || 0) - (b.confidence || 0);
    if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const getCategoryBadgeClass = (cat) => {
    const c = String(cat).toLowerCase();
    if (c.includes("abrasive")) return "cat-badge-amber";
    if (c.includes("hydraulic") || c.includes("fluid")) return "cat-badge-cyan";
    if (c.includes("motor") || c.includes("drive")) return "cat-badge-indigo";
    if (c.includes("appliance")) return "cat-badge-emerald";
    if (c.includes("sensor")) return "cat-badge-purple";
    return "cat-badge-gray";
  };

  const validatedCount = products.filter((p) => p.status === "Validated").length;
  const reviewCount = products.filter((p) => p.status === "Needs Review" || p.status === "Review").length;

  return (
    <>
      <PageHeader
        title="Product Catalog"
        description="Manage AI-enriched and validated industrial & commercial products."
        action={
          <div className="header-action-group">
            <a
              href={exportCatalogUrl("csv")}
              className="secondary-button"
              title="Download CSV"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </a>

            <button
              className="secondary-button"
              onClick={handleReseed}
              disabled={reloading}
              title="Reset and reload dataset products"
            >
              <Database size={16} />
              <span>{reloading ? "Reloading..." : "Reload Dataset"}</span>
            </button>

            <Link className="primary-button" to="/add-product">
              <Plus size={18} />
              <span>Add Product</span>
            </Link>
          </div>
        }
      />

      {toast && <div className="success-banner">{toast}</div>}
      {error && (
        <div className="warning-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick metrics strip */}
      <div className="catalog-metrics-strip">
        <div className="metric-pill">
          <Database size={15} color="#6366f1" />
          <span>Total Products: <strong>{products.length}</strong></span>
        </div>
        <div className="metric-pill">
          <CheckCircle size={15} color="#10b981" />
          <span>Validated: <strong>{validatedCount}</strong></span>
        </div>
        <div className="metric-pill">
          <AlertTriangle size={15} color="#f59e0b" />
          <span>Needs Review: <strong>{reviewCount}</strong></span>
        </div>
      </div>

      {/* Batch Action Bar */}
      {selectedIds.length > 0 && (
        <div className="batch-action-bar animate-fade">
          <span><strong>{selectedIds.length}</strong> products selected</span>
          <div className="batch-btn-group">
            <button
              className="batch-btn approve"
              onClick={handleBatchApprove}
              disabled={actionLoading}
            >
              <Check size={15} />
              <span>Approve Selected</span>
            </button>
            <button
              className="batch-btn delete"
              onClick={handleBatchDelete}
              disabled={actionLoading}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
            <button
              className="batch-btn clear"
              onClick={() => setSelectedIds([])}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="catalog-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search products by name, SKU, brand, material, pressure..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All Categories">All Categories</option>
          <option value="Abrasives">Abrasives & Cutting</option>
          <option value="Appliances">Appliances</option>
          <option value="Hydraulic">Hydraulic Equipment</option>
          <option value="Electric Motors">Electric Motors</option>
          <option value="Sensors">Sensors & Instrumentation</option>
          <option value="Valves">Industrial Valves</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="All Status">All Status</option>
          <option value="Validated">Validated</option>
          <option value="Needs Review">Needs Review</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select sort-select"
        >
          <option value="newest">Sort: Newest</option>
          <option value="confidence-high">Confidence: High to Low</option>
          <option value="confidence-low">Confidence: Low to High</option>
          <option value="name-asc">Name: A to Z</option>
        </select>

        <div className="view-mode-toggle">
          <button
            className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Table View"
          >
            <List size={17} />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid Cards View"
          >
            <LayoutGrid size={17} />
          </button>
        </div>
      </div>

      <div className="catalog-card">
        {loading ? (
          <div className="table-loading">
            <RefreshCw size={24} className="spin" />
            <p>Loading catalog products...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="empty-state-card">
            <p>No products found matching your search criteria.</p>
            <button
              className="secondary-button"
              style={{ marginTop: "12px" }}
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All Status");
                setCategoryFilter("All Categories");
                setSearchParams({});
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === "table" ? (
          <div className="product-table">
            <div className="table-row table-header">
              <span className="checkbox-col">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedIds.length > 0 &&
                    selectedIds.length === products.length
                  }
                />
              </span>
              <span>Product</span>
              <span>SKU</span>
              <span>Category</span>
              <span>Confidence</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {sortedProducts.map((product) => {
              const prodId = product._id || product.id;
              const isSelected = selectedIds.includes(prodId);

              return (
                <div
                  className={`table-row ${isSelected ? "row-selected" : ""}`}
                  key={prodId}
                >
                  <span className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(prodId)}
                    />
                  </span>

                  <span className="product-name-col">
                    <Link to={`/products/${prodId}`}>
                      <strong>{product.name}</strong>
                    </Link>
                    {product.brand && <span className="sub-brand">{product.brand}</span>}
                  </span>

                  <span className="sku-cell">{product.sku || product.Mfg_Part_Num || "N/A"}</span>

                  <span>
                    <span className={`cat-pill ${getCategoryBadgeClass(product.category)}`}>
                      {product.category || "Industrial"}
                    </span>
                  </span>

                  <span>
                    <div className="confidence-meter-mini">
                      <strong>{product.confidence || 0}%</strong>
                      <div className="meter-bg">
                        <div
                          className="meter-fill"
                          style={{
                            width: `${product.confidence || 0}%`,
                            backgroundColor:
                              (product.confidence || 0) >= 90
                                ? "#10b981"
                                : (product.confidence || 0) >= 75
                                ? "#f59e0b"
                                : "#f43f5e"
                          }}
                        ></div>
                      </div>
                    </div>
                  </span>

                  <span>
                    <span
                      className={
                        product.status === "Validated"
                          ? "status validated"
                          : product.status === "Rejected"
                          ? "status rejected"
                          : "status review"
                      }
                    >
                      {product.status || "Needs Review"}
                    </span>
                  </span>

                  <span className="row-actions-cell">
                    <button
                      className="quick-icon-btn"
                      title="Quick Preview"
                      onClick={() => setPreviewProduct(product)}
                    >
                      <Eye size={15} />
                    </button>
                    <Link
                      to={`/products/${prodId}`}
                      className="quick-icon-btn primary"
                      title="Open Details"
                    >
                      <Layers size={15} />
                    </Link>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View Cards */
          <div className="products-card-grid">
            {sortedProducts.map((product) => {
              const prodId = product._id || product.id;
              const isSelected = selectedIds.includes(prodId);

              return (
                <div
                  className={`product-grid-card ${isSelected ? "card-selected" : ""}`}
                  key={prodId}
                >
                  <div className="grid-card-top">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(prodId)}
                    />
                    <span className={`cat-pill ${getCategoryBadgeClass(product.category)}`}>
                      {product.category || "Industrial"}
                    </span>
                  </div>

                  <Link to={`/products/${prodId}`} className="grid-card-title">
                    <h4>{product.name}</h4>
                  </Link>

                  <div className="grid-card-meta">
                    <span>SKU: <strong>{product.sku || product.Mfg_Part_Num || "N/A"}</strong></span>
                    <span>Brand: <strong>{product.brand || "Industrial Pro"}</strong></span>
                  </div>

                  <p className="grid-card-desc">
                    {product.shortDescription || product.description || "Enriched catalog specification."}
                  </p>

                  <div className="grid-card-footer">
                    <div className="confidence-meter-mini">
                      <strong>{product.confidence || 0}% AI Score</strong>
                    </div>

                    <span
                      className={
                        product.status === "Validated"
                          ? "status validated"
                          : product.status === "Rejected"
                          ? "status rejected"
                          : "status review"
                      }
                    >
                      {product.status || "Needs Review"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Preview Modal */}
      {previewProduct && (
        <div className="modal-overlay" onClick={() => setPreviewProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className={`cat-pill ${getCategoryBadgeClass(previewProduct.category)}`}>
                  {previewProduct.category}
                </span>
                <h3>{previewProduct.name}</h3>
                <span className="modal-sku">SKU: {previewProduct.sku || previewProduct.Mfg_Part_Num}</span>
              </div>
              <button className="close-modal-btn" onClick={() => setPreviewProduct(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <strong>Standard Commerce Description</strong>
                <p>{previewProduct.shortDescription || previewProduct.name}</p>
              </div>

              <div className="modal-section">
                <strong>Extracted Attributes</strong>
                <div className="modal-attr-grid">
                  {Object.entries(previewProduct.attributes || {}).map(([key, val]) => (
                    <div className="modal-attr-item" key={key}>
                      <span>{key}</span>
                      <strong>{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <Link
                  to={`/products/${previewProduct._id || previewProduct.id}`}
                  className="primary-button"
                >
                  Open Full Intelligence Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Products;