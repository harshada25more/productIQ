function ProcessingCard({ total = 1000, processed = 824, needsReview = 126 }) {
  const safeTotal = total > 0 ? total : 1;
  const percent = Math.min(Math.round((processed / safeTotal) * 100), 100);
  const pending = Math.max(total - processed, 0);

  return (
    <div className="dashboard-card processing-card">
      <div className="card-heading">
        <div>
          <h3>AI Processing</h3>
          <p>Current catalog processing status</p>
        </div>

        <span className="processing-status">Running</span>
      </div>

      <div className="progress-section">
        <div className="progress-label">
          <span>Products processed</span>
          <strong>
            {processed} / {total}
          </strong>
        </div>

        <div className="progress-bar">
          <div style={{ width: `${percent}%` }}></div>
        </div>
      </div>

      <div className="processing-stats">
        <div>
          <strong>{processed}</strong>
          <span>Processed</span>
        </div>

        <div>
          <strong>{needsReview}</strong>
          <span>Needs Review</span>
        </div>

        <div>
          <strong>{pending}</strong>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}

export default ProcessingCard;