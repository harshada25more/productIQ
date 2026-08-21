import os
import re
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


DEFAULT_TRAINING_CORPUS = [
    ("3M 775L Stikit Film P150 Cubitron II Abrasive Disc 50 Box", "Abrasives"),
    ("Diablo 1/2x18 Sanding Belt 6pc Zirconia Alumina", "Abrasives"),
    ("Cut-Off Disc Metal Grinding Wheel 9 inch", "Abrasives"),
    ("Abrasive Flap Disc 60 Grit Stainless Steel", "Abrasives"),
    ("Industrial Hydraulic Pump 250 bar high pressure piston", "Fluid Handling & Hydraulics"),
    ("FlowTech 316 Stainless Steel Control Valve Flanged", "Fluid Handling & Hydraulics"),
    ("Hydraulic Cylinder Double Acting Pneumatic Actuator", "Fluid Handling & Hydraulics"),
    ("Water Gear Pump 120 L/min 40 bar", "Fluid Handling & Hydraulics"),
    ("Siemens 5HP 3-Phase Electric Induction Motor 415V", "Electric Motors & Drives"),
    ("Brushless DC Servo Motor 7.5kW 1450 RPM", "Electric Motors & Drives"),
    ("Variable Frequency Drive Inverter 400V", "Electric Motors & Drives"),
    ("Piezoresistive Pressure Sensor Transmitter 4-20mA 0-100 bar", "Sensors & Instrumentation"),
    ("RTD Temperature Sensor Thermocouple Type K", "Sensors & Instrumentation"),
    ("Digital Flow Meter Sensor Turbine Gauge", "Sensors & Instrumentation"),
    ("Commercial Refrigerator Cooler Freezer Evaporator", "Appliances"),
    ("Heavy Duty Industrial Range Oven Dishwasher Unit", "Appliances"),
    ("Ball Bearing Deep Groove Sealed Radial Bearing", "Mechanical Components"),
    ("Rotary Shaft Oil Seal Bushing Stainless Steel", "Mechanical Components"),
    ("DeWalt Cordless Hammer Drill 20V Max Lithium", "Power Tools"),
    ("Milwaukee Circular Saw Blade 7-1/4 inch 24T", "Power Tools")
]


class ProductClassifier:

    def __init__(self, model_path="models/product_classifier.joblib"):
        self.model_path = model_path
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=1,
            max_features=10000,
            sublinear_tf=True
        )
        self.model = LogisticRegression(
            max_iter=2000,
            class_weight="balanced"
        )
        self.is_trained = False

    def create_weak_label(self, text):
        text = text.lower()

        if any(w in text for w in ["pump", "valve", "hydraulic", "pneumatic", "cylinder", "fluid"]):
            return "Fluid Handling & Hydraulics"

        if any(w in text for w in ["motor", "drive", "inverter", "vfd", "servo", "electric motor"]):
            return "Electric Motors & Drives"

        if any(w in text for w in ["sensor", "transmitter", "gauge", "meter", "thermocouple"]):
            return "Sensors & Instrumentation"

        if any(w in text for w in ["sanding", "abrasive", "cut off disc", "cut-off disc", "sanding belt", "grinding", "grit", "cubitron"]):
            return "Abrasives"

        if any(w in text for w in ["drill", "saw blade", "router", "power tool", "impact"]):
            return "Power Tools"

        if any(w in text for w in ["bearing", "seal", "bushing", "flange", "gear"]):
            return "Mechanical Components"

        if any(w in text for w in ["dishwasher", "refrigerator", "range", "oven", "appliance"]):
            return "Appliances"

        return "Industrial Equipment"

    def train(self, texts):
        if not texts or len(texts) == 0:
            texts = [item[0] for item in DEFAULT_TRAINING_CORPUS]
            labels = [item[1] for item in DEFAULT_TRAINING_CORPUS]
        else:
            labels = [self.create_weak_label(t) for t in texts]

        # Ensure we have at least 2 distinct classes
        unique_classes = set(labels)
        if len(unique_classes) < 2:
            for item in DEFAULT_TRAINING_CORPUS:
                texts.append(item[0])
                labels.append(item[1])

        X = self.vectorizer.fit_transform(texts)
        self.model.fit(X, labels)
        self.is_trained = True

        os.makedirs(os.path.dirname(self.model_path) if os.path.dirname(self.model_path) else ".", exist_ok=True)
        try:
            joblib.dump(
                {
                    "vectorizer": self.vectorizer,
                    "model": self.model
                },
                self.model_path
            )
        except Exception:
            pass

        return {
            "samples": len(texts),
            "classes": sorted(set(labels))
        }

    def load(self):
        if not os.path.exists(self.model_path):
            return False

        try:
            data = joblib.load(self.model_path)
            self.vectorizer = data["vectorizer"]
            self.model = data["model"]
            self.is_trained = True
            return True
        except Exception:
            return False

    def predict(self, text):
        text = str(text or "")

        if not self.is_trained:
            loaded = self.load()
            if not loaded:
                # Initialize with corpus
                self.train([item[0] for item in DEFAULT_TRAINING_CORPUS])

        try:
            X = self.vectorizer.transform([text])
            prediction = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            confidence = float(max(probabilities))

            # If confidence is low or default, check weak label fallback
            rule_label = self.create_weak_label(text)
            if confidence < 0.35 and rule_label != "Industrial Equipment":
                prediction = rule_label
                confidence = 0.85

            return {
                "category": prediction,
                "confidence": round(confidence, 4)
            }
        except Exception:
            fallback = self.create_weak_label(text)
            return {
                "category": fallback,
                "confidence": 0.85
            }