import os
import json
import pandas as pd
import numpy as np
import joblib
from xgboost import XGBRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# Ensure model directory exists
os.makedirs("model", exist_ok=True)

def build_model_pipeline():
    # Define features
    categorical_features = ["division", "district", "season"]
    numeric_features = [
        "area_ha", 
        "season_temp_c", 
        "season_rain_mm", 
        "season_rh_pct", 
        "season_solar_mj_m2",
        "season_gdd",
        "season_dtr",
        "season_soil_wetness",
        "season_soil_wetness_root",
        "season_swdi",
        "flood_index", 
        "drought_index",
        "season_wind_speed",
        "season_earth_skin_temp",
        "season_et",
        "season_pet",
        "season_oni",
        "division_yield_prior",
        "historical_baseline_yield"
    ]
    
    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )
    
    # Model pipeline using VotingRegressor
    from sklearn.ensemble import VotingRegressor, RandomForestRegressor, GradientBoostingRegressor
    
    xgb = XGBRegressor(
        n_estimators=120, 
        learning_rate=0.07, 
        max_depth=5, 
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42, 
        n_jobs=-1
    )
    
    rf = RandomForestRegressor(
        n_estimators=150,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    
    gbr = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.08,
        max_depth=4,
        random_state=42
    )
    
    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", VotingRegressor(
                estimators=[
                    ('xgb', xgb),
                    ('rf', rf),
                    ('gbr', gbr)
                ],
                n_jobs=-1
            ))
        ]
    )
    
    return pipeline, numeric_features, categorical_features

def main():
    print("Training Ensemble Crop Yield Prediction Model...")
    
    # 1. Train Division-Level Prior Model
    division_path = "data/raw/Bangladesh Agroclimatic Crop Yield (2000-2024).csv"
    if not os.path.exists(division_path):
        raise FileNotFoundError(f"{division_path} not found.")
    
    div_df = pd.read_csv(division_path)
    div_features = [
        "year", "Max temp", "Min temp", "Max Wind Speed", "Min wind speed",
        "Precipitation Corrected Sum", "All Sky Surface Total PAR",
        "Root Zone Soil Wetness", "Surface Soil Wetness", "Humidity", "Earth Skin Temp"
    ]
    div_target = "Crop yield"
    
    from sklearn.ensemble import GradientBoostingRegressor
    div_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    div_model.fit(div_df[div_features], div_df[div_target])
    
    joblib.dump(div_model, "model/division_yield_model.joblib")
    print("Division prior model successfully trained and saved to model/division_yield_model.joblib")
    
    # 2. Load District-Level Engineered Features
    input_path = "data/processed/features_engineered.csv"
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"{input_path} not found. Run feature_engineer.py first.")
        
    df = pd.read_csv(input_path)
    
    # 3. Inject Stacked Division Prior Feature
    div_preds = []
    for _, row in df.iterrows():
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
    df["division_yield_prior"] = div_preds
    
    # 4. Inject Historical Baseline Yield Profile
    baseline_path = "data/processed/historical_baseline_yields.json"
    historical_lookup = {}
    if os.path.exists(baseline_path):
        with open(baseline_path, "r") as f:
            historical_lookup = json.load(f)
            
    baseline_vals = []
    for _, row in df.iterrows():
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
    df["historical_baseline_yield"] = baseline_vals
    
    # Split chronologically to prevent temporal leakage (standard in research)
    # Train: 2015 - 2021, Test: 2022 - 2023
    train_df = df[df["year"] <= 2021]
    test_df = df[df["year"] >= 2022]
    
    print(f"Train set years: 2015-2021 ({len(train_df)} rows)")
    print(f"Test set years:  2022-2023 ({len(test_df)} rows)")
    
    # Extract features and targets
    features = [
        "division", "district", "season", "area_ha", 
        "season_temp_c", "season_rain_mm", "season_rh_pct", "season_solar_mj_m2",
        "season_gdd", "season_dtr", "season_soil_wetness", "season_soil_wetness_root", "season_swdi",
        "flood_index", "drought_index",
        "season_wind_speed", "season_earth_skin_temp", "season_et", "season_pet", "season_oni",
        "division_yield_prior", "historical_baseline_yield"
    ]
    target = "yield_mtha"
    
    X_train, y_train = train_df[features], train_df[target]
    X_test, y_test = test_df[features], test_df[target]
    
    # Run Chronological Rolling-Origin Cross-Validation on the training set
    print("\nRunning Chronological Cross-Validation (on training years 2015-2021)...")
    cv_scores = []
    for val_year in range(2018, 2022):
        cv_train = train_df[train_df["year"] < val_year]
        cv_val = train_df[train_df["year"] == val_year]
        
        cv_pipeline, _, _ = build_model_pipeline()
        cv_pipeline.fit(cv_train[features], cv_train[target])
        preds = cv_pipeline.predict(cv_val[features])
        r2 = r2_score(cv_val[target], preds)
        rmse = np.sqrt(mean_squared_error(cv_val[target], preds))
        print(f"  -> Fold (Train < {val_year} | Val {val_year}): R² = {r2:.4f}, RMSE = {rmse:.4f} MT/ha")
        cv_scores.append(r2)
    print(f"Mean Chronological CV R²: {np.mean(cv_scores):.4f}\n")
    
    # Instantiate pipeline for final training
    pipeline, num_cols, cat_cols = build_model_pipeline()
    
    # Train final model
    pipeline.fit(X_train, y_train)
    print("Final model pipeline training complete.")
    
    # Evaluate
    y_pred_train = pipeline.predict(X_train)
    y_pred_test = pipeline.predict(X_test)
    
    # Metrics
    train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    
    train_mae = mean_absolute_error(y_train, y_pred_train)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    
    train_r2 = r2_score(y_train, y_pred_train)
    test_r2 = r2_score(y_test, y_pred_test)
    
    print("\n--- Model Evaluation ---")
    print(f"Train RMSE: {train_rmse:.4f} MT/ha | Test RMSE: {test_rmse:.4f} MT/ha")
    print(f"Train MAE:  {train_mae:.4f} MT/ha | Test MAE:  {test_mae:.4f} MT/ha")
    print(f"Train R²:   {train_r2:.4f}         | Test R²:   {test_r2:.4f}")
    print("------------------------\n")
    
    # Feature Importances from Ensemble Voting
    regressor = pipeline.named_steps["regressor"]
    preprocessor = pipeline.named_steps["preprocessor"]
    
    # Get one-hot encoded categories
    cat_encoder = preprocessor.named_transformers_["cat"]
    encoded_cat_features = list(cat_encoder.get_feature_names_out(cat_cols))
    
    all_features = num_cols + encoded_cat_features
    
    # Average the feature importances of the fitted sub-estimators
    importances_list = []
    for est in regressor.estimators_:
        if hasattr(est, "feature_importances_"):
            importances_list.append(est.feature_importances_)
    importances = np.mean(importances_list, axis=0)
    
    importance_df = pd.DataFrame({
        "Feature": all_features,
        "Importance": importances
    }).sort_values(by="Importance", ascending=False)
    
    print("Feature Importances:")
    print(importance_df.to_string(index=False))
    
    # Save the pipeline
    model_output_path = "model/crop_yield_model.joblib"
    joblib.dump(pipeline, model_output_path)
    print(f"\nModel pipeline successfully saved to {model_output_path}")

if __name__ == "__main__":
    main()
