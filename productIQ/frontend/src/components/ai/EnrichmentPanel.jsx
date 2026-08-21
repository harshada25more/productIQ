import { Sparkles } from "lucide-react";

function EnrichmentPanel({ onEnrich, loading = false }) {
  return (
    <div className="ai-panel enrichment-panel">
      <div className="ai-panel-header">
        <div className="ai-icon">
          <Sparkles size={20} />
        </div>

        <div>
          <h3>AI Product Enrichment</h3>
          <p>
            Generate missing attributes and commerce-ready product
            information.
          </p>
        </div>
      </div>

      <div className="enrichment-features">
        <span>✓ Attribute generation</span>
        <span>✓ Product description</span>
        <span>✓ Technical specifications</span>
        <span>✓ Commerce-ready content</span>
      </div>

      <button
        className="primary-button"
        onClick={onEnrich}
        disabled={loading}
      >
        <Sparkles size={18} />

        {loading ? "AI Processing..." : "Enrich Product"}
      </button>
    </div>
  );
}

export default EnrichmentPanel;