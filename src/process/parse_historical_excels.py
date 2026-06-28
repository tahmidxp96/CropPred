import os
import json
import pandas as pd
import numpy as np

# Spelling map to normalize district names
DISTRICT_NAME_MAP = {
    "chittagong": "Chattogram",
    "coxs bazar": "Cox's Bazar",
    "cox'sbazar": "Cox's Bazar",
    "comilla": "Cumilla",
    "barisal": "Barishal",
    "jessore": "Jashore",
    "jessor": "Jashore",
    "bogra": "Bogura",
    "sylhet": "Sylhet",
    "dhaka": "Dhaka",
    "khulna": "Khulna",
    "rajshahi": "Rajshahi",
    "rangpur": "Rangpur",
    "mymensingh": "Mymensingh",
}

def normalize_district_name(name):
    if not isinstance(name, str):
        return name
    name_clean = name.strip().lower()
    if name_clean in DISTRICT_NAME_MAP:
        return DISTRICT_NAME_MAP[name_clean]
    return name.strip().title()

def normalize_season(crop_type):
    if not isinstance(crop_type, str):
        return crop_type
    c = crop_type.strip().lower()
    if "aus" in c:
        return "Aus"
    if "aman" in c:
        return "Aman"
    if "boro" in c:
        return "Boro"
    return crop_type

def main():
    print("Parsing historical crop production excel files...")
    
    records = []
    
    # 1. Parse crop_1995_2004.csv
    file_1 = "data/raw/crop_1995_2004.csv"
    if os.path.exists(file_1):
        df1 = pd.read_csv(file_1)
        for _, row in df1.iterrows():
            dist = normalize_district_name(row["District"])
            season = normalize_season(row["Crop Type"])
            year = int(row["Year"])
            area_acres = float(row["Area(acres)"])
            prod_tons = float(row["Production(tons)"])
            
            if area_acres > 0 and prod_tons > 0:
                # Convert: area in ha = area * 0.404686, prod in MT = prod * 1.01605
                area_ha = area_acres * 0.404686
                prod_mt = prod_tons * 1.01605
                yield_rate = prod_mt / area_ha
                
                records.append({
                    "district": dist,
                    "season": season,
                    "year": year,
                    "yield_mtha": yield_rate
                })
        print(f"Loaded {len(df1)} rows from crop_1995_2004.csv")
        
    # 2. Parse crop_2005_2014.csv
    file_2 = "data/raw/crop_2005_2014.csv"
    if os.path.exists(file_2):
        df2 = pd.read_csv(file_2)
        for _, row in df2.iterrows():
            dist = normalize_district_name(row["District"])
            season = normalize_season(row["Crop Type"])
            year = int(row["Year"])
            area_acres = float(row["Area(acres)"])
            prod_tons = float(row["Production(tons)"])
            
            if area_acres > 0 and prod_tons > 0:
                area_ha = area_acres * 0.404686
                prod_mt = prod_tons * 1.01605
                yield_rate = prod_mt / area_ha
                
                records.append({
                    "district": dist,
                    "season": season,
                    "year": year,
                    "yield_mtha": yield_rate
                })
        print(f"Loaded {len(df2)} rows from crop_2005_2014.csv")
        
    if not records:
        print("No historical records compiled.")
        return
        
    combined_df = pd.DataFrame(records)
    
    # Calculate historical baseline mean yield per district and season
    baseline = combined_df.groupby(["district", "season"])["yield_mtha"].mean().to_dict()
    
    # Export baseline as JSON lookup
    # Keys will be "District_Season" format to make JSON serialization simple
    lookup = {f"{k[0]}_{k[1]}": float(np.round(v, 4)) for k, v in baseline.items()}
    
    os.makedirs("data/processed", exist_ok=True)
    output_path = "data/processed/historical_baseline_yields.json"
    with open(output_path, "w") as f:
        json.dump(lookup, f, indent=2)
        
    print(f"Exported {len(lookup)} historical district baseline profiles to {output_path}")

if __name__ == "__main__":
    main()
