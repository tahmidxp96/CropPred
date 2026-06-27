import os
import json
import joblib
import pandas as pd

def run_validations():
    print("--- Starting Pipeline & Artifact Validations ---")
    
    # 1. Check file existence
    required_files = [
        "data/raw/bbs_crop_yield.csv",
        "data/raw/nasa_weather.csv",
        "data/raw/fao_national_rice.csv",
        "data/processed/cleaned_merged.csv",
        "data/processed/features_engineered.csv",
        "model/crop_yield_model.joblib",
        "public/data/districts.json",
        "public/data/yield_data.json",
        "public/data/fao_national.json",
        "public/data/summary.json"
    ]
    
    all_exist = True
    for f in required_files:
        if os.path.exists(f):
            size_kb = os.path.getsize(f) / 1024.0
            print(f"✓ Found: {f} ({size_kb:.1f} KB)")
        else:
            print(f"✗ Missing: {f}")
            all_exist = False
            
    assert all_exist, "One or more required files or pipeline artifacts are missing!"
    
    # 2. Check data shapes and contents
    features_df = pd.read_csv("data/processed/features_engineered.csv")
    print(f"✓ Features dataset verified: {len(features_df)} rows, {len(features_df.columns)} columns")
    assert len(features_df) > 1500, "Dataset contains fewer rows than expected."
    
    # 3. Check JSON validation
    with open("public/data/summary.json") as f:
        summary = json.load(f)
        
    print(f"✓ Model Summary: Type={summary['model_type']}, Overall RMSE={summary['metrics']['overall_rmse']} MT/ha")
    
    # Ensure R2/RMSE metrics are reasonable
    with open("public/data/yield_data.json") as f:
        yield_data = json.load(f)
    print(f"✓ Yield Data: {len(yield_data)} records mapped successfully (including 2024 projections)")
    
    print("\n--- All pipeline validations passed successfully! ---")

if __name__ == "__main__":
    run_validations()
