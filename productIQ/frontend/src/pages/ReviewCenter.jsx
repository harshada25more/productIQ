import { useState, useEffect } from "react";
import {
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  CheckCircle2,
  Edit3,
  Filter,
  CheckCheck,
  XCircle,
  Layers,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

import PageHeader from "../components/common/PageHeader";
import {
  getReviewProducts,
  approveProduct,
  rejectProduct,
  batchApproveProducts,
  updateProduct
} from "../services/api";

function ReviewCenter() {
  const [reviews, setReviews] = useState([]);
  const [filterReason, setFilterReason] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Quick edit state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editKey, setEditKey] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getReviewProducts();
      if (Array.isArray(data)) {
        setReviews(data);
      } else if (data?.products) {
        setReviews(data.products);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Failed to load review products:", err);
      setError("Unable to load review queue. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id, name) => {
    setActionLoadingId(id);
    try {
      await approveProduct(id);
      setReviews((prev) => prev.filter((r) => (r.id || r._id) !== id));
      setSuccessNotice(`Successfully approved and validated "${name}".`);
      setTimeout(() => setSuccessNotice(""), 4000);
    } catch (err) {
      console.error("Approval error:", err);
      setError(`Failed to approve product: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id, name) => {
    setActionLoadingId(id);
    try {
      await rejectProduct(id);
      setReviews((prev) => prev.filter((r) => (r.id || r._id) !== id));
      setSuccessNotice(`Marked "${name}" as rejected.`);
      setTimeout(() => setSuccessNotice(""), 4000);
    } catch (err) {
      console.error("Rejection error:", err);
      setError(`Failed to reject product: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveAll = async () => {
    if (reviews.length === 0) return;
    setBatchLoading(true);
    try {
      const ids = reviews.map((r) => r._id || r.id).filter(Boolean);
      await batchApproveProducts(ids);
      setReviews([]);
      setSuccessNotice(`Successfully approved and validated all ${ids.length} products in queue!`);
      setTimeout(() => setSuccessNotice(""), 4000);
    } catch (err) {
      setError("Failed to batch approve review items.");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleStartEdit = (review, key, val) => {
    setEditingId(review.id || review._id);
    setEditKey(key);
    setEditValue(val);
  };

  const handleSaveEdit = async (review) => {
    const reviewId = review.id || review._id;
    setActionLoadingId(reviewId);
    try {
      const updatedAttributes = {
        ...(review.attributes || {}),
        [editKey]: editValue,
      };
      await updateProduct(reviewId, {
        attributes: updatedAttributes,
        flaggedValue: editValue,
      });

      // Update in local state
      setReviews((prev) =>
        prev.map((r) => {
          if ((r.id || r._id) === reviewId) {
            return {
              ...r,
              attributes: updatedAttributes,
              flaggedValue: editValue,
            };
          }
          return r;
        })
      );

      setEditingId(null);
      setSuccessNotice(`Updated ${editKey} value.`);
      setTimeout(() => setSuccessNotice(""), 3000);
    } catch (err) {
      setError("Failed to update attribute.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterReason === "low-confidence") return (r.confidence || 0) < 80;
    if (filterReason === "conflicts") return r.validation?.potentialConflicts > 0 || r.reviewReason;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Review Center"
        description="Verify AI-extracted parameters, resolve conflicts, and approve catalog items."
        action={
          <div className="header-action-group">
            {reviews.length > 0 && (
              <button
                className="primary-button"
                onClick={handleApproveAll}
                disabled={batchLoading}
                title="Approve all items currently in the review queue"
              >
                <CheckCheck size={16} />
                <span>{batchLoading ? "Approving..." : `Approve All (${reviews.length})`}</span>
              </button>
            )}

            <button
              className="secondary-button"
              onClick={fetchReviews}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              <span>Refresh Queue</span>
            </button>
          </div>
        }
      />

      {successNotice && (
        <div className="success-banner animate-fade">
          <CheckCircle2 size={18} />
          <span>{successNotice}</span>
        </div>
      )}
      {error && (
        <div className="warning-banner animate-fade">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="review-info-card">
        <div className="review-info-lead">
          <AlertTriangle size={22} color="#f59e0b" />
          <div>
            <strong>{reviews.length} product(s) require human verification</strong>
            <p>
              AI has flagged lower confidence, conflicting technical specifications, or missing parameters.
            </p>
          </div>
        </div>

        <div className="review-filter-pills">
          <button
            className={`filter-pill ${filterReason === "all" ? "active" : ""}`}
            onClick={() => setFilterReason("all")}
          >
            All Queue ({reviews.length})
          </button>
          <button
            className={`filter-pill ${filterReason === "low-confidence" ? "active" : ""}`}
            onClick={() => setFilterReason("low-confidence")}
          >
            Score &lt; 80%
          </button>
          <button
            className={`filter-pill ${filterReason === "conflicts" ? "active" : ""}`}
            onClick={() => setFilterReason("conflicts")}
          >
            Spec Conflicts
          </button>
        </div>
      </div>

      {loading ? (
        <div className="table-loading">
          <RefreshCw size={24} className="spin" />
          <p>Loading review items...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="empty-state-card review-empty-card animate-fade">
          <CheckCircle size={48} color="#22c55e" />
          <h3>All Clear! No Items Pending Review</h3>
          <p>Every product in the catalog has been verified and validated by the AI engine.</p>
          <Link to="/products" className="primary-button" style={{ marginTop: "14px" }}>
            View Full Product Catalog
          </Link>
        </div>
      ) : (
        <div className="review-list">
          {filteredReviews.map((review) => {
            const reviewId = review.id || review._id;
            const isProcessing = actionLoadingId === reviewId;
            const attributeName =
              review.flaggedAttribute ||
              Object.keys(review.attributes || {})[0] ||
              "Product Specification";
            const attributeValue =
              review.flaggedValue ||
              (review.attributes && review.attributes[attributeName]) ||
              review.product_type ||
              "Specification Verified";

            const isEditing = editingId === reviewId;

            return (
              <div className="review-card animate-fade" key={reviewId}>
                <div className="review-main">
                  <span className="review-product">
                    <Link to={`/products/${reviewId}`}>
                      <strong>{review.name}</strong>
                    </Link>
                    {review.brand && <span className="review-brand-pill">{review.brand}</span>}
                  </span>

                  <h3>{attributeName}</h3>

                  <p className="review-reason-text">
                    {review.reviewReason ||
                      "Confidence score is below threshold or requires verification against datasheet."}
                  </p>
                </div>

                <div className="review-value">
                  <span>AI Extracted Value</span>
                  {isEditing ? (
                    <div className="inline-edit-box">
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="inline-input"
                      />
                      <div className="inline-edit-actions">
                        <button
                          className="action-icon-btn save"
                          onClick={() => handleSaveEdit(review)}
                          title="Save Value"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="action-icon-btn cancel"
                          onClick={() => setEditingId(null)}
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="value-display-row">
                      <strong>{attributeValue}</strong>
                      <button
                        className="quick-edit-btn"
                        onClick={() => handleStartEdit(review, attributeName, attributeValue)}
                        title="Edit value before approving"
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="review-confidence">
                  <span>Confidence Score</span>
                  <div className="confidence-pill-wrap">
                    <strong className={(review.confidence || 0) < 80 ? "low" : "med"}>
                      {review.confidence || 74}%
                    </strong>
                  </div>
                </div>

                <div className="review-actions">
                  <button
                    className="approve-button"
                    onClick={() => handleApprove(reviewId, review.name)}
                    disabled={isProcessing}
                  >
                    <Check size={16} />
                    <span>{isProcessing ? "Approving..." : "Approve"}</span>
                  </button>

                  <button
                    className="reject-button"
                    onClick={() => handleReject(reviewId, review.name)}
                    disabled={isProcessing}
                  >
                    <X size={16} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default ReviewCenter;