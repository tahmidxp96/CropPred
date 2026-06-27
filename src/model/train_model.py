import os
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
    categorical_features = ["division", "season"]
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
        "drought_index"
    ]
    
    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )
    
    # Model pipeline using XGBRegressor
    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", XGBRegressor(
                n_estimators=120, 
                learning_rate=0.07, 
                max_depth=5, 
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42, 
                n_jobs=-1
            ))
        ]
    )
    
    return pipeline, numeric_features, categorical_features

def main():
    print("Training XGBoost Crop Yield Prediction Model...")
    
    input_path = "data/processed/features_engineered.csv"
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"{input_path} not found. Run feature_engineer.py first.")
        
    df = pd.read_csv(input_path)
    
    # Split chronologically to prevent temporal leakage (standard in research)
    # Train: 2015 - 2021, Test: 2022 - 2023
    train_df = df[df["year"] <= 2021]
    test_df = df[df["year"] >= 2022]
    
    print(f"Train set years: 2015-2021 ({len(train_df)} rows)")
    print(f"Test set years:  2022-2023 ({len(test_df)} rows)")
    
    # Extract features and targets
    features = [
        "division", "season", "area_ha", 
        "season_temp_c", "season_rain_mm", "season_rh_pct", "season_solar_mj_m2",
        "season_gdd", "season_dtr", "season_soil_wetness", "season_soil_wetness_root", "season_swdi",
        "flood_index", "drought_index"
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
    
    # Feature Importances from XGBoost
    regressor = pipeline.named_steps["regressor"]
    preprocessor = pipeline.named_steps["preprocessor"]
    
    # Get one-hot encoded categories
    cat_encoder = preprocessor.named_transformers_["cat"]
    encoded_cat_features = list(cat_encoder.get_feature_names_out(cat_cols))
    
    all_features = num_cols + encoded_cat_features
    importances = regressor.feature_importances_
    
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
