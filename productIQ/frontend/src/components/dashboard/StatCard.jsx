function StatCard({ title, value, change, icon: Icon, type = "default" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${type}`}>
        <Icon size={22} />
      </div>

      <div className="stat-content">
        <span>{title}</span>
        <h2>{value}</h2>

        {change && (
          <small className={change.startsWith("+") ? "positive" : "negative"}>
            {change}
          </small>
        )}
      </div>
    </div>
  );
}

export default StatCard;