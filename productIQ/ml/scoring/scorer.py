class ProductScorer:

    def calculate(
        self,
        product,
        classification,
        validation
    ):
        completeness_fields = [
            "name",
            "sku",
            "brand",
            "product_type",
            "category",
            "description",
            "material"
        ]

        filled = 0
        for field in completeness_fields:
            # Check standard and legacy field names
            val = (
                product.get(field)
                or product.get(f"Mfg_Part_Num" if field == "sku" else "")
                or product.get(f"Part_Desc" if field == "description" else "")
            )
            if val and str(val).strip():
                filled += 1

        completeness = min(100.0, (filled / len(completeness_fields)) * 100)

        confidence_val = classification.get("confidence", 0.85)
        if confidence_val <= 1.0:
            classification_score = confidence_val * 100
        else:
            classification_score = confidence_val

        if isinstance(validation, dict):
            validation_score = validation.get(
                "score",
                100 if validation.get("valid") else max(60, 100 - len(validation.get("issues", [])) * 10)
            )
        else:
            validation_score = 90.0

        final_score = (
            completeness * 0.40
            + classification_score * 0.35
            + validation_score * 0.25
        )

        return {
            "completeness": round(completeness, 2),
            "classification_confidence": round(classification_score, 2),
            "validation_score": round(validation_score, 2),
            "product_intelligence_score": round(min(final_score, 98.0), 2)
        }