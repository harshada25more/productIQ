import pandas as pd
import re


NULL_VALUES = {
    "",
    "nan",
    "none",
    "null",
    "-- unbranded --",
    "-- no unilog brand --",
    "-- no dib brand --"
}


def clean_value(value):
    if pd.isna(value):
        return ""

    value = str(value).strip()

    if value.lower() in NULL_VALUES:
        return ""

    return value


def normalize_text(text):
    if not text:
        return ""

    text = str(text).lower()

    # Normalize common symbols
    text = text.replace("×", "x")
    text = text.replace("–", "-")
    text = text.replace("—", "-")

    # Remove excessive whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def create_product_text(row):
    fields = [
        "Mfg_Part_Num",
        "Part_Desc",
        "E1_Brand",
        "Unilog_Brand",
        "DIB_Brand",
        "Part_Manuf"
    ]

    values = []

    for field in fields:
        value = clean_value(row.get(field, ""))

        if value:
            values.append(value)

    return " ".join(values)


def preprocess_dataframe(df):
    df = df.copy()

    expected_columns = [
        "Mfg_Part_Num",
        "Part_Desc",
        "E1_Brand",
        "Unilog_Brand",
        "DIB_Brand",
        "Part_Manuf"
    ]

    for column in expected_columns:
        if column not in df.columns:
            df[column] = ""

        df[column] = df[column].apply(clean_value)

    df["product_text"] = df.apply(create_product_text, axis=1)

    df["normalized_description"] = (
        df["Part_Desc"]
        .apply(normalize_text)
    )

    return df


def preprocess_file(input_path, output_path=None):
    df = pd.read_csv(input_path)

    processed = preprocess_dataframe(df)

    if output_path:
        processed.to_csv(output_path, index=False)

    return processed


if __name__ == "__main__":

    input_path = "data/Input.csv"
    output_path = "data/processed.csv"

    df = preprocess_file(input_path, output_path)

    print("Preprocessing completed.")
    print("Rows:", len(df))
    print("Columns:", list(df.columns))

    print("\nFirst 5 products:")
    print(
        df[
            [
                "Mfg_Part_Num",
                "Part_Desc",
                "product_text"
            ]
        ].head()
    )