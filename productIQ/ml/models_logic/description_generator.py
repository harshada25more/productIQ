import re


class DescriptionGenerator:

    def generate_short_description(
        self,
        brand,
        product_type,
        part_number,
        original_description,
        attributes=None
    ):
        attributes = attributes or {}
        parts = []

        brand_clean = brand if brand and not brand.startswith("--") else ""
        if brand_clean:
            parts.append(brand_clean)

        series = attributes.get("Series")
        if series:
            parts.append(series)

        if part_number:
            parts.append(part_number)

        if product_type:
            parts.append(product_type)

        with_features = attributes.get("With") or attributes.get("Special Features")
        if with_features:
            parts.append(f"With {with_features}")

        if attributes.get("Mounting Type"):
            mt = str(attributes["Mounting Type"])
            parts.append(mt if "Mounting" in mt else f"{mt} Mounting")

        if attributes.get("Number of Wash Cycles"):
            parts.append(f"{attributes['Number of Wash Cycles']}-Wash Cycle")

        if attributes.get("Material"):
            parts.append(f"{attributes['Material']}")
        elif attributes.get("Grit"):
            parts.append(f"{attributes['Grit']}")

        if attributes.get("Sound Level"):
            parts.append(f"{attributes['Sound Level']}")
        elif attributes.get("Operating Pressure"):
            parts.append(f"{attributes['Operating Pressure']}")
        elif attributes.get("Power"):
            parts.append(f"{attributes['Power']}")

        if not parts:
            return original_description or "Commercial Product"

        return ", ".join([p for p in parts if p]).strip()

    def generate_mobile_description(
        self,
        brand,
        product_type,
        part_number,
        attributes=None
    ):
        attributes = attributes or {}
        parts = []

        brand_clean = brand if brand and not brand.startswith("--") else "Industrial Pro"
        parts.append(brand_clean)

        if product_type:
            parts.append(product_type)

        series = attributes.get("Series")
        if series:
            parts.append(series)

        if part_number:
            parts.append(part_number)

        if attributes.get("Mounting Type"):
            mt = str(attributes["Mounting Type"])
            parts.append(mt if "Mounting" in mt else f"{mt} Mounting")

        if attributes.get("Material"):
            parts.append(attributes["Material"])

        spec = (
            attributes.get("Sound Level")
            or attributes.get("Operating Pressure")
            or attributes.get("Power")
            or attributes.get("Voltage Rating")
            or attributes.get("Voltage")
            or attributes.get("Grit")
            or attributes.get("Size")
            or attributes.get("Dimensions")
        )
        if spec:
            parts.append(str(spec))

        return ", ".join(parts)

    def generate_invoice_description(
        self,
        brand,
        product_type,
        part_number,
        attributes=None
    ):
        attributes = attributes or {}
        tokens = []

        if product_type:
            tokens.append(re.sub(r"[^A-Za-z0-9]", "", product_type[:10]).upper())

        if attributes.get("Mounting Type"):
            mt = attributes["Mounting Type"].upper()
            tokens.append("BLTLN" if "BUILT" in mt else "LEG" if "LEG" in mt else mt[:5])

        if attributes.get("Number of Wash Cycles"):
            tokens.append(f"{attributes['Number of Wash Cycles']}CYC")

        if attributes.get("Material"):
            mat = attributes["Material"].upper()
            tokens.append("SST" if "STAINLESS" in mat else mat[:4])

        if attributes.get("Voltage Rating") or attributes.get("Voltage"):
            v = str(attributes.get("Voltage Rating") or attributes.get("Voltage")).upper().replace(" ", "")
            tokens.append(v)

        if attributes.get("Amperage Rating") or attributes.get("Amperage"):
            a = str(attributes.get("Amperage Rating") or attributes.get("Amperage")).upper().replace(" ", "")
            tokens.append(a)

        if attributes.get("Sound Level"):
            tokens.append(str(attributes["Sound Level"]).upper().replace(" ", ""))
        elif attributes.get("Operating Pressure"):
            tokens.append(str(attributes["Operating Pressure"]).upper().replace(" ", ""))
        elif attributes.get("Grit"):
            tokens.append(str(attributes["Grit"]).upper().replace(" ", ""))

        invoice_str = " ".join(tokens)[:35]
        return invoice_str if invoice_str else (part_number or "PRODUCT")[:35].upper()

    def generate_long_description(
        self,
        brand,
        product_type,
        part_number,
        original_description,
        attributes=None,
        category=""
    ):
        attributes = attributes or {}
        brand_name = brand if brand and not brand.startswith("--") else "Industrial Pro"
        material = attributes.get("Material", "industrial grade alloy")

        specs_list = []
        for k, v in attributes.items():
            if k not in ["Brand", "Product Type", "Application"]:
                specs_list.append(f"{k}: {v}")

        specs_str = ", ".join(specs_list) if specs_list else "Precision engineered specifications"

        return (
            f"{brand_name}® {product_type}, {attributes.get('Series', 'Professional Series')}, "
            f"engineered with premium {material} for maximum reliability in {category or 'commercial & industrial'} environments. "
            f"Key technical specifications: {specs_str}."
        )

    def generate_features(self, brand, product_type, attributes=None):
        attributes = attributes or {}
        brand_clean = brand if brand and not brand.startswith("--") else "Industrial Pro"

        features = [
            f"Heavy-duty construction optimized for continuous commercial and industrial use",
            f"Engineered by {brand_clean} to meet stringent performance and safety standards"
        ]

        if attributes.get("Material"):
            features.append(f"Crafted from premium {attributes['Material']} for superior wear and corrosion resistance")

        if attributes.get("Sound Level"):
            features.append(f"Ultra-quiet acoustic insulation rated at {attributes['Sound Level']}")

        if attributes.get("Number of Wash Cycles"):
            features.append(f"{attributes['Number of Wash Cycles']} programmable wash cycles for versatile cleaning performance")

        if attributes.get("Operating Pressure"):
            features.append(f"High-pressure hydraulic rating up to {attributes['Operating Pressure']}")

        if attributes.get("Voltage Rating") or attributes.get("Voltage"):
            volt = attributes.get("Voltage Rating") or attributes.get("Voltage")
            amp = attributes.get("Amperage Rating") or attributes.get("Amperage") or ""
            features.append(f"Electrical rating: {volt} {amp}".strip())

        if attributes.get("Grit"):
            features.append(f"Precision abrasive grain structure with {attributes['Grit']} finish rating")

        if attributes.get("Size") or attributes.get("Dimensions"):
            dims = attributes.get("Size") or attributes.get("Dimensions")
            features.append(f"Standard mounting dimensions: {dims}")

        if attributes.get("With"):
            features.append(f"Integrated with {attributes['With']}")

        features.append("Commerce-ready catalog asset with verified dimensional accuracy")
        return features[:10]

    def generate(
        self,
        brand,
        product_type,
        part_number,
        original_description,
        attributes=None,
        category=""
    ):
        attributes = attributes or {}

        short_desc = self.generate_short_description(
            brand, product_type, part_number, original_description, attributes
        )
        mobile_desc = self.generate_mobile_description(
            brand, product_type, part_number, attributes
        )
        invoice_desc = self.generate_invoice_description(
            brand, product_type, part_number, attributes
        )
        long_desc = self.generate_long_description(
            brand, product_type, part_number, original_description, attributes, category
        )
        features = self.generate_features(brand, product_type, attributes)

        return {
            "SHORT_DESC": short_desc,
            "MOBILE_DESC": mobile_desc,
            "INVOICE_DESC": invoice_desc,
            "LONG_DESC1": long_desc,
            "RETAIL_DESC": short_desc,
            "MARKETING_DESCRIPTION": long_desc,
            "features": features
        }