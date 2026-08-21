import { ExternalLink } from "lucide-react";

function EvidenceList({ evidence = [] }) {
  const defaultEvidence = [
    {
      source: "Manufacturer Website",
      attribute: "Material",
      value: "Stainless Steel",
    },
    {
      source: "Technical Datasheet",
      attribute: "Operating Pressure",
      value: "250 bar",
    },
    {
      source: "Product Catalog",
      attribute: "Product Type",
      value: "Hydraulic Valve",
    },
  ];

  const data = evidence.length ? evidence : defaultEvidence;

  return (
    <div className="evidence-list">
      <div className="card-heading">
        <div>
          <h3>Evidence & Sources</h3>
          <p>Sources used by AI to generate product information.</p>
        </div>
      </div>

      {data.map((item, index) => (
        <div className="evidence-item" key={index}>
          <div>
            <strong>{item.attribute}</strong>
            <span>{item.value}</span>
          </div>

          <div className="evidence-source">
            <span>{item.source}</span>
            <ExternalLink size={15} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default EvidenceList;