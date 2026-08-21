import os
import sys

# Add root ml directory to sys.path
ML_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ML_DIR not in sys.path:
    sys.path.append(ML_DIR)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from pipeline.pipeline import ProductPipeline

app = FastAPI(
    title="ProductIQ ML Intelligence API",
    description="Backend API powered by ProductIQ ML Pipeline for NLP Extraction, Classification, and Validation",
    version="1.0.0"
)

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Initialize ML Pipeline
# --------------------------------------------------

pipeline = ProductPipeline()

# --------------------------------------------------
# In-Memory Products Store
# --------------------------------------------------

products = [
    {
        "id": 1,
        "name": "3M 775L Stikit Film P150 - Cubitron II 50 Disc/Box",
        "sku": "3M-775L-P150",
        "brand": "3M",
        "product_type": "Abrasive Disc",
        "category": "Abrasives",
        "material": "Cubitron II Film",
        "attributes": {
            "Brand": "3M",
            "Product Type": "Abrasive Disc",
            "Mineral Material": "Cubitron II Ceramic",
            "Backing Material": "Film",
            "Grit": "P150",
            "Package Quantity": "50 Discs per Box",
            "Attachment Type": "Stikit Adhesive Backing"
        },
        "confidence": 94,
        "status": "Validated",
        "description": "Precision-shaped ceramic abrasive grain film discs engineered for fast cutting.",
        "shortDescription": "3M 775L Stikit Film P150 Cubitron II (50 Disc/Box)",
        "mobileDescription": "3M, Cubitron II Film, P150, 50 Discs",
        "evidence": [
            {"source": "Manufacturer Technical Datasheet", "attribute": "Material", "value": "Cubitron II"},
            {"source": "Package Specification", "attribute": "Grit", "value": "P150"}
        ],
        "validation": {
            "score": 94,
            "attributeConsistency": "Passed",
            "technicalSpecification": "Passed",
            "missingInformation": 0,
            "potentialConflicts": 0
        }
    },
    {
        "id": 2,
        "name": 'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc',
        "sku": "DCB518ASTS06G",
        "brand": "Diablo",
        "product_type": "Sanding Belt",
        "category": "Abrasives",
        "material": "Zirconia Alumina",
        "attributes": {
            "Brand": "Diablo",
            "Product Type": "Sanding Belt",
            "Dimensions": '1/2" x 18"',
            "Quantity": "6 Belts per Pack",
            "Material": "Zirconia Alumina"
        },
        "confidence": 91,
        "status": "Validated",
        "description": "Premium file sanding belts designed for metal fabrication.",
        "shortDescription": 'Diablo 1/2"x18" Sanding Belt 6-Pack (DCB518ASTS06G)',
        "mobileDescription": 'Diablo, Sanding Belt, 1/2" x 18", 6pc',
        "evidence": [
            {"source": "Diablo Catalog", "attribute": "Dimensions", "value": '1/2" x 18"'}
        ],
        "validation": {
            "score": 91,
            "attributeConsistency": "Passed",
            "technicalSpecification": "Passed",
            "missingInformation": 0,
            "potentialConflicts": 0
        }
    }
]


# --------------------------------------------------
# Request Models
# --------------------------------------------------

class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    description: Optional[str] = None
    technicalData: Optional[str] = None


class ProductProcessRequest(BaseModel):
    Mfg_Part_Num: Optional[str] = ""
    Part_Desc: Optional[str] = ""
    name: Optional[str] = ""
    description: Optional[str] = ""
    technicalData: Optional[str] = ""
    manufacturer: Optional[str] = ""


# --------------------------------------------------
# Endpoints
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "service": "ProductIQ Python ML Intelligence API",
        "status": "online",
        "pipeline": "ProductPipeline v1.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ProductIQ Python ML Engine"
    }


@app.get("/dashboard/stats")
def dashboard_stats():
    total = len(products)
    ai_enriched = sum(1 for p in products if p.get("confidence") is not None)
    validated = sum(1 for p in products if p.get("status") == "Validated")
    needs_review = sum(1 for p in products if p.get("status") in ["Needs Review", "Review"])

    return {
        "total_products": total,
        "ai_enriched": ai_enriched,
        "validated": validated,
        "needs_review": needs_review,
        "health_score": round((validated / total) * 100) if total > 0 else 87,
        "recent_products": products[:6]
    }


@app.get("/catalog-health")
def catalog_health():
    total = len(products)
    validated = sum(1 for p in products if p.get("status") == "Validated")
    needs_review = sum(1 for p in products if p.get("status") in ["Needs Review", "Review"])

    return {
        "overall_score": 89,
        "completeness": 91,
        "accuracy": 90,
        "consistency": 85,
        "needs_review": needs_review,
        "conflicts": 1
    }


@app.get("/products")
def get_products():
    return products


@app.get("/products/{product_id}")
def get_product(product_id: int):
    for product in products:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")


@app.get("/products/search")
def search_products(q: str):
    query = q.lower()
    return [
        p for p in products
        if query in p["name"].lower()
        or query in str(p.get("sku", "")).lower()
        or query in str(p.get("brand", "")).lower()
        or query in str(p.get("category", "")).lower()
    ]


@app.post("/products/enrich")
def enrich_product(product_input: ProductCreate):
    """
    Runs the full ML intelligence pipeline on product input
    """
    raw_dict = product_input.model_dump()
    pipeline_result = pipeline.process(raw_dict)
    enriched_data = pipeline_result["product"]

    new_id = len(products) + 1
    enriched_data["id"] = new_id

    products.append(enriched_data)

    return {
        "message": "Product enriched successfully via ML Pipeline",
        "product": enriched_data,
        "classification": pipeline_result.get("classification"),
        "validation": pipeline_result.get("validation"),
        "score": pipeline_result.get("score")
    }


@app.post("/pipeline/process")
def process_pipeline(item: ProductProcessRequest):
    """
    Direct ML pipeline processing endpoint
    """
    return pipeline.process(item.model_dump())


@app.post("/pipeline/batch")
def process_pipeline_batch(items: List[ProductProcessRequest]):
    """
    Batch processing endpoint for multiple products
    """
    results = []
    for item in items:
        try:
            res = pipeline.process(item.model_dump())
            results.append(res)
        except Exception as e:
            results.append({"error": str(e), "item": item.model_dump()})
    return {"count": len(results), "results": results}


@app.get("/products/review")
def get_review_products():
    return [p for p in products if p.get("status") in ["Needs Review", "Review"]]


@app.post("/products/{product_id}/approve")
def approve_product(product_id: int):
    for product in products:
        if product["id"] == product_id:
            product["status"] = "Validated"
            product["confidence"] = max(product.get("confidence", 85), 92)
            return {"message": "Product approved", "product": product}
    raise HTTPException(status_code=404, detail="Product not found")


@app.post("/products/{product_id}/reject")
def reject_product(product_id: int):
    for product in products:
        if product["id"] == product_id:
            product["status"] = "Rejected"
            return {"message": "Product rejected", "product": product}
    raise HTTPException(status_code=404, detail="Product not found")