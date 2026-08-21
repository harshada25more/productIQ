function ConfidenceCard({ score = 92 }) {
  const getLabel = () => {
    if (score >= 90) return "High Confidence";
    if (score >= 70) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <div className="confidence-card">
      <div className="confidence-header">
        <div>
          <h3>AI Confidence</h3>
          <p>Confidence in generated product information</p>
        </div>

        <strong>{score}%</strong>
      </div>

      <div className="confidence-bar">
        <div style={{ width: `${score}%` }}></div>
      </div>

      <div className="confidence-footer">
        <span>{getLabel()}</span>
        <span>Based on available evidence</span>
      </div>
    </div>
  );
}

export default ConfidenceCard;