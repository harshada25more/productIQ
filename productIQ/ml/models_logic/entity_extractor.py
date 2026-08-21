import re


class ProductEntityExtractor:

    def extract(self, text):
        text = str(text or "")

        result = {
            "brand": None,
            "grit": None,
            "quantity": None,
            "diameter": None,
            "thickness": None,
            "width": None,
            "length": None,
            "product_type": None,
            "material": None,
            "voltage": None,
            "amperage": None,
            "sound_level": None,
            "wash_cycles": None,
            "mounting_type": None,
            "series": None
        }

        # -------------------------
        # BRAND RECOGNITION (Prioritized list)
        # -------------------------
        brands = [
            "FRIGIDAIRE®", "FRIGIDAIRE", "Whirlpool®", "Whirlpool", "Rheem Manufacturing", "Rheem",
            "3M", "Diablo", "Freud Inc", "Freud", "Milwaukee", "Milw", "Bosch Rexroth", "Bosch",
            "Siemens", "Danfoss", "Honeywell", "Fluke", "Swagelok", "Parker", "Eaton", "Rexroth",
            "Schneider Electric", "ABB", "Omron", "Festo", "SMC", "Mirka Abrasives", "Mirka",
            "Norton", "Weiler", "Festool", "Makita", "DeWalt", "SKF", "Timken", "Grundfos",
            "Emerson", "SensorTech", "FlowTech", "ElectroDrives", "HIOLIT", "Abranet", "GE Appliances", "KitchenAid"
        ]

        for brand in brands:
            clean_b = re.escape(brand.replace("®", ""))
            if re.search(rf"\b{clean_b}\b", text, re.IGNORECASE):
                result["brand"] = brand
                break

        # -------------------------
        # PRODUCT TYPE RECOGNITION
        # -------------------------
        product_types = [
            "Built-In Dishwasher",
            "Dishwasher",
            "Commercial Refrigerator",
            "Proportional Valve Group",
            "Proportional Valve",
            "Stainless Steel Valve",
            "Control Valve",
            "Ball Valve",
            "Butterfly Valve",
            "Check Valve",
            "Solenoid Valve",
            "Hydraulic Pump",
            "Axial Piston Pump",
            "Piston Pump",
            "Gear Pump",
            "Vane Pump",
            "Induction Motor",
            "Electric Motor",
            "Servo Motor",
            "Stepper Motor",
            "Pressure Transmitter",
            "Pressure Sensor",
            "Flow Meter",
            "Temperature Sensor",
            "Metal Cut-Off Disc",
            "Cut-Off Disc",
            "Sanding Belt",
            "Grinding Disc",
            "Abrasive Disc",
            "Flap Disc",
            "Film Disc",
            "Film",
            "Pneumatic Cylinder",
            "Air Filter Regulator",
            "Linear Actuator",
            "Ball Bearing",
            "Roller Bearing"
        ]

        for pt in product_types:
            if re.search(rf"\b{re.escape(pt)}\b", text, re.IGNORECASE):
                result["product_type"] = pt
                break

        # -------------------------
        # MATERIAL
        # -------------------------
        materials = [
            "316L Stainless Steel", "316 Stainless Steel", "304 Stainless Steel", "Stainless Steel 316",
            "Stainless Steel 304", "Stainless Steel", "Cubitron II Film", "Cubitron II Ceramic",
            "Cubitron II", "Zirconia Alumina", "Aluminum Oxide", "Silicon Carbide", "Carbon Steel",
            "Cast Iron", "Ductile Iron", "Aluminum", "Brass", "Bronze", "Ceramic", "PTFE"
        ]

        for material in materials:
            if re.search(rf"\b{re.escape(material)}\b", text, re.IGNORECASE):
                result["material"] = material
                break

        # -------------------------
        # DIMENSIONS & SIZES
        # -------------------------
        # Pattern: 24 in W x 24-1/4 in D or 33-7/16 in H x 23-7/8 in W
        dim_w_h = re.search(
            r'(\d+(?:-\d+/\d+|\.\d+)?)\s*(?:in|\")\s*(?:[WwHhDd]|Width|Height|Depth)?\s*[xX×]\s*(\d+(?:-\d+/\d+|\.\d+)?)\s*(?:in|\")',
            text
        )
        if dim_w_h:
            result["width"] = dim_w_h.group(1)
            result["length"] = dim_w_h.group(2)
        else:
            # 1/2"x18" or 6"x48"
            dimensions = re.search(
                r'(\d+(?:/\d+|\.\d+)?)\s*["″]?\s*[xX×]\s*(\d+(?:/\d+|\.\d+)?)\s*["″]?',
                text
            )
            if dimensions:
                first = dimensions.group(1)
                second = dimensions.group(2)
                if any(word in text.lower() for word in ["belt", "sheet", "film"]):
                    result["width"] = first
                    result["length"] = second
                elif "disc" in text.lower():
                    result["diameter"] = first
                    result["thickness"] = second
                else:
                    result["width"] = first
                    result["length"] = second

        # Standalone Diameter (e.g. 9" or 5")
        if not result["diameter"]:
            dia = re.search(r'\b(\d+(?:\.\d+)?)\s*["″]\s*(?:dia|diameter|disc)?', text, re.IGNORECASE)
            if dia:
                result["diameter"] = dia.group(1)

        # -------------------------
        # GRIT
        # -------------------------
        grit = re.search(r'\b(P\d{2,4}|\d{2,4}\s*Grit)\b', text, re.IGNORECASE)
        if grit:
            result["grit"] = grit.group(1).upper()

        # -------------------------
        # QUANTITY
        # -------------------------
        qty = re.search(r'\b(\d+)\s*(?:pc|pcs|piece|pieces|disc|discs|box|pk|pack)\b', text, re.IGNORECASE)
        if qty:
            result["quantity"] = qty.group(1)

        # -------------------------
        # SOUND LEVEL (dBA)
        # -------------------------
        sound = re.search(r'\b(\d+(?:\.\d+)?)\s*dBA\b', text, re.IGNORECASE)
        if sound:
            result["sound_level"] = f"{sound.group(1)} dBA"

        # -------------------------
        # VOLTAGE & AMPERAGE
        # -------------------------
        volt = re.search(r'\b(\d+(?:\/\d+)?)\s*(?:V|VAC|VDC|Volts?)\b', text, re.IGNORECASE)
        if volt:
            result["voltage"] = f"{volt.group(1)} V"

        amp = re.search(r'\b(\d+(?:\.\d+)?)\s*(?:A|Amp|Amps|Amperes?)\b', text, re.IGNORECASE)
        if amp:
            result["amperage"] = f"{amp.group(1)} A"

        # -------------------------
        # WASH CYCLES
        # -------------------------
        cycles = re.search(r'\b(\d+)\s*(?:[- ]?Wash\s+Cycles?|Cycles?)\b', text, re.IGNORECASE)
        if cycles:
            result["wash_cycles"] = cycles.group(1)

        # -------------------------
        # SERIES & MOUNTING
        # -------------------------
        if "professional series" in text.lower():
            result["series"] = "Professional Series"
        elif "eco series" in text.lower():
            result["series"] = "Eco Series"

        if "leg mounting" in text.lower():
            result["mounting_type"] = "Leg Mounting"
        elif "built-in" in text.lower() or "builtin" in text.lower():
            result["mounting_type"] = "Built-in"

        return result