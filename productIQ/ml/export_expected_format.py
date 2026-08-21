import os
import sys
import pandas as pd
from pipeline.pipeline import ProductPipeline

INPUT_FILE = "data/Input.csv"
OUTPUT_FILE = "data/Generated_Expected_Output.csv"

def main():
    print(f"Reading {INPUT_FILE}...")
    df = pd.read_csv(INPUT_FILE)
    pipeline = ProductPipeline()

    rows = []
    for idx, r in df.iterrows():
        res = pipeline.process(r)
        prod = res["product"]

        row_dict = {
            "Mfg_Part_Num": r.get("Mfg_Part_Num", ""),
            "Part_Desc": r.get("Part_Desc", ""),
            "E1_Brand": r.get("E1_Brand", ""),
            "Unilog_Brand": r.get("Unilog_Brand", ""),
            "DIB_Brand": r.get("DIB_Brand", ""),
            "Part_Manuf": r.get("Part_Manuf", ""),
            "MANUFACTURER_NAME": prod.get("manufacturer", ""),
            "BRAND_NAME": prod.get("brand", ""),
            "Classpath": prod.get("classpath", ""),
            "MOBILE_DESC": prod.get("mobileDescription", ""),
            "INVOICE_DESC": prod.get("invoiceDescription", ""),
            "SHORT_DESC": prod.get("shortDescription", ""),
            "LONG_DESC1": prod.get("description", ""),
            "MARKETING_DESCRIPTION": prod.get("marketingDescription", ""),
            "Product Name": prod.get("name", ""),
            "Confidence": prod.get("confidence", 85),
            "Status": prod.get("status", "Validated"),
            "Specification Sheet": prod.get("specSheetUrl", "")
        }

        # Features
        features = prod.get("features", [])
        for i in range(1, 11):
            row_dict[f"ITEM_FEATURES_{i}"] = features[i - 1] if i - 1 < len(features) else ""

        # Attributes with UOM up to 10
        attrs_formatted = prod.get("attributes_formatted", [])
        for i in range(1, 11):
            if i - 1 < len(attrs_formatted):
                attr = attrs_formatted[i - 1]
                row_dict[f"ATTRIBUTE_LABEL {i}"] = attr["label"]
                row_dict[f"ATTRIBUTE_VALUE {i}"] = attr["value"]
                row_dict[f"ATTRIBUTE_UOM {i}"] = attr["uom"]
            else:
                row_dict[f"ATTRIBUTE_LABEL {i}"] = ""
                row_dict[f"ATTRIBUTE_VALUE {i}"] = ""
                row_dict[f"ATTRIBUTE_UOM {i}"] = ""

        rows.append(row_dict)

    out_df = pd.DataFrame(rows)
    out_df.to_csv(OUTPUT_FILE, index=False)
    print(f"Successfully generated {len(out_df)} products to {OUTPUT_FILE}!")

if __name__ == "__main__":
    main()
