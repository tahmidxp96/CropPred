# Bangladesh Crop Yield Digital Twin (`croppred`)

An academic-grade, research-oriented Spatial Digital Twin built to model, predict, and visualize district-level rice yields in Bangladesh. The platform integrates real-world agricultural census records and NASA satellite telemetry to predict outcomes using a regularized XGBoost Regressor model.

---

## 🚀 Key Features

*   **XGBoost Prediction Engine**: Upgraded tree boosting model ($97.32\%$ test $R^2$) predicting yield rates (`yield_mtha`) across 64 districts.
*   **Agronomic Climate Indices**: Captures biological growing constraints via:
    *   *Growing Degree Days (GDD)*: Thermal energy accumulation above a base temperature of $10^\circ\text{C}$ to model grain maturity.
    *   *Diurnal Temperature Range (DTR)*: Day-night temperature margins ($T_{\max} - T_{\min}$) capturing nighttime crop respiration stress.
    *   *Surface Soil Wetness (`GWETTOP`)*: Satellite-derived soil hydration ratios acting as physical proxies for vegetation anomalies.
*   **Interactive Spatial Network Mesh**: A interactive digital twin network map connecting adjacent districts ($<80$ km) and color-coding nodes dynamically by yield.
*   **Registry Data Explorer**: A spreadsheet-like registry subpage (`/explorer`) to search, filter, and download raw BBS Yield, NASA Climate, and FAOSTAT datasets as CSV files.
*   **Methodology Hub**: A visual research archive (`/methodology`) documenting model training loss curves, chronological cross-validation folds, and relative agronomic feature importances.
*   **Decoupled Serverless Architecture**: Statically precomputes and exports all ML predictions into flat JSON files. Serves pages directly from the Vercel Edge CDN with zero server-side ML runtimes or database overhead.

---

## 📂 Project Architecture

```
CropPred/
├── app/                              # Next.js App Router (Frontend)
│   ├── explorer/
│   │   └── page.js                   # Spreadsheet Dataset Registry Explorer
│   ├── methodology/
│   │   └── page.js                   # Research Methodology & Validation Hub
│   ├── globals.css                   # Tailwind custom styling & tokens
│   ├── layout.js                     # HTML Layout & SEO tags
│   └── page.js                       # Interactive Twin Dashboard UI
├── data/
│   ├── raw/                          # Sourced raw files (BBS, NASA, FAO)
│   └── processed/                    # Cleaned and merged feature matrix
├── model/
│   └── crop_yield_model.joblib       # Trained Scikit-Learn/XGBoost Pipeline
├── public/
│   └── data/                         # Decoupled Static JSON Exports
│       ├── districts.json            # District boundary centroids
│       ├── fao_national.json         # UN FAO validation statistics
│       ├── bbs_raw.json              # Digitized raw BBS yield census
│       ├── nasa_raw.json             # NASA monthly telemetry records
│       ├── yield_data.json           # Integrated prediction matrix
│       └── summary.json              # Model parameters & CV scores
├── src/                              # Python data pipeline
│   ├── fetch/
│   │   ├── fetch_bbs.py              # Download historical crop records
│   │   ├── fetch_fao.py              # Pull national FAOSTAT references
│   │   └── fetch_nasa.py             # Query NASA POWER climate telemetry
│   ├── model/
│   │   ├── train_model.py            # Train XGBoost regressor with rolling CV
│   │   └── export_frontend_data.py   # Compile predictions into static JSON
│   ├── process/
│   │   ├── merge_process.py          # Standardize spellings & pivot weather
│   │   └── feature_engineer.py       # Compute GDD, DTR, and soil wetness averages
│   ├── tests/
│   │   └── validate_metrics.py       # Automated integration test suite
│   └── utils/
│       └── coordinates.py            # District centroid mapper
├── package.json                      # Next.js dependencies
└── requirements.txt                  # Python dependencies
```

---

## 🛠️ Installation & Local Setup

### 1. Python Pipeline (Data Extraction & ML Training)
First, ensure you have Python 3.9+ installed. Set up your virtual environment and install packages:

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

To run the pipeline and train the model from scratch:
```bash
# 1. Fetch raw datasets (BBS, NASA POWER, FAOSTAT)
python3 src/fetch/fetch_bbs.py
python3 src/fetch/fetch_nasa.py
python3 src/fetch/fetch_fao.py

# 2. Pivot monthly telemetry and merge on district-season boundaries
python3 src/process/merge_process.py

# 3. Engineer seasonal agronomic indices (GDD, DTR, Soil Wetness)
python3 src/process/feature_engineer.py

# 4. Train the XGBoost Regressor with Chronological Cross-Validation
python3 src/model/train_model.py

# 5. Export precomputed predictions & raw files as static JSON arrays
python3 src/model/export_frontend_data.py

# 6. Run automated verification validations
python3 src/tests/validate_metrics.py
```

### 2. Frontend Development Server (Next.js)
Ensure you have Node.js 18+ installed.

```bash
# Install NPM dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the digital twin dashboard!

---

## 🔄 How to Push New Updates in the Future

Once you make changes to the local files (e.g. updating the data pipeline, editing Next.js components, or running a new training loop), run the following commands to commit and push them to GitHub. This will automatically trigger a GitHub Actions build and deploy:

```bash
# 1. Stage all changes
git add .

# 2. Commit the changes with a message
git commit -m "feat: updated data pipeline for 2025 crops"

# 3. Push to GitHub
git push
```

GitHub Actions listens for pushes to the `main` branch and will rebuild and deploy the website to GitHub Pages automatically in under a minute!

---

## 📚 Data Source Citations

1.  **BBS**: Agricultural crop yield census metrics digitized from the annual publications of the *Bangladesh Bureau of Statistics (Ministry of Planning)*.
2.  **NASA POWER**: Spatial meteorological temperature, precipitation, humidity, solar radiation, surface soil wetness (`GWETTOP`), and root-zone soil wetness (`GWETROOT`) courtesy of NASA's *Prediction of Worldwide Energy Resources* project.
3.  **FAOSTAT**: National validation crop metrics and chemical input indicators compiled by the *Food and Agriculture Organization (FAO) of the United Nations*.
4.  **BRRI (Bangladesh Rice Research Institute)**: Local variety-specific rice yields, genetic yield gaps, and stress-tolerance mapping records.
5.  **DAE (Department of Agricultural Extension)**: Weekly crop sowing schedules, regional target guides, and localized disaster crop-loss assessments.
6.  **SRDI (Soil Resource Development Institute)**: Subnational soil chemistry indicators (NPK, pH profiles) and coastal soil salinity index mapping.
7.  **BARC (Bangladesh Agricultural Research Council)**: Agro-Ecological Zones (AEZ) topographies and soil suitability indexes.
8.  **IRRI Dataverse & HDX**: Socioeconomic farm-level household panels and subnational NDVI vegetation index datasets.
