const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    attribute: { type: String, required: true },
    value: { type: String, required: true },
    source: { type: String, required: true },
  },
  { _id: false }
);

const validationSchema = new mongoose.Schema(
  {
    score: { type: Number, default: 90 },
    attributeConsistency: { type: String, default: "Passed" },
    technicalSpecification: { type: String, default: "Passed" },
    missingInformation: { type: Number, default: 0 },
    potentialConflicts: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      default: "Industrial Equipment",
      trim: true,
    },
    manufacturer: {
      type: String,
      default: "",
      trim: true,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    product_type: {
      type: String,
      default: "",
      trim: true,
    },
    material: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
    },
    mobileDescription: {
      type: String,
      default: "",
    },
    technicalData: {
      type: String,
      default: "",
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    confidence: {
      type: Number,
      default: 85,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["Validated", "Needs Review", "Review", "Rejected", "Pending"],
      default: "Needs Review",
    },
    reviewReason: {
      type: String,
      default: "",
    },
    flaggedAttribute: {
      type: String,
      default: "",
    },
    flaggedValue: {
      type: String,
      default: "",
    },
    validation: {
      type: validationSchema,
      default: () => ({}),
    },
    evidence: {
      type: [evidenceSchema],
      default: [],
    },
    entities: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        // Convert Map attributes to plain object if needed
        if (ret.attributes instanceof Map) {
          ret.attributes = Object.fromEntries(ret.attributes);
        }
        return ret;
      },
    },
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;