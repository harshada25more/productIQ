function HealthCard({ score = 87 }) {
  return (
    <div className="dashboard-card health-card">
      <div className="card-heading">
        <div>
          <h3>Catalog Health</h3>
          <p>Overall product data quality</p>
        </div>

        <span className="health-badge">Good</span>
      </div>

      <div className="health-score">
        <div className="score-circle">
          <strong>{score}%</strong>
          <span>Health</span>
        </div>

        <div className="health-details">
          <div>
            <span>Completeness</span>
            <strong>91%</strong>
          </div>

          <div>
            <span>Accuracy</span>
            <strong>88%</strong>
          </div>

          <div>
            <span>Validation</span>
            <strong>82%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCard;