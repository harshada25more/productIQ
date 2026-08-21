import pandas as pd

from models_logic.entity_extractor import ProductEntityExtractor


# -------------------------
# Load input dataset
# -------------------------

input_file = "data/Input.csv"
output_file = "data/extracted_products.csv"

df = pd.read_csv(input_file)

extractor = ProductEntityExtractor()


# -------------------------
# Extract entities
# -------------------------

extracted_rows = []

for _, row in df.iterrows():

    text = row["Part_Desc"]

    result = extractor.extract(text)

    # Keep original product information
    result["Mfg_Part_Num"] = row["Mfg_Part_Num"]
    result["Part_Desc"] = row["Part_Desc"]
    result["E1_Brand"] = row["E1_Brand"]
    result["Unilog_Brand"] = row["Unilog_Brand"]
    result["DIB_Brand"] = row["DIB_Brand"]
    result["Part_Manuf"] = row["Part_Manuf"]

    extracted_rows.append(result)


# -------------------------
# Create dataframe
# -------------------------

output_df = pd.DataFrame(extracted_rows)


# -------------------------
# Save result
# -------------------------

output_df.to_csv(output_file, index=False)


print("Extraction completed successfully.")
print("Input products:", len(df))
print("Output products:", len(output_df))
print("Saved to:", output_file)


# -------------------------
# Show sample
# -------------------------

print("\nFirst 5 extracted products:\n")

print(
    output_df[
        [
            "Mfg_Part_Num",
            "brand",
            "grit",
            "quantity",
            "diameter",
            "thickness",
            "width",
            "length",
            "product_type",
            "material"
        ]
    ].head().to_string(index=False)
)