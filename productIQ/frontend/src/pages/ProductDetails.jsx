import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  FileText,
  Layers,
  ListChecks,
  Receipt,
  Smartphone,
  ShieldCheck,
  Edit3,
  Copy,
  Download,
  Plus,
  Trash2,
  CheckCircle2
} from "lucide-react";

import AttributeGrid from "../components/products/AttributeGrid";
import ConfidenceCard from "../components/products/ConfidenceCard";
import EnrichmentPanel from "../components/ai/EnrichmentPanel";
import ValidationPanel from "../components/ai/ValidationPanel";
import EvidenceList from "../components/ai/EvidenceList";
import {
  getProduct,
  reEnrichProduct,
  updateProduct,
  approveProduct,
  rejectProduct
} from "../services/api";

function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();

  const [product, setProduct] = useState(
    location.state?.enrichmentResult?.product || null
  );
  const [activeTab, setActiveTab] = useState("attributes"); // "attributes", "descriptions", "features"
  const [loading, setLoading] = useState(!product);
  const [enriching, setEnriching] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAttributes, setEditAttributes] = useState({});
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getProduct(id);
      if (data?.product) {
        setProduct(data.product);
      } else if (data) {
        setProduct(data);
      }
    } catch (err) {
      console.error("Failed to load product details:", err);
      setError("Unable to find product or backend is offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!product || (product.id !== id && product._id !== id)) {
      fetchDetails();
    }
  }, [id]);

  const handleEnrich = async () => {
    setEnriching(true);
    setError("");
    setSuccessMsg("");

    try {
      const result = await reEnrichProduct(id);
      if (result?.product) {
        setProduct(result.product);
        setSuccessMsg("Product re-enriched successfully with AI Intelligence Pipeline!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Re-enrichment failed:", err);
      setError(err.message || "Failed to re-enrich product.");
    } finally {
      setEnriching(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await approveProduct(id);
      if (res?.product) {
        setProduct(res.product);
        setSuccessMsg("Product approved and validated!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      setError(err.message || "Failed to approve product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const res = await rejectProduct(id);
      if (res?.product) {
        setProduct(res.product);
        setSuccessMsg("Product status set to Rejected");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      setError(err.message || "Failed to reject product");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Attributes
  const handleOpenEdit = () => {
    setEditAttributes({ ...(product?.attributes || {}) });
    setNewKey("");
    setNewVal("");
    setIsEditModalOpen(true);
  };

  const handleSaveAttributes = async () => {
    setActionLoading(true);
    try {
      const updated = {
        ...product,
        attributes: editAttributes,
      };
      const res = await updateProduct(id, { attributes: editAttributes });
      if (res?.product) {
        setProduct(res.product);
      } else {
        setProduct(updated);
      }
      setIsEditModalOpen(false);
      setSuccessMsg("Attributes updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError("Failed to save attributes");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAttribute = () => {
    if (newKey.trim() && newVal.trim()) {
      setEditAttributes({
        ...editAttributes,
        [newKey.trim()]: newVal.trim(),
      });
      setNewKey("");
      setNewVal("");
    }
  };

  const handleDeleteAttribute = (key) => {
    const updated = { ...editAttributes };
    delete updated[key];
    setEditAttributes(updated);
  };

  const handleCopyDescriptions = () => {
    const text = `Standard Description:\n${product?.shortDescription || product?.name}\n\nMobile Description:\n${product?.mobileDescription || "N/A"}\n\nERP/Invoice:\n${product?.invoiceDescription || "N/A"}\n\nFull Overview:\n${product?.description || "N/A"}`;
    navigator.clipboard.writeText(text);
    setSuccessMsg("Copied all commercial descriptions to clipboard!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(product, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${product?.sku || "product"}_intelligence.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <RefreshCw size={28} className="spin" />
        <p>Loading Product Intelligence...</p>
      </div>
    );
  }

  if (!product && error) {
    return (
      <div className="empty-state-card" style={{ marginTop: "40px" }}>
        <AlertCircle size={36} color="#ef4444" />
        <h3>Product Not Found</h3>
        <p>{error}</p>
        <Link to="/products" className="primary-button" style={{ marginTop: "15px" }}>
          Return to Catalog
        </Link>
      </div>
    );
  }

  const attributes = product?.attributes || {};
  const confidence = product?.confidence || 85;
  const validationScore = product?.validation?.score || confidence;
  const status = product?.status || "Needs Review";
  const category = product?.category || "Industrial Equipment";

  const getCategoryClass = (cat) => {
    const c = String(cat).toLowerCase();
    if (c.includes("abrasive")) return "cat-abrasive";
    if (c.includes("hydraulic") || c.includes("fluid")) return "cat-hydraulic";
    if (c.includes("motor") || c.includes("drive")) return "cat-motor";
    if (c.includes("appliance")) return "cat-appliance";
    if (c.includes("sensor")) return "cat-sensor";
    return "cat-general";
  };

  const features = product?.features && product.features.length > 0 ? product.features : [
    `Heavy-duty industrial grade construction for demanding continuous use`,
    `Precision engineered by ${product?.brand || 'Industrial Pro'} to meet safety and performance standards`,
    `Fully validated commercial catalog data with verified specifications`,
    `Commerce-ready structured attributes and ERP invoice descriptions`
  ];

  return (
    <>
      <div className="back-link">
        <Link to="/products">
          <ArrowLeft size={17} />
          <span>Back to Products</span>
        </Link>
      </div>

      {successMsg && (
        <div className="success-banner animate-fade">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="warning-banner animate-fade">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="product-detail-header">
        <div>
          <div className="header-meta-tags">
            <span className={`category-tag ${getCategoryClass(category)}`}>
              {category}
            </span>
            {product?.brand && (
              <span className="brand-pill">{product.brand}</span>
            )}
          </div>

          <h1>{product?.name}</h1>

          <div className="header-subtext">
            <span>SKU: <strong>{product?.sku || product?.Mfg_Part_Num || "N/A"}</strong></span>
            {product?.manufacturer && (
              <span> • Manufacturer: <strong>{product.manufacturer}</strong></span>
            )}
            {product?.classpath && (
              <span className="classpath-crumb"> • Taxonomy: {product.classpath}</span>
            )}
          </div>
        </div>

        <div className="header-status-group">
          <div className="header-action-row">
            <button
              className="secondary-button small"
              onClick={handleDownloadJSON}
              title="Download Product JSON"
            >
              <Download size={14} />
              <span>JSON</span>
            </button>

            <button
              className="secondary-button small"
              onClick={handleOpenEdit}
              title="Edit Attributes"
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </button>
          </div>

          <span
            className={
              status === "Validated"
                ? "status validated"
                : status === "Rejected"
                ? "status rejected"
                : "status review"
            }
          >
            {status === "Validated" ? "AI Validated" : status}
          </span>

          {status !== "Validated" && (
            <div className="quick-action-buttons">
              <button
                className="approve-button small"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <Check size={15} />
                Approve
              </button>

              <button
                className="reject-button small"
                onClick={handleReject}
                disabled={actionLoading}
              >
                <X size={15} />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="product-detail-grid">
        <div className="detail-main-col">
          {/* Tabs Navigation */}
          <div className="detail-tabs">
            <button
              className={`detail-tab-btn ${activeTab === "attributes" ? "active" : ""}`}
              onClick={() => setActiveTab("attributes")}
            >
              <Layers size={16} />
              <span>Structured Attributes ({Object.keys(attributes).length})</span>
            </button>

            <button
              className={`detail-tab-btn ${activeTab === "descriptions" ? "active" : ""}`}
              onClick={() => setActiveTab("descriptions")}
            >
              <FileText size={16} />
              <span>Commercial Descriptions</span>
            </button>

            <button
              className={`detail-tab-btn ${activeTab === "features" ? "active" : ""}`}
              onClick={() => setActiveTab("features")}
            >
              <ListChecks size={16} />
              <span>Feature Highlights ({features.length})</span>
            </button>
          </div>

          {/* TAB 1: Structured Attributes */}
          {activeTab === "attributes" && (
            <div className="detail-card animate-fade">
              <div className="card-heading">
                <div>
                  <h3>Structured Product Attributes</h3>
                  <p>AI-extracted technical parameters with standard units of measure.</p>
                </div>

                <button className="secondary-button small" onClick={handleOpenEdit}>
                  <Edit3 size={14} />
                  <span>Edit Attributes</span>
                </button>
              </div>

              <AttributeGrid attributes={attributes} />
            </div>
          )}

          {/* TAB 2: Commercial Descriptions */}
          {activeTab === "descriptions" && (
            <div className="detail-card animate-fade">
              <div className="card-heading">
                <div>
                  <h3>Multi-Tier Commercial Descriptions</h3>
                  <p>Standardized content generated for web, mobile apps, and ERP systems.</p>
                </div>

                <button className="secondary-button small" onClick={handleCopyDescriptions}>
                  <Copy size={14} />
                  <span>Copy All</span>
                </button>
              </div>

              <div className="descriptions-stack">
                <div className="desc-box standard">
                  <div className="desc-box-header">
                    <FileText size={16} color="#6366f1" />
                    <strong>Standard E-Commerce Title (SHORT_DESC)</strong>
                  </div>
                  <p>{product?.shortDescription || product?.name}</p>
                </div>

                <div className="desc-box mobile">
                  <div className="desc-box-header">
                    <Smartphone size={16} color="#0ea5e9" />
                    <strong>Mobile App Summary (MOBILE_DESC)</strong>
                  </div>
                  <p>{product?.mobileDescription || "N/A"}</p>
                </div>

                <div className="desc-box invoice">
                  <div className="desc-box-header">
                    <Receipt size={16} color="#8b5cf6" />
                    <strong>ERP / POS Invoice Summary (INVOICE_DESC)</strong>
                  </div>
                  <code>{product?.invoiceDescription || product?.name?.toUpperCase()}</code>
                </div>

                <div className="desc-box long">
                  <div className="desc-box-header">
                    <Layers size={16} color="#10b981" />
                    <strong>Detailed Engineering Overview (LONG_DESC1)</strong>
                  </div>
                  <p className="product-description">{product?.description || "No description available."}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Feature Highlights */}
          {activeTab === "features" && (
            <div className="detail-card animate-fade">
              <div className="card-heading">
                <div>
                  <h3>Item Feature Highlights</h3>
                  <p>Key value propositions and selling points generated by AI.</p>
                </div>
              </div>

              <ul className="features-bullet-list">
                {features.map((feat, idx) => (
                  <li key={idx}>
                    <span className="feature-check">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Evidence List */}
          <EvidenceList evidence={product?.evidence} />
        </div>

        {/* Right Sidebar */}
        <div className="detail-side-col">
          <ConfidenceCard score={confidence} />

          <ValidationPanel score={validationScore} />

          <EnrichmentPanel
            onEnrich={handleEnrich}
            loading={enriching}
          />
        </div>
      </div>

      {/* Edit Attributes Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Edit Product Attributes</h3>
                <p>Modify or add custom technical attributes for this product.</p>
              </div>
              <button className="close-modal-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="edit-attr-table">
                {Object.entries(editAttributes).map(([key, val]) => (
                  <div className="edit-attr-row" key={key}>
                    <span className="edit-attr-key">{key}</span>
                    <input
                      className="edit-attr-val-input"
                      value={val}
                      onChange={(e) =>
                        setEditAttributes({
                          ...editAttributes,
                          [key]: e.target.value,
                        })
                      }
                    />
                    <button
                      className="delete-attr-btn"
                      onClick={() => handleDeleteAttribute(key)}
                      title="Delete Attribute"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Attribute Row */}
              <div className="add-attr-row">
                <input
                  placeholder="Attribute Name (e.g. Voltage)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
                <input
                  placeholder="Value (e.g. 240V)"
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleAddAttribute}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              <div className="modal-footer">
                <button
                  className="secondary-button"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  onClick={handleSaveAttributes}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductDetails;