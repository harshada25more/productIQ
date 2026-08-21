import os
import sys
import pandas as pd

sys.path.append(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

from preprocessing.preprocess import (
    preprocess_dataframe
)

from models_logic.classifier import (
    ProductClassifier
)


INPUT_FILE = "data/input.csv"


def main():

    print("Loading training data...")

    df = pd.read_csv(INPUT_FILE)

    df = preprocess_dataframe(df)

    texts = df[
        "product_text"
    ].tolist()

    print(
        f"Training with {len(texts)} products..."
    )

    classifier = ProductClassifier()

    result = classifier.train(texts)

    print()
    print("Training complete.")

    print(
        "Number of samples:",
        result["samples"]
    )

    print(
        "Classes:",
        result["classes"]
    )

    print(
        "Model saved to:",
        classifier.model_path
    )


if __name__ == "__main__":
    main()