import os
import pandas as pd
import numpy as np

# Ensure processed data directory exists
os.makedirs("data/processed", exist_ok=True)

# Spelling map for potential variants of Bangladesh districts
DISTRICT_NAME_MAP = {
    "chittagong": "Chattogram",
    "coxs bazar": "Cox's Bazar",
    "cox'sbazar": "Cox's Bazar",
    "comilla": "Cumilla",
    "barisal": "Barishal",
    "jessore": "Jashore",
    "bogra": "Bogura",
    "sylhet": "Sylhet",
    "dhaka": "Dhaka",
    "khulna": "Khulna",
    "rajshahi": "Rajshahi",
    "rangpur": "Rangpur",
    "mymensingh": "Mymensingh",
    # Add other variants as necessary
}

def normalize_district_name(name):
    if not isinstance(name, str):
        return name
    name_clean = name.strip().lower()
    # Direct dictionary lookup
    if name_clean in DISTRICT_NAME_MAP:
        return DISTRICT_NAME_MAP[name_clean]
    # Capitalize standard words
    return name.strip().title()

def main():
    print("Starting data merging and cleaning process...")
    
    # 1. Load Raw Datasets
    bbs_path = "data/raw/bbs_crop_yield.csv"
    nasa_path = "data/raw/nasa_weather.csv"
    
    if not os.path.exists(bbs_path) or not os.path.exists(nasa_path):
        raise FileNotFoundError("Raw data files not found. Please run fetch scripts first.")
        
    bbs_df = pd.read_csv(bbs_path)
    nasa_df = pd.read_csv(nasa_path)
    
    # 2. Normalize District Names to prevent mismatch
    bbs_df["district"] = bbs_df["district"].apply(normalize_district_name)
    nasa_df["district"] = nasa_df["district"].apply(normalize_district_name)
    
    # 3. Pivot NASA weather data from long to wide format
    # Each row will be (district, year) with 12 months of T2M, Rain, RH, Solar
    print("Pivoting monthly NASA weather variables...")
    
    weather_pivot = nasa_df.pivot(
        index=["district", "year"],
        columns="month",
        values=["temp_c", "temp_max_c", "temp_min_c", "rain_mm_day", "rh_pct", "solar_mj_m2_day", "gwettop", "gwetroot", "wind_speed", "earth_skin_temp"]
    )
    
    # Flatten multi-level columns: e.g. ('temp_c', 1) -> 'temp_1'
    weather_pivot.columns = [f"{var}_{month}" for var, month in weather_pivot.columns]
    weather_pivot = weather_pivot.reset_index()
    
    # 4. Merge BBS yields and pivoted weather data on (district, year)
    print("Merging crop yield data with pivoted weather data...")
    merged_df = pd.merge(bbs_df, weather_pivot, on=["district", "year"], how="inner")
    
    # 5. Data cleaning validations
    # Check for nulls
    null_counts = merged_df.isnull().sum().sum()
    if null_counts > 0:
        print(f"Warning: Found {null_counts} missing values. Filling with column means.")
        merged_df = merged_df.fillna(merged_df.mean(numeric_only=True))
    else:
        print("No missing values detected.")
        
    # Check shape
    print(f"Merged dataset shape: {merged_df.shape} ({len(merged_df)} records)")
    
    # Save the cleaned merged output
    output_path = "data/processed/cleaned_merged.csv"
    merged_df.to_csv(output_path, index=False)
    print(f"Cleaned and merged dataset successfully saved to {output_path}")

if __name__ == "__main__":
    main()
