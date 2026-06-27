import os
import json
import pandas as pd
import numpy as np
import joblib

# Ensure output directory exists
os.makedirs("public/data", exist_ok=True)

def project_2024_records(features_df, model_pipeline):
    print("Projecting 2024 climate features and predicting yields...")
    
    # Load raw weather to get 2024 measurements
    nasa_path = "data/raw/nasa_weather.csv"
    if not os.path.exists(nasa_path):
        raise FileNotFoundError("Raw NASA weather data not found.")
        
    nasa_df = pd.read_csv(nasa_path)
    weather_2024 = nasa_df[nasa_df["year"] == 2024]
    
    if len(weather_2024) == 0:
        print("Warning: No 2024 weather data found in raw files. Skipping 2024 forecasting.")
        return pd.DataFrame()
        
    # Pivot 2024 weather
    weather_pivot = weather_2024.pivot(
        index=["district"],
        columns="month",
        values=["temp_c", "temp_max_c", "temp_min_c", "rain_mm_day", "rh_pct", "solar_mj_m2_day", "gwettop"]
    )
    weather_pivot.columns = [f"{var}_{month}" for var, month in weather_pivot.columns]
    weather_pivot = weather_pivot.reset_index()
    
    from src.utils.coordinates import DISTRICT_COORDINATES
    records = []
    
    # Retrieve 2023 area values as baseline proxy for 2024
    area_lookup = features_df[features_df["year"] == 2023].set_index(["district", "season"])["area_ha"].to_dict()
    
    for _, w_row in weather_pivot.iterrows():
        district = w_row["district"]
        division = DISTRICT_COORDINATES.get(district, {}).get("division", "Unknown")
        
        for season in ["Aus", "Aman", "Boro"]:
            if season == "Aus":
                months = [4, 5, 6, 7, 8]
            elif season == "Aman":
                months = [7, 8, 9, 10, 11, 12]
            else: # Boro
                months = [12, 1, 2, 3, 4, 5]
                
            # Extract monthly variables
            temps = [w_row[f"temp_c_{m}"] for m in months]
            rains = [w_row[f"rain_mm_day_{m}"] for m in months]
            rhs = [w_row[f"rh_pct_{m}"] for m in months]
            solars = [w_row[f"solar_mj_m2_day_{m}"] for m in months]
            
            # New features
            max_temps = [w_row[f"temp_max_c_{m}"] for m in months]
            min_temps = [w_row[f"temp_min_c_{m}"] for m in months]
            soil_wets = [w_row[f"gwettop_{m}"] for m in months]
            
            # Summarize
            s_temp = np.mean(temps)
            s_rain = np.sum(rains) * 30.0
            s_rh = np.mean(rhs)
            s_solar = np.mean(solars)
            
            # GDD
            gdd_sum = 0.0
            for t_max, t_min in zip(max_temps, min_temps):
                t_avg = (t_max + t_min) / 2.0
                gdd_sum += max(0.0, t_avg - 10.0) * 30.4
            
            # DTR
            s_dtr = np.mean([t_max - t_min for t_max, t_min in zip(max_temps, min_temps)])
            
            # Soil wetness
            s_soil = np.mean(soil_wets)
            
            # Flood and drought index
            flood = max(0.0, s_rain - 2200.0) / 100.0 if season in ["Aus", "Aman"] else 0.0
            drought = max(0.0, 120.0 - s_rain) / 10.0 if season == "Boro" else 0.0
            
            # Fetch area proxy (fallback to historical median if 2023 is missing)
            area = area_lookup.get((district, season), features_df[features_df["season"] == season]["area_ha"].median())
            
            records.append({
                "district": district,
                "division": division,
                "year": 2024,
                "season": season,
                "area_ha": float(area),
                "production_mt": 0.0,      # Unobserved
                "yield_mtha": 0.0,          # Unobserved
                "season_temp_c": float(s_temp),
                "season_rain_mm": float(s_rain),
                "season_rh_pct": float(s_rh),
                "season_solar_mj_m2": float(s_solar),
                "season_gdd": float(gdd_sum),
                "season_dtr": float(s_dtr),
                "season_soil_wetness": float(s_soil),
                "flood_index": float(flood),
                "drought_index": float(drought)
            })
            
    df_2024 = pd.DataFrame(records)
    
    # Run predictions for 2024
    features = [
        "division", "season", "area_ha", 
        "season_temp_c", "season_rain_mm", "season_rh_pct", "season_solar_mj_m2",
        "season_gdd", "season_dtr", "season_soil_wetness",
        "flood_index", "drought_index"
    ]
    df_2024["pred_yield_mtha"] = model_pipeline.predict(df_2024[features])
    df_2024["pred_yield_mtha"] = df_2024["pred_yield_mtha"].round(2)
    df_2024["production_mt"] = (df_2024["area_ha"] * df_2024["pred_yield_mtha"]).round(2)
    
    return df_2024

def main():
    print("Exporting static frontend JSON data artifacts...")
    
    # 1. Load trained model pipeline
    model_path = "model/crop_yield_model.joblib"
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"{model_path} not found. Run train_model.py first.")
    model = joblib.load(model_path)
    
    # 2. Load engineered features
    features_path = "data/processed/features_engineered.csv"
    if not os.path.exists(features_path):
        raise FileNotFoundError(f"{features_path} not found. Run feature_engineer.py first.")
    features_df = pd.read_csv(features_path)
    
    # 3. Generate predictions for historical years (2015-2023)
    features_list = [
        "division", "season", "area_ha", 
        "season_temp_c", "season_rain_mm", "season_rh_pct", "season_solar_mj_m2",
        "season_gdd", "season_dtr", "season_soil_wetness",
        "flood_index", "drought_index"
    ]
    features_df["pred_yield_mtha"] = model.predict(features_df[features_list])
    features_df["pred_yield_mtha"] = features_df["pred_yield_mtha"].round(2)
    
    # 4. Project 2024 predictions
    df_2024 = project_2024_records(features_df, model)
    
    # Combine historical and projection records
    if len(df_2024) > 0:
        combined_df = pd.concat([features_df, df_2024], ignore_index=True)
    else:
        combined_df = features_df.copy()
        
    # Sort for consistent dashboard display
    combined_df = combined_df.sort_values(by=["district", "season", "year"])
    
    # 5. Export District Geolocation metadata
    from src.utils.coordinates import DISTRICT_COORDINATES
    districts_list = []
    for d, info in DISTRICT_COORDINATES.items():
        districts_list.append({
            "name": d,
            "lat": info["lat"],
            "lon": info["lon"],
            "division": info["division"]
        })
    with open("public/data/districts.json", "w") as f:
        json.dump(districts_list, f, indent=2)
    print("Exported districts.json")
    
    # 6. Export FAOSTAT National Validation data
    fao_path = "data/raw/fao_national_rice.csv"
    fao_records = []
    if os.path.exists(fao_path):
        fao_df = pd.read_csv(fao_path)
        for _, row in fao_df.iterrows():
            fao_records.append({
                "year": int(row["year"]),
                "element": row["element"],
                "value": float(row["value"]),
                "unit": row["unit"]
            })
    with open("public/data/fao_national.json", "w") as f:
        json.dump(fao_records, f, indent=2)
    print("Exported fao_national.json")

    # 6b. Export Raw BBS Yield Data
    bbs_raw_path = "data/raw/bbs_crop_yield.csv"
    if os.path.exists(bbs_raw_path):
        bbs_raw_df = pd.read_csv(bbs_raw_path)
        bbs_raw_records = bbs_raw_df.to_dict(orient="records")
        with open("public/data/bbs_raw.json", "w") as f:
            json.dump(bbs_raw_records, f, indent=2)
        print(f"Exported bbs_raw.json ({len(bbs_raw_records)} records)")

    # 6c. Export Raw NASA Weather Data
    nasa_raw_path = "data/raw/nasa_weather.csv"
    if os.path.exists(nasa_raw_path):
        nasa_raw_df = pd.read_csv(nasa_raw_path)
        nasa_raw_records = nasa_raw_df.to_dict(orient="records")
        with open("public/data/nasa_raw.json", "w") as f:
            json.dump(nasa_raw_records, f, indent=2)
        print(f"Exported nasa_raw.json ({len(nasa_raw_records)} records)")
    
    # 7. Export Yield Data records (compacted structure to reduce payload size)
    # List of dicts: district, division, year, season, area_ha, yield_mtha, pred_yield_mtha, temp, rain, rh, solar, flood, drought
    yield_records = []
    for _, row in combined_df.iterrows():
        yield_records.append({
            "district": row["district"],
            "division": row["division"],
            "year": int(row["year"]),
            "season": row["season"],
            "area_ha": float(np.round(row["area_ha"], 1)),
            "yield_mtha": float(np.round(row["yield_mtha"], 2)),
            "pred_yield_mtha": float(np.round(row["pred_yield_mtha"], 2)),
            "temp_c": float(np.round(row["season_temp_c"], 1)),
            "rain_mm": float(np.round(row["season_rain_mm"], 1)),
            "rh_pct": float(np.round(row["season_rh_pct"], 1)),
            "solar_mj": float(np.round(row["season_solar_mj_m2"], 1)),
            "flood": float(np.round(row["flood_index"], 2)),
            "drought": float(np.round(row["drought_index"], 2))
        })
    with open("public/data/yield_data.json", "w") as f:
        json.dump(yield_records, f, indent=2)
    print(f"Exported yield_data.json ({len(yield_records)} records)")
    
    # 8. Export Summary / Metadata for validation & details
    regressor = model.named_steps["regressor"]
    preprocessor = model.named_steps["preprocessor"]
    
    cat_encoder = preprocessor.named_transformers_["cat"]
    encoded_cat_features = list(cat_encoder.get_feature_names_out(["division", "season"]))
    all_features = [
        "area_ha", "season_temp_c", "season_rain_mm", "season_rh_pct", "season_solar_mj_m2",
        "season_gdd", "season_dtr", "season_soil_wetness",
        "flood_index", "drought_index"
    ] + encoded_cat_features
    importances = regressor.feature_importances_
    
    importance_dict = {feat: float(imp) for feat, imp in zip(all_features, importances)}
    
    # Calculate global model statistics
    hist_only = combined_df[combined_df["year"] <= 2023]
    global_rmse = float(np.sqrt(np.mean((hist_only["yield_mtha"] - hist_only["pred_yield_mtha"]) ** 2)))
    global_mae = float(np.mean(np.abs(hist_only["yield_mtha"] - hist_only["pred_yield_mtha"])))
    
    summary = {
        "model_type": "XGBoost Regressor Pipeline",
        "n_estimators": int(regressor.get_params()["n_estimators"]),
        "train_years": [2015, 2021],
        "test_years": [2022, 2023],
        "metrics": {
            "overall_rmse": float(np.round(global_rmse, 3)),
            "overall_mae": float(np.round(global_mae, 3))
        },
        "feature_importances": importance_dict,
        "run_date": "2026-06-27"
    }
    with open("public/data/summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    print("Exported summary.json")
    print("Frontend data export complete!")

if __name__ == "__main__":
    main()
