import { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  CheckCircle2,
  HelpCircle,
  FileCheck2,
  Database
} from "lucide-react";
import { Link } from "react-router-dom";

import PageHeader from "../components/common/PageHeader";
import { getCatalogHealth, autoSanitizeCatalog } from "../services/api";

function CatalogHealth() {
  const [health, setHealth] = useState({
    overall_score: 87,
    completeness: 91,
    accuracy: 88,
    consistency: 85,
    needs_review: 1,
    conflicts: 1,
  });
  const [loading, setLoading] = useState(true);
  const [sanitizing, setSanitizing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCatalogHealth();
      if (data) {
        setHealth({
          overall_score: data.overall_score ?? 87,
          completeness: data.completeness ?? 91,
          accuracy: data.accuracy ?? 88,
          consistency: data.consistency ?? 85,
          needs_review: data.needs_review ?? 0,
          conflicts: data.conflicts ?? 0,
        });
      }
    } catch (err) {
      console.error("Failed to load catalog health:", err);
      setError("Unable to compute live catalog health.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  const handleSanitize = async () => {
    setSanitizing(true);
    try {
      const res = await autoSanitizeCatalog();
      setToast(res?.message || "Catalog successfully sanitized and validated!");
      fetchHealthData();
      setTimeout(() => setToast(""), 4000);
    } catch (err) {
      setError("Auto-sanitization failed.");
    } finally {
      setSanitizing(false);
    }
  };

  const getHealthRating = (score) => {
    if (score >= 90) return "Excellent catalog quality & commerce readiness";
    if (score >= 80) return "Good catalog quality (minor review suggested)";
    if (score >= 70) return "Moderate catalog quality";
    return "Attention required";
  };

  return (
    <>
      <PageHeader
        title="Catalog Health & Quality Audit"
        description="Monitor completeness, accuracy, consistency, and taxonomy compliance across your entire product catalog."
        action={
          <div className="header-action-group">
            <button
              className="primary-button"
              onClick={handleSanitize}
              disabled={sanitizing}
              title="Fix missing taxonomy paths and standard units"
            >
              <ShieldCheck size={16} />
              <span>{sanitizing ? "Sanitizing..." : "1-Click Auto-Sanitize"}</span>
            </button>

            <button
              className="secondary-button"
              onClick={fetchHealthData}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              <span>Re-evaluate Health</span>
            </button>
          </div>
        }
      />

      {toast && (
        <div className="success-banner animate-fade">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}
      {error && (
        <div className="warning-banner animate-fade">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="health-overview animate-fade">
        <div className="health-main-score">
          <span>Overall Catalog Health</span>
          <strong>{health.overall_score}%</strong>
          <p>{getHealthRating(health.overall_score)}</p>
        </div>

        <div className="health-metrics">
          <div>
            <CheckCircle size={22} color="#22c55e" />
            <span>Completeness</span>
            <strong>{health.completeness}%</strong>
          </div>

          <div>
            <Sparkles size={22} color="#6366f1" />
            <span>Accuracy</span>
            <strong>{health.accuracy}%</strong>
          </div>

          <div>
            <AlertTriangle size={22} color="#f59e0b" />
            <span>Needs Review</span>
            <strong>{health.needs_review}</strong>
          </div>

          <div>
            <XCircle size={22} color="#ef4444" />
            <span>Conflicts</span>
            <strong>{health.conflicts}</strong>
          </div>
        </div>
      </div>

      <div className="catalog-health-grid">
        <div className="catalog-health-card">
          <div className="card-heading">
            <div>
              <h3>Data Quality Breakdown</h3>
              <p>Granular scoring based on AI validation benchmarks and ERP readiness.</p>
            </div>
          </div>

          <div className="quality-item">
            <div>
              <span>Product completeness (Attributes, SKU, Manufacturer)</span>
              <strong>{health.completeness}%</strong>
            </div>

            <div className="progress-bar">
              <div style={{ width: `${health.completeness}%`, backgroundColor: "#10b981" }}></div>
            </div>
          </div>

          <div className="quality-item">
            <div>
              <span>AI validation accuracy & model confidence</span>
              <strong>{health.accuracy}%</strong>
            </div>

            <div className="progress-bar">
              <div style={{ width: `${health.accuracy}%`, backgroundColor: "#6366f1" }}></div>
            </div>
          </div>

          <div className="quality-item">
            <div>
              <span>Attribute consistency & unit standardization</span>
              <strong>{health.consistency}%</strong>
            </div>

            <div className="progress-bar">
              <div style={{ width: `${health.consistency}%`, backgroundColor: "#8b5cf6" }}></div>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="catalog-health-card recommendations-card">
          <div className="card-heading">
            <div>
              <h3>AI Catalog Optimization Insights</h3>
              <p>Automated recommendations to reach 95%+ catalog health.</p>
            </div>
          </div>

          <div className="recommendations-list">
            <div className="rec-item">
              <div className="rec-icon green">
                <FileCheck2 size={16} />
              </div>
              <div className="rec-text">
                <strong>Standardize Taxonomy Paths</strong>
                <p>Ensure all items have 3-tier industrial classpath hierarchy.</p>
              </div>
            </div>

            <div className="rec-item">
              <div className="rec-icon purple">
                <Zap size={16} />
              </div>
              <div className="rec-text">
                <strong>Enrich Missing Units of Measure</strong>
                <p>Auto-sanitize adds standard UOMs (bar, psi, dBA, kW, V, A) automatically.</p>
              </div>
            </div>

            <div className="rec-item">
              <div className="rec-icon orange">
                <AlertTriangle size={16} />
              </div>
              <div className="rec-text">
                <strong>Clear Review Queue</strong>
                <p>
                  {health.needs_review > 0 ? (
                    <Link to="/review-center" className="rec-link">
                      Resolve {health.needs_review} flagged item(s) in Review Center &rarr;
                    </Link>
                  ) : (
                    "No pending review items detected."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CatalogHealth;