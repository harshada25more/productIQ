import re


class ProductValidator:

    def validate_attribute(self, label, value, uom=""):
        value_str = str(value or "").strip()

        if not value_str:
            return {
                "valid": False,
                "reason": f"Empty value for {label}"
            }

        allowed_units = {
            "V", "VOLT", "VOLTS", "A", "AMP", "AMPS", "IN", "MM", "CM",
            "DBA", "KG", "LB", "W", "KW", "HP", "HZ", "BAR", "PSI",
            "L/MIN", "GPM", "RPM", "C", "F"
        }

        if uom and uom.upper() not in allowed_units:
            return {
                "valid": False,
                "reason": f"Unknown unit: {uom}"
            }

        return {
            "valid": True,
            "reason": ""
        }

    def validate(self, product):
        issues = []

        # Check part number or name
        if not product.get("Mfg_Part_Num") and not product.get("sku") and not product.get("name"):
            issues.append({
                "field": "name/sku",
                "issue": "Missing product identifier or name"
            })

        # Check description
        if not product.get("Part_Desc") and not product.get("description"):
            issues.append({
                "field": "description",
                "issue": "Missing product description"
            })

        raw_attributes = product.get("attributes", {})

        # Handle both dictionary {"Brand": "3M"} and list [{"label": "Brand", "value": "3M"}]
        if isinstance(raw_attributes, dict):
            for label, value in raw_attributes.items():
                result = self.validate_attribute(label, value)
                if not result["valid"]:
                    issues.append({
                        "field": label,
                        "issue": result["reason"]
                    })
        elif isinstance(raw_attributes, list):
            for attr in raw_attributes:
                if isinstance(attr, dict):
                    label = attr.get("label", "Attribute")
                    val = attr.get("value", "")
                    uom = attr.get("uom", "")
                    result = self.validate_attribute(label, val, uom)
                    if not result["valid"]:
                        issues.append({
                            "field": label,
                            "issue": result["reason"]
                        })

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "score": max(100 - len(issues) * 10, 60),
            "attributeConsistency": "Passed" if len(issues) == 0 else "Warning",
            "technicalSpecification": "Passed",
            "missingInformation": len(issues),
            "potentialConflicts": 0 if len(issues) == 0 else 1
        }