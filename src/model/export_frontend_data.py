import os
import json
import pandas as pd
import numpy as np
import joblib

# Ensure output directory exists
os.makedirs("public/data", exist_ok=True)

def project_future_records(features_df, model_pipeline, div_model, historical_lookup, start_year=2024, end_year=2029):
    print(f"Projecting future climate features and predicting yields ({start_year}-{end_year})...")
    
    # Load ONI lookup dictionary
    oni_path = "data/raw/noaa_oni.csv"
    if os.path.exists(oni_path):
        oni_df = pd.read_csv(oni_path)
        oni_dict = {(int(r["year"]), int(r["month"])): float(r["oni_anomaly"]) for _, r in oni_df.iterrows()}
    else:
        oni_dict = {}
        
    # 1. Project 2024 using actual NASA measurements
    nasa_path = "data/raw/nasa_weather.csv"
    if not os.path.exists(nasa_path):
        raise FileNotFoundError("Raw NASA weather data not found.")
        
    nasa_df = pd.read_csv(nasa_path)
    weather_2024 = nasa_df[nasa_df["year"] == 2024]
    
    df_2024 = pd.DataFrame()
    if len(weather_2024) > 0:
        # Pivot 2024 weather
        cols_to_calc = ["temp_c", "temp_max_c", "temp_min_c", "rain_mm_day", "rh_pct", "solar_mj_m2_day", "gwettop", "gwetroot", "wind_speed", "earth_skin_temp", "evland"]
        weather_pivot = weather_2024.pivot(
            index=["district"],
            columns="month",
            values=cols_to_calc
        )
        weather_pivot.columns = [f"{var}_{month}" for var, month in weather_pivot.columns]
        weather_pivot = weather_pivot.reset_index()
        
        from src.utils.coordinates import DISTRICT_COORDINATES
        records_2024 = []
        
        # Retrieve 2023 area values as baseline
        area_lookup_2023 = features_df[features_df["year"] == 2023].set_index(["district", "season"])["area_ha"].to_dict()
        
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
                    
                temps = [w_row[f"temp_c_{m}"] for m in months]
                rains = [w_row[f"rain_mm_day_{m}"] for m in months]
                rhs = [w_row[f"rh_pct_{m}"] for m in months]
                solars = [w_row[f"solar_mj_m2_day_{m}"] for m in months]
                
                max_temps = [w_row[f"temp_max_c_{m}"] for m in months]
                min_temps = [w_row[f"temp_min_c_{m}"] for m in months]
                soil_wets = [w_row[f"gwettop_{m}"] for m in months]
                soil_roots = [w_row[f"gwetroot_{m}"] for m in months]
                winds = [w_row[f"wind_speed_{m}"] for m in months]
                skins = [w_row[f"earth_skin_temp_{m}"] for m in months]
                evs = [w_row[f"evland_{m}"] for m in months]
                
                s_temp = np.mean(temps)
                s_rain = np.sum(rains) * 30.0
                s_rh = np.mean(rhs)
                s_solar = np.mean(solars)
                
                gdd_sum = 0.0
                for t_max, t_min in zip(max_temps, min_temps):
                    t_avg = (t_max + t_min) / 2.0
                    gdd_sum += max(0.0, t_avg - 10.0) * 30.4
                
                s_dtr = np.mean([t_max - t_min for t_max, t_min in zip(max_temps, min_temps)])
                s_soil = np.mean(soil_wets)
                s_soil_root = np.mean(soil_roots)
                s_swdi = s_rain - (1.15 * s_temp * s_solar)
                s_wind = np.mean(winds)
                s_skin = np.mean(skins)
                
                flood = max(0.0, (s_soil - 0.82) * 50.0) if season in ["Aus", "Aman"] else 0.0
                drought = max(0.0, (0.50 - s_soil_root) * 50.0) if season == "Boro" else 0.0
                
                # Settle ET/PET and ONI parameters
                s_et = np.sum(evs) * 30.4
                pet_sum = 0.0
                for t_mean, t_max, t_min, solar_rad in zip(temps, max_temps, min_temps, solars):
                    pet_val = 0.0023 * (t_mean + 17.8) * np.sqrt(max(0.1, t_max - t_min)) * solar_rad
                    pet_sum += pet_val * 30.4
                    
                oni_vals = []
                for m in months:
                    y_lookup = 2024 - 1 if (m == 12 and season == "Boro") else 2024
                    oni_vals.append(oni_dict.get((y_lookup, m), 0.0))
                s_oni = np.mean(oni_vals)
                
                area = area_lookup_2023.get((district, season), features_df[features_df["season"] == season]["area_ha"].median())
                
                records_2024.append({
                    "district": district,
                    "division": division,
                    "year": 2024,
                    "season": season,
                    "area_ha": float(area),
                    "production_mt": 0.0,
                    "yield_mtha": 0.0,
                    "season_temp_c": float(s_temp),
                    "season_rain_mm": float(s_rain),
                    "season_rh_pct": float(s_rh),
                    "season_solar_mj_m2": float(s_solar),
                    "season_gdd": float(gdd_sum),
                    "season_dtr": float(s_dtr),
                    "season_soil_wetness": float(s_soil),
                    "season_soil_wetness_root": float(s_soil_root),
                    "season_swdi": float(s_swdi),
                    "flood_index": float(flood),
                    "drought_index": float(drought),
                    "season_wind_speed": float(s_wind),
                    "season_earth_skin_temp": float(s_skin),
                    "season_et": float(s_et),
                    "season_pet": float(pet_sum),
                    "season_oni": float(s_oni)
                })
        df_2024 = pd.DataFrame(records_2024)
        # Inject minor operational land shift noise (±2%)
        np.random.seed(42)
        area_noise_2024 = np.random.uniform(-0.02, 0.02, size=len(df_2024))
        df_2024["area_ha"] = (df_2024["area_ha"] * (1.0 + area_noise_2024)).round(1)
        
    # 2. Project 2025-2029 using Climatological Medians + Stochastic Seasonal Noise
    from src.utils.coordinates import DISTRICT_COORDINATES
    numeric_cols = [
        "season_temp_c", "season_rain_mm", "season_rh_pct", "season_solar_mj_m2",
        "season_gdd", "season_dtr", "season_soil_wetness", "season_soil_wetness_root", "season_swdi",
        "flood_index", "drought_index", "season_wind_speed", "season_earth_skin_temp",
        "season_et", "season_pet", "season_oni"
    ]
    
    # Calculate historical seasonal medians and standard deviations per district-season (2015-2023)
    seasonal_medians = features_df.groupby(["district", "season"])[numeric_cols].median().reset_index()
    seasonal_stds = features_df.groupby(["district", "season"])[numeric_cols].std().reset_index().fillna(0.0)
    
    # Rolling area ha
    area_rolling_median = features_df[features_df["year"] >= 2021].groupby(["district", "season"])["area_ha"].median().to_dict()
    
    future_list = []
    np.random.seed(42)
    for yr in range(2025, end_year + 1):
        df_yr = seasonal_medians.copy()
        df_yr["year"] = yr
        df_yr["division"] = df_yr["district"].map(lambda d: DISTRICT_COORDINATES.get(d, {}).get("division", "Unknown"))
        # Project area_ha with minor operational land shift noise (±2%)
        df_yr["area_ha"] = df_yr.apply(lambda r: area_rolling_median.get((r["district"], r["season"]), 10000.0), axis=1)
        area_noise = np.random.uniform(-0.02, 0.02, size=len(df_yr))
        df_yr["area_ha"] = (df_yr["area_ha"] * (1.0 + area_noise)).round(1)
        
        # Add seasonal noise
        for col in numeric_cols:
            stds = seasonal_stds[col].values
            # 85% of standard deviation to ensure natural year-to-year swings
            noise = np.random.normal(0, stds * 0.85)
            df_yr[col] = df_yr[col] + noise
            
            # Clamp values
            if col in ["season_rain_mm", "season_gdd", "season_dtr", "season_soil_wetness", "season_soil_wetness_root", "flood_index", "drought_index", "season_et", "season_pet"]:
                df_yr[col] = df_yr[col].clip(lower=0.0)
            if col in ["season_soil_wetness", "season_soil_wetness_root"]:
                df_yr[col] = df_yr[col].clip(upper=1.0)
            if col in ["season_rh_pct"]:
                df_yr[col] = df_yr[col].clip(lower=20.0, upper=100.0)
            if col in ["season_wind_speed"]:
                df_yr[col] = df_yr[col].clip(lower=0.1)
            if col == "season_oni":
                df_yr[col] = df_yr[col].clip(lower=-3.0, upper=3.0)
                
        df_yr["flood_index"] = df_yr.apply(lambda r: max(0.0, (r["season_soil_wetness"] - 0.82) * 50.0) if r["season"] in ["Aus", "Aman"] else 0.0, axis=1)
        df_yr["drought_index"] = df_yr.apply(lambda r: max(0.0, (0.50 - r["season_soil_wetness_root"]) * 50.0) if r["season"] == "Boro" else 0.0, axis=1)
        
        df_yr["production_mt"] = 0.0
        df_yr["yield_mtha"] = 0.0
        
        future_list.append(df_yr)
        
    df_2025_2029 = pd.concat(future_list, ignore_index=True)
    
    # Combine 2024 and 2025-2029
    future_dfs = []
    if len(df_2024) > 0:
        future_dfs.append(df_2024)
    if len(df_2025_2029) > 0:
        future_dfs.append(df_2025_2029)
        
    df_future = pd.concat(future_dfs, ignore_index=True)
    
    # Inject Stacked Division Prior Feature
    div_preds = []
    for _, row in df_future.iterrows():
        feats = [
            row["year"],
            row["season_temp_c"] + (row["season_dtr"] / 2.0), # Max temp
            row["season_temp_c"] - (row["season_dtr"] / 2.0), # Min temp
            row["season_wind_speed"] * 1.2, # Max wind proxy
            row["season_wind_speed"] * 0.1, # Min wind proxy
            row["season_rain_mm"], # Precipitation
            row["season_solar_mj_m2"], # PAR
            row["season_soil_wetness_root"], # Root Soil Wetness
            row["season_soil_wetness"], # Surface Soil Wetness
            row["season_rh_pct"], # Humidity
            row["season_earth_skin_temp"] # Skin Temp
        ]
        div_preds.append(div_model.predict([feats])[0])
    df_future["division_yield_prior"] = div_preds
    
    # Inject Historical Baseline Yield Profile
    baseline_vals = []
    for _, row in df_future.iterrows():
        key = f"{row['district']}_{row['season']}"
        if key in historical_lookup:
            baseline_vals.append(historical_lookup[key])
        else:
            # Fallback: division average baseline for that season
            div_keys = [k for k in historical_lookup.keys() if k.endswith(f"_{row['season']}")]
            div_vals = [historical_lookup[k] for k in div_keys]
            if div_vals:
                baseline_vals.append(np.mean(div_vals))
            else:
                season_fallback = {"Aus": 2.05, "Aman": 2.55, "Boro": 4.10}
                baseline_vals.append(season_fallback.get(row["season"], 2.5))
    df_future["historical_baseline_yield"] = baseline_vals
    
    # Predict using district Ensemble Voting Regressor
    features = [
        "division", "district", "season", "area_ha", 
        "season_temp_c", "season_rain_mm", "season_rh_pct", "season_solar_mj_m2",
        "season_gdd", "season_dtr", "season_soil_wetness", "season_soil_wetness_root", "season_swdi",
        "flood_index", "drought_index",
        "season_wind_speed", "season_earth_skin_temp",
        "division_yield_prior", "historical_baseline_yield"
    ]
    df_future["pred_yield_mtha"] = model_pipeline.predict(df_future[features])
    df_future["pred_yield_mtha"] = df_future["pred_yield_mtha"].round(2)
    df_future["production_mt"] = (df_future["area_ha"] * df_future["pred_yield_mtha"]).round(2)
    
    return df_future

def main():
    print("Exporting static frontend JSON data artifacts...")
    
    # 1. Load trained model pipeline
    model_path = "model/crop_yield_model.joblib"
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"{model_path} not found. Run train_model.py first.")
    model = joblib.load(model_path)
    
    # Load Division prior model
    div_model_path = "model/division_yield_model.joblib"
    if not os.path.exists(div_model_path):
        raise FileNotFoundError(f"{div_model_path} not found.")
    div_model = joblib.load(div_model_path)
    
    # Load historical baseline yield profiles
    baseline_path = "data/processed/historical_baseline_yields.json"
    historical_lookup = {}
    if os.path.exists(baseline_path):
        with open(baseline_path, "r") as f:
            historical_lookup = json.load(f)
            
    # 2. Load engineered features
    features_path = "data/processed/features_engineered.csv"
    if not os.path.exists(features_path):
        raise FileNotFoundError(f"{features_path} not found. Run feature_engineer.py first.")
    features_df = pd.read_csv(features_path)
    
    # Inject stacked division prior to features_df
    div_preds = []
    for _, row in features_df.iterrows():
        feats = [
            row["year"],
            row["season_temp_c"] + (row["season_dtr"] / 2.0), # Max temp
            row["season_temp_c"] - (row["season_dtr"] / 2.0), # Min temp
            row["season_wind_speed"] * 1.2,
            row["season_wind_speed"] * 0.1,
            row["season_rain_mm"],
            row["season_solar_mj_m2"],
            row["season_soil_wetness_root"],
            row["season_soil_wetness"],
            row["season_rh_pct"],
            row["season_earth_skin_temp"]
        ]
        div_preds.append(div_model.predict([feats])[0])
    features_df["division_yield_prior"] = div_preds
    
    # Inject historical baseline yields to features_df
    baseline_vals = []
    for _, row in features_df.iterrows():
        key = f"{row['district']}_{row['season']}"
        if key in historical_lookup:
            baseline_vals.append(historical_lookup[key])
        else:
            # Fallback: division average baseline for that season
            div_keys = [k for k in historical_lookup.keys() if k.endswith(f"_{row['season']}")]
            div_vals = [historical_lookup[k] for k in div_keys]
            if div_vals:
                baseline_vals.append(np.mean(div_vals))
            else:
                season_fallback = {"Aus": 2.05, "Aman": 2.55, "Boro": 4.10}
                baseline_vals.append(season_fallback.get(row["season"], 2.5))
    features_df["historical_baseline_yield"] = baseline_vals
    
    # 3. Generate predictions for historical years (2015-2023)
    features_list = [
        "division", "district", "season", "area_ha", 
        "season_temp_c", "season_rain_mm", "season_rh_pct", "season_solar_mj_m2",
        "season_gdd", "season_dtr", "season_soil_wetness", "season_soil_wetness_root", "season_swdi",
        "flood_index", "drought_index",
        "season_wind_speed", "season_earth_skin_temp",
        "division_yield_prior", "historical_baseline_yield"
    ]
    features_df["pred_yield_mtha"] = model.predict(features_df[features_list])
    features_df["pred_yield_mtha"] = features_df["pred_yield_mtha"].round(2)
    
    # 4. Project 2024-2029 predictions
    df_future = project_future_records(features_df, model, div_model, historical_lookup)
    
    # Combine historical and projection records
    if len(df_future) > 0:
        combined_df = pd.concat([features_df, df_future], ignore_index=True)
    else:
        combined_df = features_df.copy()
        
    # Sort for consistent error correction grouping
    combined_df = combined_df.sort_values(by=["district", "season", "year"]).reset_index(drop=True)
    
    # Preserve raw predictions before they are modified by Kalman error correction
    combined_df["raw_pred_yield_mtha"] = combined_df["pred_yield_mtha"]
    
    # 4b. Apply Recursive Kalman-style Feedback Loop (Error Correction)
    corrected_yields = []
    
    # Group by district and season to trace errors chronologically
    for (district, season), group in combined_df.groupby(["district", "season"]):
        last_observed_error = 0.0
        
        # Iterate through group
        for idx, row in group.iterrows():
            year = int(row["year"])
            pred = float(row["pred_yield_mtha"])
            actual = float(row["yield_mtha"])
            
            if year <= 2023:
                # Historical years: We observe the ground truth actual yield from BBS
                # Corrected prediction:
                corrected_pred = pred + 0.35 * last_observed_error
                
                # Record the new error from this corrected prediction
                # Clamp error at [-0.6, 0.6] to prevent extreme weather anomalies from skewing
                last_observed_error = actual - corrected_pred
                last_observed_error = np.clip(last_observed_error, -0.6, 0.6)
            else:
                # Forecast years (2024-2029): BBS actual yield is unobserved
                # Corrected prediction carries forward the last observed historical error:
                corrected_pred = pred + 0.35 * last_observed_error
                
            corrected_yields.append({
                "index": idx,
                "corrected_pred_yield": np.round(max(0.1, corrected_pred), 2)
            })
            
    corrected_df = pd.DataFrame(corrected_yields).set_index("index")
    combined_df["pred_yield_mtha"] = combined_df.index.map(corrected_df["corrected_pred_yield"])
    # Recalculate production based on corrected yield
    combined_df["production_mt"] = (combined_df["area_ha"] * combined_df["pred_yield_mtha"]).round(2)
    
    # Re-sort for consistent dashboard display
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
        
    # 6d. Export 1995-2014 Excel Raw Rows for explorer
    hist_explorer_records = []
    file_1 = "data/raw/crop_1995_2004.csv"
    if os.path.exists(file_1):
        df1 = pd.read_csv(file_1)
        for _, row in df1.iterrows():
            area_raw = row["Area(acres)"]
            prod_raw = row["Production(tons)"]
            area_val = float(area_raw) if (pd.notna(area_raw) and str(area_raw).strip() != "") else None
            prod_val = float(prod_raw) if (pd.notna(prod_raw) and str(prod_raw).strip() != "") else None
            
            yield_val = 0.0
            if area_val is not None and prod_val is not None and area_val > 0:
                yield_val = float(np.round((prod_val * 1.01605) / (area_val * 0.404686), 2))
                
            hist_explorer_records.append({
                "district": str(row["District"]),
                "division": str(row["Division"]),
                "year": int(row["Year"]),
                "season": str(row["Crop Type"]),
                "area_acres": area_val,
                "production_tons": prod_val,
                "yield_mtha": yield_val
            })
    file_2 = "data/raw/crop_2005_2014.csv"
    if os.path.exists(file_2):
        df2 = pd.read_csv(file_2)
        for _, row in df2.iterrows():
            area_raw = row["Area(acres)"]
            prod_raw = row["Production(tons)"]
            area_val = float(area_raw) if (pd.notna(area_raw) and str(area_raw).strip() != "") else None
            prod_val = float(prod_raw) if (pd.notna(prod_raw) and str(prod_raw).strip() != "") else None
            
            yield_val = 0.0
            if area_val is not None and prod_val is not None and area_val > 0:
                yield_val = float(np.round((prod_val * 1.01605) / (area_val * 0.404686), 2))
                
            hist_explorer_records.append({
                "district": str(row["District"]),
                "division": str(row["Division"]),
                "year": int(row["Year"]),
                "season": str(row["Crop Type"]),
                "area_acres": area_val,
                "production_tons": prod_val,
                "yield_mtha": yield_val
            })
    with open("public/data/historical_crop_raw.json", "w") as f:
        json.dump(hist_explorer_records, f, indent=2)
    print(f"Exported historical_crop_raw.json ({len(hist_explorer_records)} records)")
    
    # 6e. Export Raw Division Agroclimatic Data
    division_path = "data/raw/Bangladesh Agroclimatic Crop Yield (2000-2024).csv"
    if os.path.exists(division_path):
        div_df = pd.read_csv(division_path)
        div_records = []
        for _, row in div_df.iterrows():
            div_records.append({
                "division": row["Division"],
                "year": int(row["year"]),
                "yield_mtha": float(np.round(row["Crop yield"], 2)),
                "temp_max": float(np.round(row["Max temp"], 1)),
                "temp_min": float(np.round(row["Min temp"], 1)),
                "wind_speed_max": float(np.round(row["Max Wind Speed"], 2)),
                "wind_speed_min": float(np.round(row["Min wind speed"], 2)),
                "rain_sum": float(np.round(row["Precipitation Corrected Sum"], 1)),
                "par": float(np.round(row["All Sky Surface Total PAR"], 1)),
                "soil_wetness_root": float(np.round(row["Root Zone Soil Wetness"], 2)),
                "soil_wetness_surf": float(np.round(row["Surface Soil Wetness"], 2)),
                "humidity": float(np.round(row["Humidity"], 1)),
                "skin_temp": float(np.round(row["Earth Skin Temp"], 1))
            })
        with open("public/data/division_agroclimatic_raw.json", "w") as f:
            json.dump(div_records, f, indent=2)
        print(f"Exported division_agroclimatic_raw.json ({len(div_records)} records)")
    
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
            "raw_pred_yield_mtha": float(np.round(row["raw_pred_yield_mtha"], 2)) if "raw_pred_yield_mtha" in row else float(np.round(row["pred_yield_mtha"], 2)),
            "temp_c": float(np.round(row["season_temp_c"], 1)),
            "rain_mm": float(np.round(row["season_rain_mm"], 1)),
            "rh_pct": float(np.round(row["season_rh_pct"], 1)),
            "solar_mj": float(np.round(row["season_solar_mj_m2"], 1)),
            "flood": float(np.round(row["flood_index"], 2)),
            "drought": float(np.round(row["drought_index"], 2)),
            "wind_speed": float(np.round(row["season_wind_speed"], 2)),
            "earth_skin_temp": float(np.round(row["season_earth_skin_temp"], 1)),
            "et": float(np.round(row["season_et"], 1)) if "season_et" in row else 0.0,
            "pet": float(np.round(row["season_pet"], 1)) if "season_pet" in row else 0.0,
            "oni": float(np.round(row["season_oni"], 2)) if "season_oni" in row else 0.0,
            "division_prior": float(np.round(row["division_yield_prior"], 2)),
            "historical_baseline": float(np.round(row["historical_baseline_yield"], 2))
        })
    with open("public/data/yield_data.json", "w") as f:
        json.dump(yield_records, f, indent=2)
    print(f"Exported yield_data.json ({len(yield_records)} records)")
    
    # 8. Export Summary / Metadata for validation & details
    regressor = model.named_steps["regressor"]
    preprocessor = model.named_steps["preprocessor"]
    
    num_cols = list(preprocessor.transformers[0][2])
    cat_cols = list(preprocessor.transformers[1][2])
    cat_encoder = preprocessor.named_transformers_["cat"]
    encoded_cat_features = list(cat_encoder.get_feature_names_out(cat_cols))
    all_features = num_cols + encoded_cat_features
    # Average the feature importances of the fitted sub-estimators
    importances_list = []
    for est in regressor.estimators_:
        if hasattr(est, "feature_importances_"):
            importances_list.append(est.feature_importances_)
    importances = np.mean(importances_list, axis=0)
    
    importance_dict = {feat: float(imp) for feat, imp in zip(all_features, importances)}
    
    # Calculate global model statistics
    hist_only = combined_df[combined_df["year"] <= 2023]
    global_rmse = float(np.sqrt(np.mean((hist_only["yield_mtha"] - hist_only["pred_yield_mtha"]) ** 2)))
    global_mae = float(np.mean(np.abs(hist_only["yield_mtha"] - hist_only["pred_yield_mtha"])))
    
    summary = {
        "model_type": "Ensemble Voting Regressor Pipeline",
        "n_estimators": len(regressor.estimators),
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
