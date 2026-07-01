# CropPred: Spatial Digital Twin for Crop Yield Forecasting in Bangladesh 🌾🇧🇩

[![Deploy static content to Pages](https://github.com/tahmidxp96/CropPred/actions/workflows/deploy.yml/badge.svg)](https://github.com/tahmidxp96/CropPred/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/Visit_Live_Page-Github-pages)](https://tahmidxp96.github.io/CropPred/)

An academic-grade, research-oriented Spatial Digital Twin built to model, predict, and visualize district-level rice yields (*Aus*, *Aman*, and *Boro* seasons) across Bangladesh. The platform integrates real-world subnational agricultural census records, multi-sensor NASA satellite climatology, NOAA oceanic teleconnection indices, and an Ensemble Machine Learning pipeline to project yields up to **2029** with recursive error-calibration loops.

---

## 📖 Layman's Overview: What is this Project?

### Why Crop Forecasting Matters in Bangladesh
Bangladesh is one of the most climate-vulnerable nations in the world. Rice is the primary staple crop, critical to the food security of over 170 million people. However, yields are constantly threatened by erratic monsoons, winter droughts, flash floods, and global warming. 

### How the "Digital Twin" Helps
A **Digital Twin** is a virtual, real-time replica of a physical system. 
This platform acts as a digital twin of Bangladesh's agricultural landscape:
1.  **Observes**: It maps NASA satellite weather telemetry directly onto all 64 districts.
2.  **Learns**: It trains on historical yields (BBS yearbook data) to recognize how weather factors (like rainfall anomalies, warm nights, and soil drought) impact crop growth.
3.  **Corrects & Predicts**: It estimates future yields up to **2029**, helping policy makers, grain importers, and researchers anticipate regional food deficits, schedule irrigation, and evaluate climate change risks years in advance.

---

## 🛠️ Technical Overview: Machine Learning & Mathematics

The platform's backend operates on a fully reproducible Python pipeline, processing data from raw APIs to a trained Ensemble ML model.

### 1. Ensemble Voting ML Architecture
To prevent tree-split biases and reduce prediction variances, the model is trained as a hybrid **Ensemble Voting Regressor** combining three robust algorithms:
*   **XGBoost Regressor**: Handles non-linear feature splits and additive gradient residuals.
*   **Random Forest Regressor**: Stabilizes variance through bootstrap aggregation (bagging) of deep trees.
*   **Gradient Boosting Regressor**: Regularizes predictions using shallow additive estimators.

Including `district` directly as a categorical feature allows the model to capture local soil profiles, baseline irrigation grids, and regional variety changes.
*   **Mean Chronological Cross-Validation $R^2$**: **$97.07\%$**
*   **Final Test set $R^2$ (Years 2022–2023)**: **$97.96\%$**
*   **Test RMSE**: **$0.1343$ MT/ha** (predictions deviate by less than $\pm 134$ kg per hectare on average).

### 2. Custom Agronomic Features
The model incorporates physical, satellite-derived indicators rather than simple monthly averages:
*   **Accumulated Growing Degree Days (GDD)**: Models plant thermal maturity.
    $$\text{GDD} = \sum \max\left( \frac{T_{\max} + T_{\min}}{2} - T_{\text{base}}, 0 \right) \times \text{Days} \quad (T_{\text{base}} = 10^\circ\text{C})$$
*   **Diurnal Temperature Range (DTR)**: Measures nighttime respiration stress (narrower margins combined with warm nights decrease photosynthesis efficiency).
    $$\text{DTR} = \text{Mean}(T_{\max} - T_{\min})$$
*   **Root-Zone Soil Hydration (`GWETROOT`)**: Derived from NASA's GLDAS 0–100cm percolation telemetry, representing the underground water reservoir at the crop roots (far more stable than rapid surface wetness `GWETTOP`).
*   **Seasonal Water Deficit Index (SWDI)**: Models regional precipitation supply against evapotranspiration demand.
    $$\text{SWDI} = \text{Precipitation} - (1.15 \times \text{Temperature} \times \text{Solar Radiation})$$
*   **Monsoon Flood Index**: Quantifies excess surface soil saturation during Aus/Aman monsoon seasons.
    $$\text{Flood} = \max\left(0,\; (\text{GWETTOP} - 0.82) \times 50\right)$$
*   **Dry-Season Drought Index**: Captures root-zone water stress during Boro dry season.
    $$\text{Drought} = \max\left(0,\; (0.50 - \text{GWETROOT}) \times 50\right)$$
*   **Actual Evapotranspiration (ET)**: Accumulated seasonal land surface evaporation (`EVLAND`) from NASA MERRA-2 reanalysis, measuring actual water loss (mm/season).
*   **Potential Evapotranspiration (PET)**: Estimated via the Hargreaves–Samani equation using temperature extremes and downward solar irradiance:
    $$\text{PET} = 0.0023 \times (T_{\text{mean}} + 17.8) \times \sqrt{T_{\max} - T_{\min}} \times R_a$$
*   **Oceanic Niño Index (ONI)**: Seasonal mean ENSO anomaly (°C) from NOAA CPC's Niño 3.4 SST time series, capturing teleconnection impacts on Bangladesh's monsoon variability.
*   **Atmospheric Vapor Pressure Indicators**:
    *   **Specific Humidity (`QV2M`)**: Ingested directly from NASA POWER satellite observations, measuring absolute water vapor mass in air (g/kg). This represents the primary physical driver of plant transpiration, showing a high feature importance ranking of **14.5%**.
    *   **Dew Point Temperature (`T2MDEW`)**: Absolute moisture thresholds, capturing atmospheric mugginess.
    *   **Shortwave Solar Irradiance (`ALLSKY_SFC_SW_DWN`)**: The total solar energy reaching the plant canopy driving photosynthesis.
    *   **Wind Speed at 50m (`WS50M`)**: Wind turbulence and lodging risk at higher elevations.

### 3. Kalman-Style Recursive Feedback Loop
To correct for systematic drift (such as localized soil degradation or salinity updates), predictions are recursively calibrated using historical prediction errors:
$$\hat{y}_{t}^{\text{corrected}} = \hat{y}_{t}^{\text{base}} + K \cdot (y_{t-1} - \hat{y}_{t-1}^{\text{corrected}}) \quad (K = 0.35)$$
For future forecast years (2024–2029) where actual BBS yields $y_{t-1}$ are unobserved, the feedback loop carries forward the last observed historical correction offset.

### 4. Stochastic Projections (2025–2029)
*   **Weather Projections**: Future weather uses 10-year district climatology medians. To prevent the timeline from looking linear or flat, we inject **stochastic climate noise** ($\pm 85\%$ of historical seasonal standard deviations).
*   **Acreage Projections**: Cultivated area (`area_ha`) is projected using a rolling 3-year historical median with operational land-use fluctuations ($\pm 2\%$ variance) to simulate crop rotations.

---

## 📂 System Architecture

The project features a decoupled serverless structure. All machine learning predictions are precomputed on a physical twin and exported as flat static JSON payloads. The frontend is built using Next.js and TailwindCSS, served directly from a global CDN cache with zero database overhead.

```
CropPred/
├── app/                              # Next.js App Router (Frontend)
│   ├── explorer/
│   │   └── page.js                   # CSV Registry Explorer Route
│   ├── methodology/
│   │   └── page.js                   # Research Methodology & validation Hub
│   ├── globals.css                   # Tailwind styles, scrollbars & visual tokens
│   ├── layout.js                     # HTML headers & SEO optimizations
│   └── page.js                       # Interactive Twin Dashboard UI
├── data/
│   ├── raw/                          # Raw inputs: BBS yearbook, NASA POWER, FAOSTAT, NOAA ONI
│   └── processed/                    # Standardized wide feature matrix
├── model/
│   └── crop_yield_model.joblib       # Trained Scikit-Learn/Ensemble Pipeline
├── public/
│   └── data/                         # Decoupled Static JSON Exports
│       ├── districts.json            # Geolocation centroids for SVG nodes
│       ├── fao_national.json         # FAO country validation statistics
│       ├── bbs_raw.json              # Digitized raw BBS yield census
│       ├── nasa_raw.json             # NASA monthly telemetry records
│       ├── yield_data.json           # 2015-2029 predictions and weather registry
│       └── summary.json              # Feature importances & CV stats
├── src/                              # Python data pipeline
│   ├── fetch/
│   │   ├── fetch_bbs.py              # Download historical BBS crop sheets
│   │   ├── fetch_fao.py              # Pull FAOSTAT reference records
│   │   ├── fetch_nasa.py             # Query NASA POWER climate telemetry (incl. EVLAND)
│   │   └── fetch_oni.py              # Download NOAA CPC Oceanic Niño Index time series
│   ├── model/
│   │   ├── train_model.py            # Train Ensemble Regressor with rolling CV
│   │   ├── export_frontend_data.py   # Compile predictions into static JSON
│   │   └── compare_accuracy.py       # Comparative study of modeling configurations
│   ├── process/
│   │   ├── merge_process.py          # Spelling standardization & wide format pivot
│   │   └── feature_engineer.py       # Compute GDD, DTR, GWETROOT, SWDI, ET, PET, ONI, Flood/Drought
│   ├── tests/
│   │   └── validate_metrics.py       # Pipeline validation suite
│   └── utils/
│       └── coordinates.py            # Centroid maps for all 64 districts
├── package.json                      # Next.js node modules config
└── requirements.txt                  # Python dependencies registry
```

---

## 🚀 Installation & Local Execution

### 1. Setup the Python Data Pipeline
Ensure you have Python 3.9+ installed. Set up your virtual environment and install dependencies:

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

To run the pipeline, train the Ensemble models, and compile the frontend JSON payloads:
```bash
# 1. Fetch raw datasets (BBS, NASA POWER, FAOSTAT, NOAA ONI)
python3 src/fetch/fetch_bbs.py
python3 src/fetch/fetch_nasa.py
python3 src/fetch/fetch_fao.py
python3 src/fetch/fetch_oni.py

# 2. Pivot monthly telemetry and merge on district-season boundaries
python3 src/process/merge_process.py

# 3. Engineer seasonal agronomic indices (GDD, DTR, SWDI, GWETROOT, ET, PET, ONI)
python3 src/process/feature_engineer.py

# 4. Train the Ensemble Regressor models and export pipeline weights
python3 src/model/train_model.py

# 5. Export precomputed predictions & raw files as static JSON arrays
python3 src/model/export_frontend_data.py

# 6. Run automated schema validations
python3 src/tests/validate_metrics.py
```

### 2. Start the Frontend Dev Server
Ensure you have Node.js 18+ installed.

```bash
# Install NPM dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the dashboard.

---

## ⚡ Deployment & CI/CD Optimizations

The live site is hosted on GitHub Pages. To support near-instantaneous live page updates, we optimized the GitHub Actions runner pipeline, reducing total deployment times from **1m 2s down to 44 seconds** (a **$29\%$ speedup**):
1.  **Shallow Git Clones (`deploy.yml`)**: Restricts checkout history to the latest commit (`fetch-depth: 1`).
2.  **Node Modules Caching (`deploy.yml`)**: Caches `node_modules` tied to `package-lock.json`, completely bypassing the slow `npm ci` command on cache hits (reduces dependency setup from 25s to 2s).
3.  **Uncompressed Pages Artifacts (`deploy.yml`)**: Skips CPU-intensive zip/gzip packaging (`compression-level: 0`) since the GitHub Pages CDN handles compression on-the-fly.
4.  **Skipped Build Checks (`next.config.mjs`)**: Configures Next.js to ignore ESLint and TypeScript checks during the production build step, as these are already verified locally.

---

## 📚 Data Source Citations

1.  **BBS**: Subnational agricultural crop yields digitized from the *Bangladesh Bureau of Statistics (Ministry of Planning)* yearbooks (2015–2023).
2.  **BBS Historical Excel Registries**: Raw subnational crop records parsed from official Excel sheets (1995–2014) to compute long-term crop productivity baselines.
3.  **NASA POWER**: Climatological temperature, wind, humidity, solar radiation, and GLDAS soil hydration telemetry courtesy of NASA's *Prediction of Worldwide Energy Resources* project.
    - Variables: `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `RH2M`, `ALLSKY_SFC_PAR_TOT` (Photosynthetically Active Radiation), `GWETTOP`, `GWETROOT`, `TS`, `EVLAND`, `T2MDEW` (Dew Point), `QV2M` (Specific Humidity), `ALLSKY_SFC_SW_DWN` (Shortwave Solar Flux), `WS2M` (Wind 2m), `WS50M` (Wind 50m).
    - Ingestion Method: Fetched using a double-request merge strategy to query all 15 parameters without exceeding the API's 10-variable limit.
    - Endpoint: `https://power.larc.nasa.gov/api/temporal/monthly/point`
4.  **NOAA CPC Oceanic Niño Index (ONI)**: Sea Surface Temperature (SST) anomalies from the Niño 3.4 region, published by the *NOAA Climate Prediction Center*. Used to capture El Niño/La Niña teleconnection impacts on Bangladesh's monsoon rainfall.
    - Source: [NOAA CPC ONI Data](https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt)
    - Reference: Huang, B., et al. (2017). *Extended Reconstructed Sea Surface Temperature, Version 5 (ERSSTv5)*. Journal of Climate, 30(20), 8179–8205.
5.  **Division-Level Agroclimatic Dataset**: Compiled annual average crop yields and climatic indicators (2000–2024) used to pre-train division-level GBR prior models.
6.  **FAOSTAT**: National validation statistics compiled by the *Food and Agriculture Organization (FAO) of the United Nations*.

---

Developed by **[tahmidxp96](https://github.com/tahmidxp96)** | Made with **Antigravity** 🚀
