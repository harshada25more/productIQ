function AttributeGrid({ attributes = {} }) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return <p style={{ color: "#64748b", fontSize: "14px", padding: "12px 0" }}>No specific attributes extracted.</p>;
  }

  const parseValueAndUom = (raw) => {
    const str = String(raw || "").trim();
    const match = str.match(/^([0-9\.\-\/]+)\s*([a-zA-Z°]+(?:\/[a-zA-Z]+)?)$/);
    if (match) {
      return { val: match[1], uom: match[2] };
    }
    return { val: str, uom: "" };
  };

  return (
    <div className="attribute-grid">
      {Object.entries(attributes).map(([key, value]) => {
        const { val, uom } = parseValueAndUom(value);

        return (
          <div className="attribute-item" key={key}>
            <span className="attribute-label">{key}</span>
            <div className="attribute-value-wrapper">
              <strong className="attribute-val">{val || "Not specified"}</strong>
              {uom && <span className="uom-pill">{uom}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AttributeGrid;