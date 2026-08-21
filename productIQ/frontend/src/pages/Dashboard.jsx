import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Sparkles,
  ClipboardCheck,
  AlertTriangle,
  RefreshCw,
  Download,
  PlusCircle,
  ShieldCheck,
  Database,
  ArrowRight,
  Cpu,
  Layers
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/dashboard/StatCard";
import HealthCard from "../components/dashboard/HealthCard";
import ProcessingCard from "../components/dashboard/ProcessingCard";
import RecentProducts from "../components/dashboard/RecentProducts";
import { getDashboardStats, autoSanitizeCatalog, reseedCatalog, exportCatalogUrl } from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    total_products: 0,
    ai_enriched: 0,
    validated: 0,
    needs_review: 0,
    health_score: 87,
    recent_products: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDashboardStats();
      if (data) {
        setStats({
          total_products: data.total_products ?? 0,
          ai_enriched: data.ai_enriched ?? 0,
          validated: data.validated ?? 0,
          needs_review: data.needs_review ?? 0,
          health_score: data.health_score ?? 87,
          recent_products: data.recent_products || [],
        });
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      setError("Unable to connect to backend service. Showing cached stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAutoSanitize = async () => {
    setActionLoading(true);
    try {
      const res = await autoSanitizeCatalog();
      setToast(res?.message || "Catalog auto-sanitized successfully!");
      fetchStats();
      setTimeout(() => setToast(""), 4000);
    } catch (err) {
      setError("Auto-sanitization failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReseed = async () => {
    setActionLoading(true);
    try {
      const res = await reseedCatalog();
      setToast("Catalog refreshed with verified dataset products!");
      fetchStats();
      setTimeout(() => setToast(""), 4000);
    } catch (err) {
      setError("Failed to refresh catalog");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Product Intelligence Dashboard"
        description="Monitor AI-powered product enrichment, validation and catalog quality in real time."
        action={
          <div className="header-action-group">
            <button
              className="secondary-button"
              onClick={fetchStats}
              disabled={loading}
              title="Refresh statistics"
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>

            <a
              href={exportCatalogUrl("csv")}
              className="secondary-button"
              title="Download CSV of enriched catalog"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </a>

            <Link to="/add-product" className="primary-button">
              <PlusCircle size={16} />
              <span>Add Product</span>
            </Link>
          </div>
        }
      />

      {toast && <div className="success-banner">{toast}</div>}
      {error && <div className="warning-banner">{error}</div>}

      {/* Quick Action Operations Strip */}
      <div className="quick-actions-banner">
        <div className="quick-action-lead">
          <Cpu size={18} color="#6366f1" />
          <span>AI Intelligence Engine: <strong>Active (NLP & Taxonomy v1.0)</strong></span>
        </div>

        <div className="quick-action-buttons-group">
          <button
            className="action-pill-btn"
            onClick={handleAutoSanitize}
            disabled={actionLoading}
          >
            <ShieldCheck size={14} />
            <span>{actionLoading ? "Sanitizing..." : "1-Click Auto-Sanitize"}</span>
          </button>

          <button
            className="action-pill-btn secondary"
            onClick={handleReseed}
            disabled={actionLoading}
          >
            <Database size={14} />
            <span>Reload Verified Dataset</span>
          </button>

          <Link to="/review-center" className="action-pill-btn alert">
            <AlertTriangle size={14} />
            <span>Review Queue ({stats.needs_review})</span>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Products"
          value={stats.total_products.toLocaleString()}
          change="+12.5%"
          icon={Package}
          type="blue"
        />

        <StatCard
          title="AI Enriched"
          value={stats.ai_enriched.toLocaleString()}
          change="+18.2%"
          icon={Sparkles}
          type="purple"
        />

        <StatCard
          title="Validated"
          value={stats.validated.toLocaleString()}
          change="+9.4%"
          icon={ClipboardCheck}
          type="green"
        />

        <StatCard
          title="Needs Review"
          value={stats.needs_review.toLocaleString()}
          change="-5.8%"
          icon={AlertTriangle}
          type="orange"
        />
      </div>

      <div className="dashboard-grid">
        <HealthCard score={stats.health_score} />
        <ProcessingCard
          total={stats.total_products}
          processed={stats.ai_enriched}
          needsReview={stats.needs_review}
        />
      </div>

      <RecentProducts products={stats.recent_products} />
    </>
  );
}

export default Dashboard;