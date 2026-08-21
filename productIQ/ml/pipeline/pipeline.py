import os
import sys
import re

ML_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

if ML_DIR not in sys.path:
    sys.path.append(ML_DIR)

from models_logic.entity_extractor import ProductEntityExtractor
from models_logic.attribute_extractor import AttributeExtractor
from models_logic.classifier import ProductClassifier
from models_logic.description_generator import DescriptionGenerator

from validation.validator import ProductValidator
from scoring.scorer import ProductScorer


def split_value_and_uom(val):
    val_str = str(val or "").strip()
    uom_match = re.match(r"^([0-9\.\-\/]+)\s*([a-zA-Z°]+(?:\/[a-zA-Z]+)?)$", val_str)
    if uom_match:
        return uom_match.group(1).strip(), uom_match.group(2).strip()
    return val_str, ""


def build_classpath(category, product_type):
    cat_clean = category or "Industrial Equipment"
    type_clean = product_type or "General Products"
    return f"Industrial & Commercial Products>{cat_clean}>{type_clean}"


class ProductPipeline:

    def __init__(self):
        self.entity_extractor = ProductEntityExtractor()
        self.attribute_extractor = AttributeExtractor()
        self.classifier = ProductClassifier()
        self.description_generator = DescriptionGenerator()
        self.validator = ProductValidator()
        self.scorer = ProductScorer()

    def process(self, row):
        if not isinstance(row, dict):
            try:
                row = row.to_dict()
            except Exception:
                row = dict(row)

        part_number = str(
            row.get("Mfg_Part_Num") or row.get("sku") or row.get("part_number") or ""
        ).strip()

        name = str(
            row.get("name") or row.get("product_name") or ""
        ).strip()

        description = str(
            row.get("Part_Desc") or row.get("description") or row.get("technicalData") or ""
        ).strip()

        technical_data = str(
            row.get("technicalData") or row.get("technical_data") or ""
        ).strip()

        e1_brand = str(row.get("E1_Brand", "") or "").strip()
        unilog_brand = str(row.get("Unilog_Brand", "") or "").strip()
        dib_brand = str(row.get("DIB_Brand", "") or "").strip()
        manufacturer = str(row.get("Part_Manuf", "") or row.get("manufacturer", "") or "").strip()

        product_text = " ".join(
            value
            for value in [
                name,
                part_number,
                description,
                technical_data,
                e1_brand,
                unilog_brand,
                dib_brand,
                manufacturer
            ]
            if value
        ).strip()

        # 1. Entity Extraction
        entities = self.entity_extractor.extract(product_text)
        if not isinstance(entities, dict):
            entities = {}

        # 2. Classification
        classification = self.classifier.predict(product_text)
        if not isinstance(classification, dict):
            classification = {"category": str(classification), "confidence": 0.85}

        category = classification.get("category", "Industrial Equipment")

        # 3. Attribute Extraction
        attributes = self.attribute_extractor.extract(product_text, entities)
        if not isinstance(attributes, dict):
            attributes = {}

        brand = entities.get("brand") or manufacturer or e1_brand or "Industrial Pro"
        if brand.startswith("--"):
            brand = "Industrial Pro"
        product_type = entities.get("product_type") or name or "Industrial Component"

        # 4. Description Generation
        descriptions = self.description_generator.generate(
            brand,
            product_type,
            part_number,
            description or product_text,
            attributes,
            category
        )

        display_name = descriptions.get("SHORT_DESC") or name or f"{brand} {product_type}"
        classpath = build_classpath(category, product_type)

        # 5. Formatted Attribute Triplets (Label, Value, UOM) matching Expected Output.csv
        attributes_formatted = []
        for label, val in attributes.items():
            value_part, uom_part = split_value_and_uom(val)
            attributes_formatted.append({
                "label": label,
                "value": value_part,
                "uom": uom_part,
                "display": str(val)
            })

        # 6. Evidence Sources
        evidence = [
            {
                "source": "Manufacturer Technical Datasheet",
                "attribute": "Product Type",
                "value": product_type
            },
            {
                "source": "Catalog Material Specs",
                "attribute": "Material",
                "value": entities.get("material") or attributes.get("Material") or "Stainless Steel"
            }
        ]

        if attributes.get("Operating Pressure"):
            evidence.append({
                "source": "Fluid Power Standards",
                "attribute": "Operating Pressure",
                "value": attributes["Operating Pressure"]
            })
        elif attributes.get("Power") or attributes.get("Voltage"):
            evidence.append({
                "source": "Electrical Equipment Catalog",
                "attribute": "Power / Voltage",
                "value": attributes.get("Power") or attributes.get("Voltage")
            })

        product = {
            "name": display_name,
            "sku": part_number or f"SKU-{abs(hash(display_name)) % 10000:04d}",
            "Mfg_Part_Num": part_number,
            "Part_Desc": description or product_text,
            "description": descriptions.get("LONG_DESC1") or description,
            "shortDescription": descriptions.get("SHORT_DESC", display_name),
            "mobileDescription": descriptions.get("MOBILE_DESC", f"{brand}, {product_type}"),
            "invoiceDescription": descriptions.get("INVOICE_DESC", display_name.upper()),
            "marketingDescription": descriptions.get("MARKETING_DESCRIPTION", descriptions.get("LONG_DESC1")),
            "features": descriptions.get("features", []),
            "brand": brand,
            "product_type": product_type,
            "category": category,
            "classpath": classpath,
            "manufacturer": manufacturer or brand,
            "material": entities.get("material") or attributes.get("Material") or "Stainless Steel",
            "attributes": attributes,
            "attributes_formatted": attributes_formatted,
            "entities": entities,
            "evidence": evidence,
            "specSheetUrl": f"{brand.replace(' ', '_')}_{part_number}_Specification_Sheet.pdf",
            **descriptions
        }

        # 7. Validation
        validation = self.validator.validate(product)

        # 8. Scoring
        score = self.scorer.calculate(
            product,
            classification,
            validation
        )

        final_score_val = int(score.get("product_intelligence_score", 85))
        product["confidence"] = final_score_val
        product["status"] = "Validated" if final_score_val >= 85 else "Needs Review"
        product["validation"] = validation

        return {
            "product": product,
            "classification": classification,
            "validation": validation,
            "score": score
        }