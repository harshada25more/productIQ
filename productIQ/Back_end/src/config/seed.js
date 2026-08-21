const User = require("../models/userModel");
const Product = require("../models/productModel");

const seedDatabase = async (force = false) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0 || force) {
      console.log("Seeding default demo users...");
      await User.deleteMany({});
      await User.create([
        {
          name: "Admin User",
          email: "admin@productiq.ai",
          password: "password123",
          role: "Admin",
        },
        {
          name: "Harshada More",
          email: "harshada@productiq.ai",
          password: "password123",
          role: "Catalog Manager",
        },
        {
          name: "Reviewer Team",
          email: "reviewer@productiq.ai",
          password: "password123",
          role: "Reviewer",
        },
      ]);
      console.log("Demo users created.");
    }

    const productCount = await Product.countDocuments();
    if (productCount <= 6 || force) {
      console.log("Seeding rich industrial and commercial catalog from dataset...");
      await Product.deleteMany({});

      const richProducts = [
        {
          name: "FRIGIDAIRE® Professional Series PDSH4816AF Dishwasher With CleanBoost™",
          sku: "PDSH4816AF",
          category: "Appliances",
          manufacturer: "Rheem Manufacturing",
          brand: "FRIGIDAIRE®",
          product_type: "Built-In Dishwasher",
          material: "Stainless Steel",
          price: 999,
          description: "FRIGIDAIRE® Dishwasher With CleanBoost™, Professional Series, 5 Wash Cycles, 120 V, 15 A, Leg Mounting, 24 in W x 24-1/4 in D, 50-1/4 in Depth With Door Open, 47 dBA Sound Level.",
          shortDescription: "FRIGIDAIRE® Professional Series PDSH4816AF Dishwasher With CleanBoost™, Leg Mounting, 5-Wash Cycle, Stainless Steel",
          mobileDescription: "Rheem Manufacturing FRIGIDAIRE, Dishwasher, Professional Series, PDSH4816AF",
          invoiceDescription: "DISHWASHER LEG 5 SST 120V 15A 50-1/4IN",
          marketingDescription: "Professional Series Dishwasher with CleanBoost™ technology delivering maximum wash performance and quiet 47 dBA operation.",
          confidence: 96,
          status: "Validated",
          features: [
            "With CleanBoost™ powerful wash system",
            "ENERGY STAR® Certified for high energy efficiency",
            "Ultra-quiet 47 dBA Sound Level operation",
            "5-Wash Cycle versatile performance",
            "Durable 304 Stainless Steel interior and exterior"
          ],
          attributes: {
            "Series": "Professional Series",
            "Number of Wash Cycles": "5",
            "Voltage Rating": "120 V",
            "Amperage Rating": "15 A",
            "Mounting Type": "Leg Mounting",
            "Size": "24 in W x 24-1/4 in D",
            "Depth With Door Open": "50-1/4 in",
            "Sound Level": "47 dBA",
            "Material": "Stainless Steel",
            "Annual Energy": "240 kW-hr",
            "Application": "Kitchen Appliances"
          },
          validation: {
            score: 96,
            attributeConsistency: "Passed",
            technicalSpecification: "Passed",
            missingInformation: 0,
            potentialConflicts: 0
          },
          evidence: [
            { source: "Frigidaire Technical Specs", attribute: "Sound Level", value: "47 dBA" },
            { source: "ENERGY STAR Guide", attribute: "Voltage Rating", value: "120 V" },
            { source: "Manufacturer Datasheet", attribute: "Material", value: "Stainless Steel" }
          ]
        },
        {
          name: "Whirlpool® Eco Series WDTS7024RZ Dishwasher with 3rd Rack",
          sku: "WDTS7024RZ",
          category: "Appliances",
          manufacturer: "Whirlpool Corporation",
          brand: "Whirlpool®",
          product_type: "Built-In Dishwasher",
          material: "Stainless Steel",
          price: 849,
          description: "Whirlpool® Dishwasher, Eco Series, 120 V, 10 A, Built-in Mounting, 33-7/16 in H x 23-7/8 in W x 22-5/8 in D, 41 dBA Sound Level, Stainless Steel.",
          shortDescription: "Whirlpool® Eco Series WDTS7024RZ Dishwasher, Built-in Mounting, Stainless Steel",
          mobileDescription: "Whirlpool, Dishwasher, Eco Series, WDTS7024RZ, Built-in Mounting",
          invoiceDescription: "DISHWASHER BLTLN SST SST 120V 10A 41DBA",
          marketingDescription: "Load more and run less with our quietest and largest capacity dishwasher with dedicated 3rd Rack.",
          confidence: 94,
          status: "Validated",
          features: [
            "3rd rack with extra wash action for mugs and bowls",
            "Adjustable 2nd Rack accommodates large pots",
            "Ultra-quiet 41 dBA Sound Level",
            "Leak Detection System with auto shutoff",
            "Sani Rinse Option eliminates 99.9% of bacteria"
          ],
          attributes: {
            "Series": "Eco Series",
            "Voltage Rating": "120 V",
            "Amperage Rating": "10 A",
            "Mounting Type": "Built-in",
            "Size": "33-7/16 in H x 23-7/8 in W",
            "Sound Level": "41 dBA",
            "Material": "Stainless Steel",
            "Application": "Built-In Dishwashers"
          },
          validation: {
            score: 94,
            attributeConsistency: "Passed",
            technicalSpecification: "Passed",
            missingInformation: 0,
            potentialConflicts: 0
          },
          evidence: [
            { source: "Whirlpool Official Datasheet", attribute: "Sound Level", value: "41 dBA" },
            { source: "UL Standards Certificate", attribute: "Voltage Rating", value: "120 V" }
          ]
        },
        {
          name: "3M 775L Stikit Film P150 - Cubitron II 50 Disc/Box",
          sku: "3MABR-7100075678",
          category: "Abrasives & Cutting",
          manufacturer: "Jam Industrial Supply LLC (JAMIN)",
          brand: "3M",
          product_type: "Abrasive Disc",
          material: "Cubitron II Film",
          price: 65,
          description: "Precision-shaped ceramic abrasive grain film discs engineered for fast cutting and uniform finish in industrial grinding.",
          shortDescription: "3M 775L Stikit Film P150 Cubitron II (50 Disc/Box)",
          mobileDescription: "3M, Cubitron II Film, P150, 50 Discs",
          invoiceDescription: "3M 775L STIKIT FILM P150 50BX",
          marketingDescription: "Revolutionary 3M Cubitron II precision-shaped grain technology slices through metal faster and lasts up to twice as long.",
          confidence: 95,
          status: "Validated",
          features: [
            "3M Precision-Shaped Grain continuously fractures into sharp points",
            "Film backing provides uniform finish and high tear resistance",
            "Stikit adhesive backing allows quick and secure disc attachment",
            "Cuts 30% faster than conventional premium ceramic abrasives"
          ],
          attributes: {
            "Brand": "3M",
            "Product Type": "Abrasive Disc",
            "Mineral Material": "Cubitron II Ceramic",
            "Backing Material": "Film",
            "Grit": "P150",
            "Package Quantity": "50 Discs/Box",
            "Attachment Type": "Stikit Adhesive Backing",
            "Application": "Metal Grinding & Finishing"
          },
          validation: {
            score: 95,
            attributeConsistency: "Passed",
            technicalSpecification: "Passed",
            missingInformation: 0,
            potentialConflicts: 0
          },
          evidence: [
            { source: "3M Abrasives Product Guide", attribute: "Mineral Material", value: "Cubitron II Ceramic" },
            { source: "Package Specification", attribute: "Grit", value: "P150" }
          ]
        },
        {
          name: 'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc',
          sku: "DCB518ASTS06G",
          category: "Abrasives & Cutting",
          manufacturer: "Freud Inc (2435)",
          brand: "Diablo",
          product_type: "Sanding Belt",
          material: "Zirconia Alumina",
          price: 24,
          description: "Premium file sanding belts designed for metal fabrication, weld leveling, and heavy material removal.",
          shortDescription: 'Diablo 1/2"x18" Sanding Belt 6-Pack (DCB518ASTS06G)',
          mobileDescription: 'Diablo, Sanding Belt, 1/2" x 18", 6pc',
          invoiceDescription: 'DIABLO SAND BELT 1/2X18 6PK',
          marketingDescription: "Diablo file sanding belts feature high-performance zirconia alumina blend for rapid stock removal.",
          confidence: 91,
          status: "Validated",
          features: [
            "Premium Zirconia Alumina abrasive blend",
            "Heavy-duty cloth backing resists tearing",
            "Precision flush joint prevents gouging on workpieces"
          ],
          attributes: {
            "Brand": "Diablo",
            "Product Type": "Sanding Belt",
            "Dimensions": '1/2" x 18"',
            "Package Quantity": "6 Belts/Pack",
            "Material": "Zirconia Alumina",
            "Joint Type": "Lap Joint",
            "Application": "Metal Grinding & Blending"
          },
          validation: {
            score: 91,
            attributeConsistency: "Passed",
            technicalSpecification: "Passed",
            missingInformation: 0,
            potentialConflicts: 0
          },
          evidence: [
            { source: "Diablo Catalog", attribute: "Dimensions", value: '1/2" x 18"' }
          ]
        },
        {
          name: 'DBD090094101F Diablo 9" - Metal Cut-Off Disc',
          sku: "DBD090094101F",
          category: "Abrasives & Cutting",
          manufacturer: "Freud Inc (2435)",
          brand: "Diablo",
          product_type: "Metal Cut-Off Disc",
          material: "Aluminum Oxide",
          price: 15,
          description: 'Premium thin kerf metal cut-off disc engineered for fast, burr-free cuts in angle irons, stainless steel, and rebar.',
          shortDescription: 'Diablo 9" Metal Cut-Off Disc (DBD090094101F)',
          mobileDescription: 'Diablo, Cut-Off Disc, 9" Diameter',
          invoiceDescription: 'DIABLO 9IN CUT OFF DISC 1PK',
          marketingDescription: 'Maximum performance cutting wheel with dual fiberglass reinforcement for extreme safety and speed.',
          confidence: 93,
          status: "Validated",
          features: [
            "Thin kerf design for fast, clean cuts",
            "Reinforced dual fiberglass mesh for operator safety",
            "Formulated for ferrous metals, steel, and stainless steel"
          ],
          attributes: {
            "Brand": "Diablo",
            "Product Type": "Metal Cut-Off Disc",
            "Diameter": '9"',
            "Material": "Aluminum Oxide",
            "Max Speed": "6600 RPM",
            "Application": "Metal & Rebar Cutting"
          },
          validation: {
            score: 93,
            attributeConsistency: "Passed",
            technicalSpecification: "Passed",
            missingInformation: 0,
            potentialConflicts: 0
          },
          evidence: [
            { source: "Freud Diablo Specifications", attribute: "Diameter", value: '9"' }
          ]
        },
        {
          name: "Industrial Hydraulic Pump HP-2400",
          sku: "HP-2400",
          category: "Hydraulic Equipment",
          manufacturer: "Industrial Systems Ltd.",
          brand: "Industrial Systems",
          product_type: "Hydraulic Pump",
          material: "Stainless Steel 316",
          price: 1450,
          description: "High-performance axial piston hydraulic pump engineered for 250 bar continuous pressure in industrial machinery.",
          shortDescription: "Industrial Systems Hydraulic Pump (HP-2400) - Stainless Steel",
          mobileDescription: "Industrial Systems, Hydraulic Pump, Stainless Steel, 250 bar",
          invoiceDescription: "HYD PUMP HP-2400 250BAR 120LPM",
          marketingDescription: "Heavy-duty hydraulic fluid power pump designed for extended duty cycles and high operating efficiency.",
          confidence: 96,
          status: "Validated",
          features: [
            "Operating pressure up to 250 bar continuous",
            "High flow rate delivery of 120 L/min",
            "316 Stainless steel corrosion-resistant body",
            "Integrated pressure relief valve"
          ],
          attributes: {
            "Product Type": "Hydraulic Pump",
            "Material": "Stainless Steel 316",
            "Operating Pressure": "250 bar",
            "Flow Rate": "120 L/min",
            "Power Rating": "5.5 kW",
            "Operating Temperature": "-20°C to 80°C",
            "Application": "Industrial Machinery"
          },
          validation: {
            score: 96,
            attributeConsistency: "Passed",
            technicalSpecification: "Passed",
            missingInformation: 0,
            potentialConflicts: 0
          },
          evidence: [
            { source: "ISO 4409 Hydraulic Standards", attribute: "Operating Pressure", value: "250 bar" },
            { source: "Factory Flow Bench Test", attribute: "Flow Rate", value: "120 L/min" }
          ]
        },
        {
          name: "Electric Motor 5HP Induction Three-Phase",
          sku: "EM-500",
          category: "Electric Motors",
          manufacturer: "ElectroDrives Corp",
          brand: "ElectroDrives",
          product_type: "Electric Motor",
          material: "Cast Iron",
          price: 890,
          description: "Heavy-duty three-phase induction electric motor suitable for conveyor systems and industrial blowers.",
          shortDescription: "ElectroDrives 5HP 3-Phase Electric Motor (EM-500)",
          mobileDescription: "ElectroDrives, Induction Motor, 5HP, 415V",
          invoiceDescription: "MOTOR IND 5HP 3PH 415V IP55",
          confidence: 74,
          status: "Needs Review",
          reviewReason: "Conflicting operating voltage ratings found across vendor datasheets (380V vs 415V).",
          flaggedAttribute: "Operating Voltage",
          flaggedValue: "415V",
          features: [
            "5 HP (3.7 kW) continuous duty output",
            "Totally Enclosed Fan Cooled (TEFC) IP55 enclosure",
            "Class F insulation with Class B temperature rise"
          ],
          attributes: {
            "Product Type": "Induction Motor",
            "Power Rating": "5 HP (3.7 kW)",
            "Operating Voltage": "415V 3-Phase",
            "Speed": "1450 RPM",
            "Frame Size": "112M",
            "Enclosure": "IP55 TEFC",
            "Application": "Industrial Drives"
          },
          validation: {
            score: 74,
            attributeConsistency: "Warning",
            technicalSpecification: "Passed",
            missingInformation: 1,
            potentialConflicts: 1
          },
          evidence: [
            { source: "ElectroDrives Catalog", attribute: "Power Rating", value: "5 HP" },
            { source: "Datasheet Ver 2.1", attribute: "Operating Voltage", value: "415V" }
          ]
        },
        {
          name: "FlowTech Stainless Steel Control Valve SV-110",
          sku: "SV-110",
          category: "Industrial Valves",
          manufacturer: "FlowTech Engineering",
          brand: "FlowTech",
          product_type: "Stainless Steel Valve",
          material: "316 Stainless Steel",
          price: 450,
          description: "Corrosion-resistant stainless steel control valve for chemical, oil & gas, and manufacturing pipelines.",
          shortDescription: "FlowTech 316 Stainless Steel Valve (SV-110)",
          mobileDescription: "FlowTech, Valve, 316 Stainless Steel, 40 bar",
          invoiceDescription: "VALVE 316SST 2IN FLANGED 40BAR",
          confidence: 91,
          status: "Validated",
          features: [
            "316 Stainless Steel forged body",
            "Pressure rating up to 40 bar",
            "PTFE high-temperature leak-proof seat"
          ],
          attributes: {
            "Product Type": "Control Valve",
            "Material": "316 Stainless Steel",
            "Operating Pressure": "40 bar",
            "Connection Size": '2" Flanged',
            "Operating Temperature": "-40°C to 200°C",
            "Application": "Pipeline Flow Control"
          },
          validation: {
            score: 91,
            attributeConsistency: "Passed",
            technicalSpecification: "Passed",
            missingInformation: 0,
            potentialConflicts: 0
          },
          evidence: [
            { source: "ASME B16.34 Specification", attribute: "Operating Pressure", value: "40 bar" }
          ]
        },
        {
          name: "Pressure Sensor Transmitter PS-890",
          sku: "PS-890",
          category: "Sensors & Instrumentation",
          manufacturer: "SensorTech Industries",
          brand: "SensorTech",
          product_type: "Pressure Sensor",
          material: "Stainless Steel 304",
          price: 320,
          description: "High-accuracy piezoresistive pressure transmitter with 4-20mA analog output.",
          shortDescription: "SensorTech Pressure Transmitter (PS-890) - 0-100 bar",
          mobileDescription: "SensorTech, Pressure Sensor, 4-20mA, 0-100 bar",
          invoiceDescription: "SENSOR PRESS 4-20MA 0-100BAR",
          confidence: 88,
          status: "Validated",
          features: [
            "Piezoresistive silicon sensing element",
            "Standard 4-20mA two-wire output",
            "Wide temperature compensation"
          ],
          attributes: {
            "Product Type": "Pressure Transmitter",
            "Pressure Range": "0 - 100 bar",
            "Output Signal": "4 - 20 mA",
            "Accuracy": "±0.5% FSO",
            "Supply Voltage": "12 - 36 V DC",
            "Operating Temperature": "-30°C to 85°C"
          },
          validation: {
            score: 88,
            attributeConsistency: "Passed",
            technicalSpecification: "Passed",
            missingInformation: 0,
            potentialConflicts: 0
          },
          evidence: [
            { source: "SensorTech Specifications", attribute: "Accuracy", value: "±0.5% FSO" }
          ]
        }
      ];

      await Product.create(richProducts);
      console.log(`Successfully populated database with ${richProducts.length} verified products.`);
    }
  } catch (err) {
    console.error("Error seeding database:", err.message);
  }
};

module.exports = seedDatabase;
