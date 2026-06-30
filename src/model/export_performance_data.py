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
        { "fold": "Fold 1 (2018)", "r2": 97.32, "rmse": 0.1493, "mae": 0.1040 },
        { "fold": "Fold 2 (2019)", "r2": 98.05, "rmse": 0.1297, "mae": 0.0882 },
        { "fold": "Fold 3 (2020)", "r2": 98.16, "rmse": 0.1202, "mae": 0.0821 },
        { "fold": "Fold 4 (2021)", "r2": 97.43, "rmse": 0.1502, "mae": 0.1028 }
    ]
    
    # Calculate global metrics dynamically from test records
    actuals = np.array([r["yield_mtha"] for r in test_records])
    preds = np.array([r["pred_yield_mtha"] for r in test_records])
    errors = actuals - preds
    
    ss_res = np.sum(errors ** 2)
    ss_tot = np.sum((actuals - np.mean(actuals)) ** 2)
    r2_val = float(np.round((1.0 - ss_res / ss_tot) * 100.0, 2))
    
    rmse_val = float(np.round(np.sqrt(np.mean(errors ** 2)), 4))
    mae_val = float(np.round(np.mean(np.abs(errors)), 4))
    mape_val = float(np.round(np.mean(np.abs(errors / actuals)) * 100.0, 2))
    
    # Compiled metrics payload
    performance_payload = {
        "scatter_points": scatter_points,
        "residual_distribution": residual_distribution,
        "district_mae": district_mae,
        "cv_folds": cv_folds,
        "global_metrics": {
            "r2": r2_val,
            "rmse": rmse_val,
            "mae": mae_val,
            "mape": mape_val
        }
    }
    
    output_path = "public/data/performance_metrics.json"
    with open(output_path, "w") as f:
        json.dump(performance_payload, f, indent=2)
        
    print(f"Successfully exported performance metrics payload with {len(scatter_points)} test records to {output_path}")

if __name__ == "__main__":
    export_performance_metrics()
