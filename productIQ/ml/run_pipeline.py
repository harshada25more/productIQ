import os
import sys
import json
import pandas as pd

sys.path.append(
    os.path.dirname(os.path.abspath(__file__))
)

from preprocessing.preprocess import (
    preprocess_dataframe
)

from pipeline.pipeline import ProductPipeline


INPUT_FILE = "data/input.csv"
OUTPUT_FILE = "data/ml_predictions.csv"


def main():

    print("Loading dataset...")

    df = pd.read_csv(INPUT_FILE)

    print(
        f"Loaded {len(df)} products."
    )

    df = preprocess_dataframe(df)

    pipeline = ProductPipeline()

    # Train classifier once using all available
    # product descriptions.
    texts = df["product_text"].tolist()

    print("Training classifier...")

    result = pipeline.classifier.train(texts)

    print(
        "Classifier classes:",
        result["classes"]
    )

    results = []

    print("Running pipeline...")

    for index, row in df.iterrows():

        result = pipeline.process(row)

        product = result["product"]

        output = {
            "Mfg_Part_Num":
                row["Mfg_Part_Num"],

            "Part_Desc":
                row["Part_Desc"],

            "Brand":
                product["brand"],

            "Product_Type":
                product["product_type"],

            "Category":
                product["category"],

            "Classification_Confidence":
                result[
                    "classification"
                ]["confidence"],

            "Product_Intelligence_Score":
                result[
                    "score"
                ]["product_intelligence_score"],

            "Validation_Status":
                result[
                    "validation"
                ]["valid"],

            "Attributes":
                json.dumps(
                    product["attributes"]
                )
        }

        results.append(output)

        if (index + 1) % 100 == 0:

            print(
                f"Processed {index + 1}/{len(df)}"
            )

    output_df = pd.DataFrame(results)

    output_df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print()
    print("Pipeline completed.")
    print(
        "Output:",
        OUTPUT_FILE
    )


if __name__ == "__main__":
    main()