import pandas as pd

from models_logic.entity_extractor import ProductEntityExtractor
from models_logic.attribute_extractor import AttributeExtractor


INPUT_FILE = "data/Input.csv"
OUTPUT_FILE = "data/attributed_products.csv"


# -------------------------
# Load dataset
# -------------------------

df = pd.read_csv(INPUT_FILE)

entity_extractor = ProductEntityExtractor()
attribute_extractor = AttributeExtractor()

results = []


# -------------------------
# Process every product
# -------------------------

for _, row in df.iterrows():

    description = row["Part_Desc"]

    # Entity extraction
    entities = entity_extractor.extract(description)

    # Attribute extraction
    attributes = attribute_extractor.extract(
        description,
        entities
    )

    # Start with original information
    result = {
        "Mfg_Part_Num": row["Mfg_Part_Num"],
        "Part_Desc": description,
        "E1_Brand": row["E1_Brand"],
        "Unilog_Brand": row["Unilog_Brand"],
        "DIB_Brand": row["DIB_Brand"],
        "Part_Manuf": row["Part_Manuf"]
    }

    # Add extracted attributes
    result.update(attributes)

    results.append(result)


# -------------------------
# Create output dataframe
# -------------------------

output_df = pd.DataFrame(results)


# -------------------------
# Save
# -------------------------

output_df.to_csv(
    OUTPUT_FILE,
    index=False
)


print("===================================")
print("ATTRIBUTE EXTRACTION COMPLETED")
print("===================================")

print("Input products :", len(df))
print("Output products:", len(output_df))

print("\nSaved to:")
print(OUTPUT_FILE)

print("\nColumns:")
print(output_df.columns.tolist())

print("\nFirst 10 products:")
print(output_df.head(10).to_string(index=False))