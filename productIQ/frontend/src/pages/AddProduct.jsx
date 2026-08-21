import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Sparkles,
  AlertCircle,
  Wand2,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import EnrichmentPanel from "../components/ai/EnrichmentPanel";
import { enrichProduct, batchEnrichProducts } from "../services/api";

function AddProduct() {
  const navigate = useNavigate();

  const [activeMode, setActiveMode] = useState("single"); // "single", "batch"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Single Product Form
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    manufacturer: "",
    description: "",
    technicalData: "",
  });

  // Batch CSV State
  const [parsedItems, setParsedItems] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEnrich = async () => {
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!formData.description.trim() && !formData.technicalData.trim()) {
      setError("Please enter a product description or technical information for AI extraction.");
      return;
    }

    setLoading(true);

    try {
      const result = await enrichProduct({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category.trim(),
        manufacturer: formData.manufacturer.trim(),
        description: formData.description.trim(),
        technicalData: formData.technicalData.trim(),
      });

      const productId = result?.product?.id || result?.product?._id;

      if (!productId) {
        throw new Error("Product was enriched, but no product ID was returned.");
      }

      navigate(`/products/${productId}`, {
        state: {
          enrichmentResult: result,
        },
      });
    } catch (err) {
      console.error("AI Enrichment Error:", err);
      setError(
        err.message ||
          "Something went wrong while enriching the product. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // CSV File Upload & Parser
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setError("CSV file appears to be empty or missing data rows.");
          return;
        }

        // Basic CSV header parser
        const header = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim());
        const items = [];

        for (let i = 1; i < Math.min(lines.length, 50); i++) {
          // Match commas not inside quotes
          const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) =>
            c.replace(/^["']|["']$/g, "").trim()
          );

          const item = {};
          header.forEach((h, idx) => {
            item[h] = cols[idx] || "";
          });

          const name = item.name || item.Part_Desc || item.SHORT_DESC || item.Product_Name || `Product #${i}`;
          const sku = item.sku || item.Mfg_Part_Num || item.PART_NUMBER || "";
          const manufacturer = item.manufacturer || item.Part_Manuf || item.E1_Brand || "";
          const description = item.description || item.Part_Desc || item.LONG_DESC1 || "";

          items.push({
            name,
            sku,
            manufacturer,
            description,
            raw: item,
          });
        }

        setParsedItems(items);
        setToast(`Parsed ${items.length} items from ${file.name}! Ready to enrich.`);
        setTimeout(() => setToast(""), 4000);
      } catch (err) {
        setError("Failed to parse CSV file. Please verify CSV formatting.");
      }
    };
    reader.readAsText(file);
  };

  const handleBatchEnrichSubmit = async () => {
    if (parsedItems.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await batchEnrichProducts(parsedItems);
      if (res?.success) {
        navigate("/products", {
          state: { toast: `Successfully enriched ${res.count} products from CSV!` },
        });
      }
    } catch (err) {
      setError(err.message || "Failed to batch enrich products.");
    } finally {
      setLoading(false);
    }
  };

  const handleSampleFill = (type) => {
    if (type === "appliance") {
      setFormData({
        name: "FRIGIDAIRE® Professional Series PDSH4816AF Dishwasher",
        sku: "PDSH4816AF",
        category: "Appliances",
        manufacturer: "Rheem Manufacturing",
        description: "Professional Series 5-Wash Cycle Dishwasher with CleanBoost™ technology, Stainless Steel finish.",
        technicalData: "120 V, 15 A, 47 dBA Sound Level, 24 in W x 24-1/4 in D x 50-1/4 in Depth Open, 240 kW-hr annual energy, Leg mounting, ENERGY STAR certified.",
      });
    } else if (type === "abrasive") {
      setFormData({
        name: "3M 775L Stikit Film P180 Cubitron II 50 Disc/Box",
        sku: "3MABR-7100075690",
        category: "Abrasives & Cutting",
        manufacturer: "3M",
        description: "Precision-shaped ceramic abrasive grain film discs engineered for fast cutting and uniform finish in metal fabrication.",
        technicalData: "50 Discs per Box, Grit P180, Stikit adhesive backing, Film backing material, Cubitron II ceramic grain, 5-inch diameter.",
      });
    } else if (type === "pump") {
      setFormData({
        name: "Danfoss PVG 32 Proportional Valve Group",
        sku: "PVG-32-157B",
        category: "Hydraulic Equipment",
        manufacturer: "Danfoss",
        description: "Hydraulic load sensing proportional valve group engineered for precision control in mobile machinery.",
        technicalData: "Max pressure 350 bar, Flow rate up to 130 L/min, 24V DC actuation, 316 Stainless Steel spool, Temperature -30°C to 90°C.",
      });
    } else if (type === "motor") {
      setFormData({
        name: "Siemens SIMOTICS GP 1LE1001 7.5kW",
        sku: "1LE1001-1DB23-4AA4",
        category: "Electric Motors",
        manufacturer: "Siemens",
        description: "Cast iron general purpose low-voltage three phase squirrel-cage induction motor.",
        technicalData: "7.5 kW (10 HP), 400V / 690V 50Hz, 1465 RPM, Frame size 132M, IP55 enclosure, IC411 cooling.",
      });
    } else {
      setFormData({
        name: "Honeywell STG740 Pressure Transmitter",
        sku: "STG740-E1G000",
        category: "Sensors & Instrumentation",
        manufacturer: "Honeywell",
        description: "SmartLine gage pressure transmitter with piezoresistive sensor technology.",
        technicalData: "Range 0 to 500 psi (35 bar), 4-20mA HART output, 316L Stainless Steel wetted parts, Accuracy 0.065% span, 24V DC.",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Add & Enrich Product"
        description="Provide raw product text, specifications, or upload batch CSV files for automatic AI intelligence generation."
      />

      {toast && (
        <div className="success-banner animate-fade">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}
      {error && (
        <div className="warning-banner animate-fade">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="mode-toggle-tabs">
        <button
          className={`mode-tab-btn ${activeMode === "single" ? "active" : ""}`}
          onClick={() => setActiveMode("single")}
        >
          <FileText size={17} />
          <span>Single Product Input</span>
        </button>

        <button
          className={`mode-tab-btn ${activeMode === "batch" ? "active" : ""}`}
          onClick={() => setActiveMode("batch")}
        >
          <FileSpreadsheet size={17} />
          <span>Batch CSV Ingestion</span>
        </button>
      </div>

      {activeMode === "single" ? (
        <>
          {/* Quick template bar */}
          <div className="sample-fill-bar">
            <div className="template-label">
              <Wand2 size={16} color="#6366f1" />
              <span>Quick Dataset Templates:</span>
            </div>
            <button
              type="button"
              className="chip-btn chip-emerald"
              onClick={() => handleSampleFill("appliance")}
            >
              Dishwasher Appliance
            </button>
            <button
              type="button"
              className="chip-btn chip-amber"
              onClick={() => handleSampleFill("abrasive")}
            >
              3M Cubitron Disc
            </button>
            <button
              type="button"
              className="chip-btn chip-cyan"
              onClick={() => handleSampleFill("pump")}
            >
              Hydraulic Valve
            </button>
            <button
              type="button"
              className="chip-btn chip-indigo"
              onClick={() => handleSampleFill("motor")}
            >
              Siemens Motor
            </button>
            <button
              type="button"
              className="chip-btn chip-purple"
              onClick={() => handleSampleFill("sensor")}
            >
              Pressure Sensor
            </button>
          </div>

          <div className="add-product-layout">
            <div className="form-card animate-fade">
              <div className="card-heading">
                <div>
                  <h3>Product Information</h3>
                  <p>Enter raw uncurated product title and technical datasheet text.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Industrial Hydraulic Pump or 3M Film Disc"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SKU / Part Number</label>
                  <input
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g. HP-2400 / PDSH4816AF"
                  />
                </div>

                <div className="form-group">
                  <label>Category (Optional)</label>
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Hydraulic Equipment, Appliances, Abrasives"
                  />
                </div>

                <div className="form-group">
                  <label>Manufacturer / Brand</label>
                  <input
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="e.g. 3M, Danfoss, Frigidaire, Siemens"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Product Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter raw product description or marketing copy..."
                    rows="4"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Technical Specifications & Datasheet Text</label>
                  <textarea
                    name="technicalData"
                    value={formData.technicalData}
                    onChange={handleChange}
                    placeholder="Paste technical parameters: voltage, pressure, flow rate, sound level dBA, dimensions, materials, etc."
                    rows="5"
                  />
                </div>
              </div>
            </div>

            <EnrichmentPanel
              onEnrich={handleEnrich}
              loading={loading}
            />
          </div>
        </>
      ) : (
        /* BATCH CSV UPLOAD MODE */
        <div className="batch-upload-layout animate-fade">
          <div className="form-card">
            <div className="card-heading">
              <div>
                <h3>Upload Product Catalog File</h3>
                <p>Upload a standard CSV file (like Input.csv) to extract and enrich all rows simultaneously.</p>
              </div>
            </div>

            <div className="upload-dropzone">
              <Upload size={36} color="#6366f1" />
              <strong>{fileName || "Drag & drop your CSV file here"}</strong>
              <span>Supports .csv, .txt files with column headers</span>

              <label className="primary-button" style={{ cursor: "pointer", marginTop: "12px" }}>
                Browse Files
                <input
                  type="file"
                  accept=".csv,.txt"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {parsedItems.length > 0 && (
              <div className="csv-preview-section animate-fade">
                <div className="preview-header">
                  <h4>Preview Parsed Records ({parsedItems.length})</h4>
                  <button
                    className="primary-button"
                    onClick={handleBatchEnrichSubmit}
                    disabled={loading}
                  >
                    <Sparkles size={16} />
                    <span>{loading ? "Enriching Batch..." : `Run AI Enrichment (${parsedItems.length} items)`}</span>
                  </button>
                </div>

                <div className="csv-preview-table-wrapper">
                  <table className="csv-preview-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product / Title</th>
                        <th>SKU / Part Number</th>
                        <th>Manufacturer</th>
                        <th>Description Excerpt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{item.name}</strong></td>
                          <td><code>{item.sku || "N/A"}</code></td>
                          <td>{item.manufacturer || "N/A"}</td>
                          <td><span className="text-truncate">{item.description || "N/A"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AddProduct;