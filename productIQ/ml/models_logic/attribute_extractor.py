import re


class AttributeExtractor:

    def extract(self, text_or_entities, entities=None):
        # Flexible argument handling
        if isinstance(text_or_entities, dict) and entities is None:
            entities = text_or_entities
            text = " ".join(str(v) for v in entities.values() if v is not None)
        else:
            text = str(text_or_entities or "")
            if entities is None:
                entities = {}

        attributes = {}

        # --------------------------------
        # 1. Base Entity Properties
        # --------------------------------
        if entities.get("brand"):
            attributes["Brand"] = entities["brand"]

        if entities.get("product_type"):
            attributes["Product Type"] = entities["product_type"]

        if entities.get("material"):
            attributes["Material"] = entities["material"]

        if entities.get("grit"):
            attributes["Grit"] = entities["grit"]

        if entities.get("quantity"):
            attributes["Package Quantity"] = f"{entities['quantity']} Pcs" if not "box" in text.lower() and not "pk" in text.lower() else f"{entities['quantity']} Pack/Box"

        if entities.get("diameter"):
            attributes["Diameter"] = f"{entities['diameter']}\""

        if entities.get("thickness"):
            attributes["Thickness"] = f"{entities['thickness']}\""

        if entities.get("width"):
            attributes["Width"] = f"{entities['width']}\""

        if entities.get("length"):
            attributes["Length"] = f"{entities['length']}\""

        # --------------------------------
        # 2. Appliance & Consumer Specs
        # --------------------------------
        # Series
        if entities.get("series"):
            attributes["Series"] = entities["series"]
        elif re.search(r"Professional Series", text, re.IGNORECASE):
            attributes["Series"] = "Professional Series"
        elif re.search(r"Eco Series", text, re.IGNORECASE):
            attributes["Series"] = "Eco Series"

        # Wash Cycles
        if entities.get("wash_cycles"):
            attributes["Number of Wash Cycles"] = entities["wash_cycles"]
        else:
            wash_m = re.search(r"\b(\d+)\s*[- ]?Wash\s+Cycles?\b", text, re.IGNORECASE)
            if wash_m:
                attributes["Number of Wash Cycles"] = wash_m.group(1)

        # Sound Level
        if entities.get("sound_level"):
            attributes["Sound Level"] = entities["sound_level"]
        else:
            sound_m = re.search(r"\b(\d+(?:\.\d+)?)\s*dBA\b", text, re.IGNORECASE)
            if sound_m:
                attributes["Sound Level"] = f"{sound_m.group(1)} dBA"

        # Mounting Type
        if entities.get("mounting_type"):
            attributes["Mounting Type"] = entities["mounting_type"]
        elif re.search(r"\bLeg Mounting\b", text, re.IGNORECASE):
            attributes["Mounting Type"] = "Leg Mounting"
        elif re.search(r"\bBuilt[- ]in\b", text, re.IGNORECASE):
            attributes["Mounting Type"] = "Built-in"

        # Size / Dimensions (e.g. 24 in W x 24-1/4 in D)
        size_m = re.search(r"(\d+(?:-\d+/\d+|\.\d+)?\s*in\s*[WwHhDd]\s*[xX×]\s*\d+(?:-\d+/\d+|\.\d+)?\s*in\s*[WwHhDd](?:\s*[xX×]\s*\d+(?:-\d+/\d+|\.\d+)?\s*in\s*[WwHhDd])?)", text)
        if size_m:
            attributes["Size"] = size_m.group(1)

        # Depth With Door Open
        door_open = re.search(r"(\d+(?:-\d+/\d+|\.\d+)?)\s*in\s*(?:Depth\s*With\s*Door\s*Open|Depth\s*Open)", text, re.IGNORECASE)
        if door_open:
            attributes["Depth With Door Open"] = f"{door_open.group(1)} in"

        # Annual Energy
        annual_energy = re.search(r"(\d+(?:\.\d+)?)\s*kW-hr", text, re.IGNORECASE)
        if annual_energy:
            attributes["Annual Energy"] = f"{annual_energy.group(1)} kW-hr"

        # --------------------------------
        # 3. Electrical Specifications
        # --------------------------------
        if entities.get("voltage"):
            attributes["Voltage Rating"] = entities["voltage"]
        else:
            volt = re.search(r"\b(\d+(?:\/\d+)?)\s*(?:V|VAC|VDC|Volts?)\b", text, re.IGNORECASE)
            if volt:
                attributes["Voltage Rating"] = f"{volt.group(1)} V"

        if entities.get("amperage"):
            attributes["Amperage Rating"] = entities["amperage"]
        else:
            amp = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:A|Amp|Amps|Amperes?)\b", text, re.IGNORECASE)
            if amp:
                attributes["Amperage Rating"] = f"{amp.group(1)} A"

        power = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:kw|hp|watts?)\b", text, re.IGNORECASE)
        if power:
            attributes["Power Rating"] = power.group(0).upper()

        # --------------------------------
        # 4. Fluid & Pressure Specs
        # --------------------------------
        pressure = re.search(r"\b(\d+(?:\.\d+)?)\s*(bar|psi|kpa|mpa)\b", text, re.IGNORECASE)
        if pressure:
            attributes["Operating Pressure"] = f"{pressure.group(1)} {pressure.group(2).upper()}"

        flow = re.search(r"\b(\d+(?:\.\d+)?)\s*(l/min|gpm|m3/h|cfm)\b", text, re.IGNORECASE)
        if flow:
            attributes["Flow Rate"] = f"{flow.group(1)} {flow.group(2)}"

        # --------------------------------
        # 5. Mechanical & Speed Specs
        # --------------------------------
        rpm = re.search(r"\b(\d+(?:,\d+)?)\s*rpm\b", text, re.IGNORECASE)
        if rpm:
            attributes["Speed"] = rpm.group(1).replace(",", "") + " RPM"

        temperature = re.search(r"(-?\d+\s*°?C\s*(?:to|-)\s*\d+\s*°?C|\b-?\d+(?:\.\d+)?\s*[°]?[fcFC]\b)", text, re.IGNORECASE)
        if temperature:
            attributes["Operating Temperature"] = temperature.group(1)

        # Enclosure / IP Rating
        ip_rating = re.search(r"\b(IP\d{2})\b", text, re.IGNORECASE)
        if ip_rating:
            attributes["Enclosure"] = f"{ip_rating.group(1).upper()} TEFC"

        # Attachment / Joint Type
        if "stikit" in text.lower():
            attributes["Attachment Type"] = "Stikit Adhesive Backing"
        elif "hook and loop" in text.lower() or "velcro" in text.lower():
            attributes["Attachment Type"] = "Hook & Loop"

        if "lap joint" in text.lower():
            attributes["Joint Type"] = "Lap Joint"
        elif "butt joint" in text.lower():
            attributes["Joint Type"] = "Precision Butt Joint"

        # --------------------------------
        # 6. Application
        # --------------------------------
        if any(w in text.lower() for w in ["dishwasher", "refrigerator", "appliance", "kitchen"]):
            attributes["Application"] = "Kitchen Appliances & Residential"
        elif any(w in text.lower() for w in ["pump", "hydraulic", "valve", "cylinder"]):
            attributes["Application"] = "Hydraulic Machinery & Fluid Systems"
        elif any(w in text.lower() for w in ["motor", "drive", "conveyor"]):
            attributes["Application"] = "Industrial Electric Drives & Automation"
        elif any(w in text.lower() for w in ["sensor", "transmitter", "gauge"]):
            attributes["Application"] = "Process Control & Instrumentation"
        elif any(w in text.lower() for w in ["abrasive", "grinding", "cutting", "sanding", "disc", "belt"]):
            attributes["Application"] = "Metal Grinding, Blending & Finishing"
        else:
            attributes["Application"] = "Industrial Machinery & Automation"

        return attributes