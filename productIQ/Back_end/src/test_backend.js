const {
  extractEntitiesFromText,
  extractAttributesFromText,
  generateProductAnalysis,
  generateDescriptions,
  enrichProductData,
} = require("./services/aiService");

async function runTests() {
  console.log("==================================================");
  console.log("   RUNNING PRODUCTIQ BACKEND & AI INTEGRATION TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Entity Extractor Tests
  console.log("\n--- 1. Testing Entity Extractor ---");
  const entityTest1 = extractEntitiesFromText("FRIGIDAIRE Professional Series PDSH4816AF Dishwasher 120V 15A 47 dBA");
  assert(entityTest1.brand.includes("FRIGIDAIRE"), "Extracts FRIGIDAIRE brand");
  assert(entityTest1.product_type === "Dishwasher", "Extracts Dishwasher product type");

  const entityTest2 = extractEntitiesFromText("3M 775L Stikit Film P180 Cubitron II 50 Disc/Box");
  assert(entityTest2.brand === "3M", "Extracts 3M brand");
  assert(entityTest2.material === "Cubitron II", "Extracts Cubitron II material");

  const entityTest3 = extractEntitiesFromText("Siemens SIMOTICS GP 1LE1001 7.5kW 1465 RPM 400V");
  assert(entityTest3.brand === "Siemens", "Extracts Siemens brand");
  assert(entityTest3.product_type === "Electric Motor", "Extracts Electric Motor product type");

  // 2. Attribute Extractor Tests
  console.log("\n--- 2. Testing Attribute Extractor ---");
  const attrTest1 = extractAttributesFromText(
    "120 V, 15 A, 47 dBA Sound Level, 24 in W x 24-1/4 in D x 50-1/4 in Depth Open, 240 kW-hr annual energy, Leg mounting, 5 Wash Cycles",
    "Dishwasher"
  );
  assert(attrTest1["Sound Level"] === "47 dBA", "Extracts 47 dBA Sound Level");
  assert(attrTest1["Number of Wash Cycles"] === "5", "Extracts 5 Wash Cycles");
  assert(attrTest1["Mounting Type"] === "Leg", "Extracts Leg Mounting Type");
  assert(attrTest1["Voltage Rating"] === "120 V", "Extracts 120 V Voltage Rating");
  assert(attrTest1["Amperage Rating"] === "15 A", "Extracts 15 A Amperage Rating");

  const attrTest2 = extractAttributesFromText(
    "50 Discs per Box, Grit P180, Stikit adhesive backing, Film backing, Cubitron II ceramic grain, 5-inch diameter",
    "Film Disc"
  );
  assert(attrTest2["Grit"] === "P180", "Extracts P180 Grit");
  assert(attrTest2["Package Quantity"] === "50 Pack/Box", "Extracts 50 Pack/Box Package Quantity");
  assert(attrTest2["Attachment Type"] === "Stikit Adhesive Backing", "Extracts Stikit Attachment Type");

  const attrTest3 = extractAttributesFromText(
    "Max pressure 350 bar, Flow rate up to 130 L/min, 24V DC actuation, 316 Stainless Steel spool, Temperature -30°C to 90°C",
    "Hydraulic Valve"
  );
  assert(attrTest3["Operating Pressure"] === "350 bar", "Extracts 350 bar Operating Pressure");
  assert(attrTest3["Flow Rate"] === "130 L/min", "Extracts 130 L/min Flow Rate");
  assert(attrTest3["Operating Temperature"] === "-30°C to 90°C", "Extracts Operating Temperature");

  // 3. Multi-tier Descriptions Test
  console.log("\n--- 3. Testing Description Generator ---");
  const desc = generateDescriptions({
    brand: "3M",
    product_type: "Film Disc",
    sku: "3M-775L-P180",
    attributes: { Grit: "P180", Material: "Cubitron II" },
  });
  assert(typeof desc.SHORT_DESC === "string" && desc.SHORT_DESC.length > 5, "Generates standard SHORT_DESC");
  assert(typeof desc.MOBILE_DESC === "string" && desc.MOBILE_DESC.length > 5, "Generates MOBILE_DESC");
  assert(typeof desc.INVOICE_DESC === "string" && desc.INVOICE_DESC.length > 3, "Generates uppercase INVOICE_DESC");
  assert(Array.isArray(desc.features) && desc.features.length >= 3, "Generates item features list");

  // 4. End-to-End Product Enrichment Pipeline
  console.log("\n--- 4. Testing Full End-to-End Enrichment ---");
  const enriched = await enrichProductData({
    name: "FRIGIDAIRE Professional Dishwasher PDSH4816AF",
    sku: "PDSH4816AF",
    category: "Appliances",
    description: "Professional Series 5-Wash Cycle Dishwasher with CleanBoost™ technology, Stainless Steel finish.",
    technicalData: "120 V, 15 A, 47 dBA Sound Level, 24 in W x 24-1/4 in D x 50-1/4 in Depth Open, 240 kW-hr, Leg mounting.",
  });
  assert(enriched.brand.includes("FRIGIDAIRE"), "Enriched brand is FRIGIDAIRE");
  assert(enriched.confidence >= 85, `Confidence score is high (${enriched.confidence}%)`);
  assert(enriched.status === "Validated", "Product status is Validated");
  assert(enriched.classpath.includes("Appliances"), "Classpath is structured hierarchy");
  assert(Object.keys(enriched.attributes).length >= 5, "Extracted >= 5 technical attributes");

  console.log("\n==================================================");
  console.log(` SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
