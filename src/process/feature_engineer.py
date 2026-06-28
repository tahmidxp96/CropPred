import os
import pandas as pd
import numpy as np

# Ensure processed data directory exists
os.makedirs("data/processed", exist_ok=True)

def engineer_seasonal_features(df):
    print("Engineering seasonal weather features...")
    
    # Initialize lists to collect feature values
    seasonal_temp = []
    seasonal_rain = []
    seasonal_rh = []
    seasonal_solar = []
    seasonal_gdd = []
    seasonal_dtr = []
    seasonal_soil_wetness = []
    seasonal_soil_wetness_root = []
    seasonal_swdi = []
    seasonal_wind = []
    seasonal_skin_temp = []
    
    # Iterate through each row in the dataset
    for idx, row in df.iterrows():
        season = row["season"]
        
        # Aus: Sown in April/May, harvested in June/Aug (Months: 4, 5, 6, 7, 8)
        if season == "Aus":
            months = [4, 5, 6, 7, 8]
        # Aman: Sown in July/Aug, harvested in Nov/Dec (Months: 7, 8, 9, 10, 11, 12)
        elif season == "Aman":
            months = [7, 8, 9, 10, 11, 12]
        # Boro: Sown in Dec/Jan, harvested in Apr/May (Months: 12, 1, 2, 3, 4, 5)
        else: # Boro
            months = [12, 1, 2, 3, 4, 5]
            
        # Extract variables for the target months
        temps = [row[f"temp_c_{m}"] for m in months]
        rains = [row[f"rain_mm_day_{m}"] for m in months]
        rhs = [row[f"rh_pct_{m}"] for m in months]
        solars = [row[f"solar_mj_m2_day_{m}"] for m in months]
        
        # New features
        max_temps = [row[f"temp_max_c_{m}"] for m in months]
        min_temps = [row[f"temp_min_c_{m}"] for m in months]
        soil_wets = [row[f"gwettop_{m}"] for m in months]
        soil_roots = [row[f"gwetroot_{m}"] for m in months]
        winds = [row[f"wind_speed_{m}"] for m in months]
        skins = [row[f"earth_skin_temp_{m}"] for m in months]
        
        # Calculate summaries (means and sums)
        s_temp = np.mean(temps)
        s_rain = np.sum(rains) * 30.0
        s_rh = np.mean(rhs)
        s_solar = np.mean(solars)
        
        seasonal_temp.append(s_temp)
        seasonal_rain.append(s_rain) 
        seasonal_rh.append(s_rh)
        seasonal_solar.append(s_solar)
        
        # Growing Degree Days (GDD) accumulated over the season months
        gdd_sum = 0.0
        for t_max, t_min in zip(max_temps, min_temps):
            t_avg = (t_max + t_min) / 2.0
            gdd_sum += max(0.0, t_avg - 10.0) * 30.4
        seasonal_gdd.append(gdd_sum)
        
        # Diurnal Temperature Range (DTR)
        dtr_vals = [t_max - t_min for t_max, t_min in zip(max_temps, min_temps)]
        seasonal_dtr.append(np.mean(dtr_vals))
        
        # Soil Wetness
        seasonal_soil_wetness.append(np.mean(soil_wets))
        seasonal_soil_wetness_root.append(np.mean(soil_roots))
        
        # Seasonal Water Deficit Index (SWDI) representing precipitation minus evaporation proxy
        swdi_val = s_rain - (1.15 * s_temp * s_solar)
        seasonal_swdi.append(swdi_val)
        
        # Wind and Skin Temp
        seasonal_wind.append(np.mean(winds))
        seasonal_skin_temp.append(np.mean(skins))
        
    df["season_temp_c"] = seasonal_temp
    df["season_rain_mm"] = seasonal_rain
    df["season_rh_pct"] = seasonal_rh
    df["season_solar_mj_m2"] = seasonal_solar
    df["season_gdd"] = seasonal_gdd
    df["season_dtr"] = seasonal_dtr
    df["season_soil_wetness"] = seasonal_soil_wetness
    df["season_soil_wetness_root"] = seasonal_soil_wetness_root
    df["season_swdi"] = seasonal_swdi
    df["season_wind_speed"] = seasonal_wind
    df["season_earth_skin_temp"] = seasonal_skin_temp
    
    # Add anomaly indices
    # 1. Flood index: High rainfall during Aman/Aus season (> 2500 mm total rainfall)
    df["flood_index"] = df.apply(
        lambda r: max(0.0, r["season_rain_mm"] - 2200.0) / 100.0 if r["season"] in ["Aman", "Aus"] else 0.0, 
        axis=1
    )
    
    # 2. Drought index: Low rainfall during Boro winter season (< 100 mm total rainfall)
    df["drought_index"] = df.apply(
        lambda r: max(0.0, 120.0 - r["season_rain_mm"]) / 10.0 if r["season"] == "Boro" else 0.0,
        axis=1
    )
    
    # 3. Add Division mapping from district coordinate mapping
    from src.utils.coordinates import DISTRICT_COORDINATES
    df["division"] = df["district"].map(lambda d: DISTRICT_COORDINATES.get(d, {}).get("division", "Unknown"))
    
    # Keep only the engineered features and baseline identifiers
    cols_to_keep = [
        "district", "division", "year", "season", 
        "area_ha", "production_mt", "yield_mtha",
        "season_temp_c", "season_rain_mm", "season_rh_pct", "season_solar_mj_m2",
        "season_gdd", "season_dtr", "season_soil_wetness", "season_soil_wetness_root", "season_swdi",
        "flood_index", "drought_index", "season_wind_speed", "season_earth_skin_temp"
    ]
    
    # Drop raw monthly columns
    features_df = df[cols_to_keep]
    return features_df

def main():
    input_path = "data/processed/cleaned_merged.csv"
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"{input_path} not found. Run merge_process.py first.")
        
    df = pd.read_csv(input_path)
    features_df = engineer_seasonal_features(df)
    
    output_path = "data/processed/features_engineered.csv"
    features_df.to_csv(output_path, index=False)
    print(f"Features engineered successfully and saved to {output_path} ({len(features_df)} records)")

if __name__ == "__main__":
    main()
