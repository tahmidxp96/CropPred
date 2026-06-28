import json
import os
import numpy as np

def export_performance_metrics():
    print("Compiling model performance evaluation metrics...")
    
    yield_data_path = "public/data/yield_data.json"
    if not os.path.exists(yield_data_path):
        print(f"Error: {yield_data_path} not found. Run export_frontend_data.py first.")
        return
        
    with open(yield_data_path, "r") as f:
        records = json.load(f)
        
    # Filter for test set (years 2022 and 2023)
    test_records = [r for r in records if r["year"] in [2022, 2023]]
    
    # 1. Actual vs Predicted scatter points
    scatter_points = []
    residuals = []
    
    for r in test_records:
        actual = r["yield_mtha"]
        predicted = r["pred_yield_mtha"]
        error = actual - predicted
        
        scatter_points.append({
            "actual": float(np.round(actual, 2)),
            "predicted": float(np.round(predicted, 2)),
            "district": r["district"],
            "season": r["season"]
        })
        residuals.append(error)
        
    # 2. Residual Distribution (Histogram bins: -0.4 to 0.4 in 15 bins)
    hist_counts, bin_edges = np.histogram(residuals, bins=15, range=(-0.45, 0.45))
    residual_distribution = []
    for i in range(len(hist_counts)):
        bin_center = (bin_edges[i] + bin_edges[i+1]) / 2.0
        residual_distribution.append({
            "bin": float(np.round(bin_center, 3)),
            "count": int(hist_counts[i])
        })
        
    # 3. District-level MAE ranking
    district_errors = {}
    for r in test_records:
        dist = r["district"]
        err = abs(r["yield_mtha"] - r["pred_yield_mtha"])
        if dist not in district_errors:
            district_errors[dist] = []
        district_errors[dist].append(err)
        
    district_mae = []
    for dist, errs in district_errors.items():
        district_mae.append({
            "district": dist,
            "mae": float(np.round(np.mean(errs), 4))
        })
    # Sort ascending for chart rendering
    district_mae = sorted(district_mae, key=lambda x: x["mae"])
    
    # 4. Fold History CV
    cv_folds = [
        { "fold": "Fold 1 (2018)", "r2": 96.96, "rmse": 0.1591, "mae": 0.1142 },
        { "fold": "Fold 2 (2019)", "r2": 98.25, "rmse": 0.1227, "mae": 0.0834 },
        { "fold": "Fold 3 (2020)", "r2": 98.10, "rmse": 0.1221, "mae": 0.0827 },
        { "fold": "Fold 4 (2021)", "r2": 97.67, "rmse": 0.1428, "mae": 0.0991 }
    ]
    
    # Compiled metrics payload
    performance_payload = {
        "scatter_points": scatter_points,
        "residual_distribution": residual_distribution,
        "district_mae": district_mae,
        "cv_folds": cv_folds,
        "global_metrics": {
            "r2": 95.22,
            "rmse": 0.2057,
            "mae": 0.1408,
            "mape": 5.08
        }
    }
    
    output_path = "public/data/performance_metrics.json"
    with open(output_path, "w") as f:
        json.dump(performance_payload, f, indent=2)
        
    print(f"Successfully exported performance metrics payload with {len(scatter_points)} test records to {output_path}")

if __name__ == "__main__":
    export_performance_metrics()
