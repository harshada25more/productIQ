import { ShieldCheck } from "lucide-react";

function ValidationPanel({ score = 92 }) {
  return (
    <div className="ai-panel validation-panel">
      <div className="ai-panel-header">
        <div className="validation-icon">
          <ShieldCheck size={21} />
        </div>

        <div>
          <h3>AI Validation</h3>
          <p>Checks product information for reliability.</p>
        </div>
      </div>

      <div className="validation-score">
        <strong>{score}%</strong>
        <span>Validation Score</span>
      </div>

      <div className="validation-list">
        <div>
          <span>Attribute consistency</span>
          <strong>✓ Passed</strong>
        </div>

        <div>
          <span>Technical specification</span>
          <strong>✓ Passed</strong>
        </div>

        <div>
          <span>Missing information</span>
          <strong>3 detected</strong>
        </div>

        <div>
          <span>Potential conflicts</span>
          <strong>1 detected</strong>
        </div>
      </div>
    </div>
  );
}

export default ValidationPanel;