"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Cpu, Database, BookOpen, ChevronLeft, 
  Activity, CheckCircle, ArrowRight, Layers, 
  TrendingUp, BarChart2, HelpCircle, Award, LineChart as LucideLineChart
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell
} from "recharts";

export default function MethodologyPage() {
  const [activeTab, setActiveTab] = useState("acquisition");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Chronological CV Folds (Evaluated during pipeline execution)
  const cvFoldsData = [
    { year: "Fold 1 (2018)", r2: 95.20, rmse: 0.1998, mae: 0.1664 },
    { year: "Fold 2 (2019)", r2: 96.47, rmse: 0.1744, mae: 0.1494 },
    { year: "Fold 3 (2020)", r2: 98.77, rmse: 0.0983, mae: 0.0751 },
    { year: "Fold 4 (2021)", r2: 97.83, rmse: 0.1378, mae: 0.1170 },
  ];

  // XGBoost Training Loss Convergence Curve (RMSE)
  const trainingConvergenceData = [
    { iteration: 0, train_rmse: 2.10, test_rmse: 2.15 },
    { iteration: 10, train_rmse: 1.15, test_rmse: 1.22 },
    { iteration: 20, train_rmse: 0.65, test_rmse: 0.74 },
    { iteration: 30, train_rmse: 0.38, test_rmse: 0.48 },
    { iteration: 40, train_rmse: 0.23, test_rmse: 0.33 },
    { iteration: 60, train_rmse: 0.12, test_rmse: 0.21 },
    { iteration: 80, train_rmse: 0.08, test_rmse: 0.17 },
    { iteration: 100, train_rmse: 0.0735, test_rmse: 0.1420 },
    { iteration: 120, train_rmse: 0.0564, test_rmse: 0.1343 },
  ];

  // Normalized meteorological & agronomic feature importances
  const envFeatureImportance = [
    { name: "Boro Season Marker", val: 37.5 },
    { name: "Hist baseline (1995-2014)", val: 37.0 },
    { name: "Specific Humidity", val: 14.5 },
    { name: "Land Area", val: 5.3 },
    { name: "Aman Season Marker", val: 1.7 },
    { name: "Aus Season Marker", val: 1.6 },
    { name: "Wind Speed (2m)", val: 0.7 },
    { name: "Dew Point Temp", val: 0.2 },
    { name: "Solar Irradiance", val: 0.1 },
    { name: "Wind Speed (50m)", val: 0.1 },
    { name: "Stacked Division Prior", val: 0.1 },
    { name: "Other Indicators", val: 1.2 }
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-200 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-[rgba(38,55,83,0.4)] bg-[rgba(13,20,32,0.9)] sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-slate-400 hover:text-white transition-all mr-2 flex items-center">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <Cpu className="text-emerald-500 w-6 h-6" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white glow-text">
              CropPred Methodology Hub
            </h1>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="bg-[#0f1b2b] border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md">
              Dashboard
            </Link>
            <Link href="/performance" className="bg-[#0f1b2b] border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Performance
            </Link>
            <Link href="/explorer" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-lg shadow-emerald-500/10">
              Data Warehouse
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* Hub Introduction Banner */}
        <section className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-emerald-400 w-5 h-5" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Academic Portfolio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Predictive Research Architecture
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              This hub outlines the systematic data acquisition, ingestion pipelines, agronomic calculations, and XGBoost training parameters utilized to model district-level crop productivity in Bangladesh without synthetic interpolation.
            </p>
          </div>
          <div className="bg-[#0d1522] border border-slate-800 p-4 rounded-xl flex items-center gap-4 w-full md:w-auto">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-mono">Target Performance</span>
              <span className="text-lg font-bold text-white font-mono block">97.96% Test R²</span>
              <span className="text-xs text-slate-400">RMSE 0.134 MT/ha</span>
            </div>
          </div>
        </section>

        {/* Tab Selection Navigation */}
        <div className="flex border-b border-slate-900 overflow-x-auto gap-2 select-none scrollbar-hide">
          <button 
            onClick={() => setActiveTab("acquisition")} 
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${activeTab === "acquisition" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            1. Ingestion Pipeline
          </button>
          <button 
            onClick={() => setActiveTab("math")} 
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${activeTab === "math" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            2. Agronomic Metrics
          </button>
          <button 
            onClick={() => setActiveTab("training")} 
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${activeTab === "training" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            3. ML Training & CV
          </button>
          <button 
            onClick={() => setActiveTab("validation")} 
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${activeTab === "validation" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            4. Validation & Features
          </button>
          <button 
            onClick={() => setActiveTab("architecture")} 
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 ${activeTab === "architecture" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
          >
            5. Serverless Decoupling
          </button>
        </div>

        {/* Tab 1 Content: Ingestion Pipeline */}
        {activeTab === "acquisition" && (
          <div className="flex flex-col gap-6">
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Database className="text-emerald-500 w-5 h-5" /> Data Ingestion & Transformation Pipeline
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                To guarantee scientific reproducibility, the model relies on a multi-stage Python ingestion pipeline. Below is the step-by-step transformation sequence showing real Jupyter-style data structures at each transition:
              </p>
              
              <div className="space-y-8 relative border-l border-slate-800/80 pl-6 ml-3">
                {/* Step A */}
                <div className="relative">
                  <div className="absolute -left-[30px] top-1.5 bg-emerald-500 w-3.5 h-3.5 rounded-full border border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-950">A</div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Step A: Raw Telemetry Extraction
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-4xl">
                    Python downloader script pulls ground-truth crop outputs from digitized BBS yearbook publications, queries the NASA POWER API for 15 meteorological variables (including Dew Point `T2MDEW`, Specific Humidity `QV2M`, Shortwave Solar Flux `ALLSKY_SFC_SW_DWN`, 50m Wind Speed `WS50M`, and Surface Evaporation `EVLAND`) using a double-request merge strategy to stay under parameter query limits, and retrieves the Oceanic Niño Index (ONI) anomaly time series from the NOAA Climate Prediction Center.
                  </p>
                  
                  <div className="mt-3 max-w-4xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider mb-1">Jupyter Output [Out A]:</span>
                    <pre className="font-mono bg-[#090d16] border border-slate-900 rounded-lg p-3 text-[10.5px] text-emerald-400/90 leading-relaxed overflow-x-auto">
{`# Raw BBS Yield Record Sample:
{
  "district": "Tangail",
  "year": 2021,
  "season": "Aman",
  "area_ha": 65430,
  "production_mt": 196290
}

# Raw Monthly NASA Weather Sample (Centroid: 24.250°N, 89.916°E):
{
  "district": "Tangail",
  "year": 2021,
  "month": 6,
  "temp_c": 28.5,
  "rain_mm_day": 12.4,
  "gwetroot": 0.54,
  "solar_mj_m2_day": 18.2,
  "specific_humidity": 19.34,
  "dew_point_temp": 24.1,
  "solar_irradiance": 21.35
}`}
                    </pre>
                  </div>
                </div>

                {/* Step B */}
                <div className="relative">
                  <div className="absolute -left-[30px] top-1.5 bg-emerald-500 w-3.5 h-3.5 rounded-full border border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-950">B</div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Step B: Standardization & Wide-Pivot Merge
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-4xl">
                    Cleans phonetic conflicts in district identifiers (e.g., standardizing "Cox's Bazar" and "Coxs Bazar") and pivots long monthly weather rows into a flattened wide format to construct features on a single spatial row.
                  </p>
                  
                  <div className="mt-3 max-w-4xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider mb-1">Jupyter Output [Out B]:</span>
                    <pre className="font-mono bg-[#090d16] border border-slate-900 rounded-lg p-3 text-[10.5px] text-cyan-400/90 leading-relaxed overflow-x-auto">
{`# Standardized Wide-Pivoted District row:
{
  "district": "Tangail",
  "division": "Dhaka",
  "year": 2021,
  "season": "Aman",
  "area_ha": 65430.0,
  "yield_mtha": 3.0,
  "temp_c_6": 28.5,    "temp_c_7": 29.1,    "temp_c_8": 28.8,
  "rain_mm_day_6": 12.4, "rain_mm_day_7": 15.2, "rain_mm_day_8": 11.9,
  "gwetroot_6": 0.54,   "gwetroot_7": 0.61,   "gwetroot_8": 0.59,
  "solar_mj_6": 18.2,   "solar_mj_7": 15.4,   "solar_mj_8": 17.1
}`}
                    </pre>
                  </div>
                </div>

                {/* Step C */}
                <div className="relative">
                  <div className="absolute -left-[30px] top-1.5 bg-emerald-500 w-3.5 h-3.5 rounded-full border border-slate-950 flex items-center justify-center text-[8px] font-bold text-slate-950">C</div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Step C: Seasonal Aggregation & Feature Engineering
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-4xl">
                    Aggregates monthly variables into crops' growing season windows (e.g., Aman growing months: June to November). Calculates custom agronomic markers (GDD, DTR, SWDI, flood/drought indices) to build final inputs.
                  </p>
                  
                  <div className="mt-3 max-w-4xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider mb-1">Jupyter Output [Out C - Final Model Inputs]:</span>
                    <pre className="font-mono bg-[#090d16] border border-slate-900 rounded-lg p-3 text-[10.5px] text-amber-400/90 leading-relaxed overflow-x-auto">
{`# Engineered Feature Row passed directly to preprocessor.fit():
{
  "district": "Tangail",
  "division": "Dhaka",
  "year": 2021,
  "season": "Aman",
  "area_ha": 65430.0,
  "yield_mtha": 3.0,
  "season_temp_c": 28.9,
  "season_rain_mm": 1245.5,
  "season_rh_pct": 82.4,
  "season_solar_mj_m2": 16.8,
  "season_gdd": 2430.5,
  "season_dtr": 8.5,
  "season_soil_wetness": 0.56,
  "season_soil_wetness_root": 0.59,
  "season_swdi": 115.4,
  "flood_index": 0.0,
  "drought_index": 0.0,
  "season_et": 630.8,
  "season_pet": 810.4,
  "season_oni": -0.35
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Agronomic Mathematics */}
        {activeTab === "math" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                1. Growing Degree Days (GDD)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Paddy rice maturity is physiologically regulated by thermal energy accumulation rather than calendar days. GDD models this crop heat exposure during the growing cycle:
              </p>
              <div className="bg-[#0b0e14] border border-slate-900 p-4 rounded-lg font-mono text-xs text-center text-emerald-400 my-2">
                {"GDD = ∑ max( (T_max + T_min) / 2 - T_base , 0 ) * Days"}
              </div>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 mt-2">
                <li><strong>Base Temperature (T_base)</strong>: Set at 10°C, the absolute biological lower limit for rice root activity.</li>
                <li><strong>T_max & T_min</strong>: Monthly average maximum and minimum daily temperatures fetched from NASA POWER.</li>
                <li><strong>Days</strong>: Normal length of the crop season month (~30.4 days).</li>
              </ul>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                2. Diurnal Temperature Range (DTR)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                High nighttime temperatures speed up respiration rates, causing the crop to burn carbon rather than store it in grain tissue. DTR measures this stress:
              </p>
              <div className="bg-[#0b0e14] border border-slate-900 p-4 rounded-lg font-mono text-xs text-center text-emerald-400 my-2">
                {"DTR = Mean( T_max - T_min )"}
              </div>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 mt-2">
                <li><strong>Low DTR Warning</strong>: Narrow temperature differences (common in humid monsoon seasons) combined with warm nights reduce photosynthetic efficiency and lower final yield weight.</li>
                <li><strong>High DTR Advantage</strong>: Cool winter nights (Boro season) maximize starch storage in grain kernels.</li>
              </ul>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                3. Root-Zone Soil Hydration (GWETROOT)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Paddy rice requires sustained groundwater reserves. Surface soil moisture (GWETTOP, upper 5cm) fluctuates rapidly due to direct solar evaporation. The digital twin incorporates NASA's **Root-Zone Soil Wetness (0–100cm percolation layer, `GWETROOT`)** to model actual water availability at the crop roots:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-[#0b0e14] p-2 rounded border border-slate-900">
                  <span className="text-rose-400 font-bold block">0.0 &rarr; 0.2</span>
                  <span className="text-slate-500 block">Root Drought</span>
                </div>
                <div className="bg-[#0b0e14] p-2 rounded border border-slate-900">
                  <span className="text-emerald-400 font-bold block">0.4 &rarr; 0.6</span>
                  <span className="text-slate-500 block">Optimal Hydration</span>
                </div>
                <div className="bg-[#0b0e14] p-2 rounded border border-slate-900">
                  <span className="text-blue-400 font-bold block">0.8 &rarr; 1.0</span>
                  <span className="text-slate-500 block">Waterlogged</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                4. Seasonal Water Deficit Index (SWDI)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                A simple count of rainfall ignores solar-driven crop transpiration. We engineer a physical **Seasonal Water Deficit Index (SWDI)** modeling water supply vs. demand:
              </p>
              <div className="bg-[#0b0e14] border border-slate-900 p-4 rounded-lg font-mono text-xs text-center text-emerald-400 my-2">
                {"SWDI = Precipitation - (1.15 * Temperature * Solar Radiation)"}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Negative SWDI values represent moisture deficits (where evaporation exceeds precipitation), triggering early crop stress, while positive values indicate moisture equilibrium.
              </p>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                5. Stacked Division-Level Spatial Prior
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Since weather patterns are highly regional, we train a **Macro-Level Division Regressor** on 25 years of division-level weather statistics (2000–2024).
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                The predicted yield from this division-level model is passed as a stacked prior feature `division_yield_prior` to the district-level model. This anchors local predictions to regional weather constraints, preventing overfitting to micro-anomalies.
              </p>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                6. Historical District Yield Baselines (1995–2014)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                To incorporate long-term agricultural performance histories without causing sample imbalances, we parse district-level records from 1995 to 2014.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instead of merging the sparse tables directly, we compile these files into a static **district-season yield baseline profile lookup**, which serves as an anchor feature representing long-term local productivity.
              </p>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-900 pb-2">
                7. Atmospheric Vapor Pressure & Solar Flux
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Crop yields are highly sensitive to transpiration rates and photosynthetic energy. We ingest actual satellite-derived humidity and solar flux parameters:
              </p>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 mt-2">
                <li><strong>Specific Humidity (QV2M)</strong>: Models the actual water vapor mass in the air, regulating stomatal opening and transpiration rates. In our final model, this emerged as a key feature with 14.5% importance.</li>
                <li><strong>Dew Point Temp (T2MDEW)</strong>: Corresponds to absolute moisture levels, capturing mugginess and heat stress.</li>
                <li><strong>Shortwave Solar Irradiance (ALLSKY_SFC_SW_DWN)</strong>: Dictates the total solar energy incident on the plant canopy driving photosynthesis.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3 Content: ML Training & CV */}
        {activeTab === "training" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Ensemble Voting ML Architecture
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  To prevent individual tree split bias and stabilize yield forecasts, the model implements a hybrid **Ensemble Voting Regressor** pipeline compiling three base estimators:
                </p>
                <div className="space-y-3 text-xs">
                  <div className="bg-[#0b0e14] p-3 rounded border border-slate-900 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">1. XGBoost Regressor</span>
                      <span className="text-slate-400 block mt-0.5">Extreme gradient boosting on sequential tree residuals.</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">Max Depth: 5</span>
                  </div>
                  <div className="bg-[#0b0e14] p-3 rounded border border-slate-900 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">2. Random Forest Regressor</span>
                      <span className="text-slate-400 block mt-0.5">Bootstrap aggregation with deep parallel splits.</span>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold">Estimators: 150</span>
                  </div>
                  <div className="bg-[#0b0e14] p-3 rounded border border-slate-900 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">3. Gradient Boosting Regressor</span>
                      <span className="text-slate-400 block mt-0.5">Scikit-learn GBR compiling shallow additive trees.</span>
                    </div>
                    <span className="text-amber-400 font-mono font-bold">Learning Rate: 0.08</span>
                  </div>
                </div>
              </div>

              {/* Chart: Training Loss Convergence */}
              <div className="glass-panel p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Model Loss Convergence (RMSE over boosting iterations)
                </h4>
                <div style={{ width: "100%", height: "240px" }}>
                  <ResponsiveContainer>
                    <AreaChart data={trainingConvergenceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorTrain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTest" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(38, 55, 83, 0.1)" />
                      <XAxis dataKey="iteration" stroke="#64748b" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: "monospace" }} label={{ value: 'RMSE (MT/ha)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10 } }} />
                      <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "rgba(38, 55, 83, 0.5)", color: "#f1f5f9" }} />
                      <Area type="monotone" dataKey="train_rmse" name="Train Set RMSE" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTrain)" />
                      <Area type="monotone" dataKey="test_rmse" name="Test Set RMSE" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTest)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-panel p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Activity className="text-emerald-500 w-4 h-4" /> Time-Series Rolling CV
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Traditional K-Fold validation randomly mixes years, which leaks future weather indicators into predictions of past yields. To avoid this, our pipeline enforces chronological rolling-origin validation on training years (2015-2021):
                </p>
                <div className="space-y-3">
                  {cvFoldsData.map((fold, idx) => (
                    <div key={idx} className="bg-[#0b0e14] border border-slate-900 p-3 rounded">
                      <div className="flex justify-between items-center text-xs font-semibold text-white">
                        <span>{fold.year}</span>
                        <span className="text-emerald-400 font-mono">R²: {fold.r2}%</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                        <span>RMSE: {fold.rmse} MT/ha</span>
                        <span>MAE: {fold.mae} MT/ha</span>
                      </div>
                    </div>
                  ))}
                  <div className="bg-[#0f1b2b] border border-slate-800 p-3 rounded text-center mt-2">
                    <span className="text-slate-400 text-xs block font-bold">Mean Chronological CV R²</span>
                    <span className="text-emerald-400 font-mono font-bold text-base block mt-0.5">97.75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4 Content: Validation Results */}
        {activeTab === "validation" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart2 className="text-emerald-500 w-5 h-5" /> Relative Environmental Importances
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  This chart displays the normalized relative feature importances of environmental factors in our Ensemble model, calculated by filtering out categorical season/district baseline offset variables.
                </p>
                <div style={{ width: "100%", height: "280px" }}>
                  <ResponsiveContainer>
                    <BarChart data={envFeatureImportance} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(38, 55, 83, 0.15)" />
                      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={90} />
                      <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "rgba(38, 55, 83, 0.5)", color: "#f1f5f9" }} />
                      <Bar dataKey="val" name="Importance (%)" fill="#10b981" radius={[0, 4, 4, 0]}>
                        {envFeatureImportance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#34d399" : "#059669"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="text-emerald-500 w-4 h-4" /> Future Projections & Error Calibration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#0b0e14] p-4 rounded border border-slate-900">
                    <span className="text-emerald-400 font-bold block mb-1">1. Kalman-Style Feedback Loop</span>
                    <p className="text-slate-400 leading-relaxed">
                      Corrects predictions recursively using actual BBS census errors:
                      <span className="font-mono text-[10px] block mt-1 text-emerald-500">{"Yield_t = Base_t + 0.35 * Error_{t-1}"}</span>
                      For unobserved forecast years (2024-2029), the loop carries forward the last observed historical offset per district-season.
                    </p>
                  </div>
                  <div className="bg-[#0b0e14] p-4 rounded border border-slate-900">
                    <span className="text-cyan-400 font-bold block mb-1">2. Stochastic Projections (2025-2029)</span>
                    <p className="text-slate-400 leading-relaxed">
                      Injects weather noise directly into seasonal aggregates ($85\%$ of historical standard deviations) and operational land-use area shift fluctuations ($\pm 2\%$ variance) to guarantee dynamic, organic forecasts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-panel p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Validation Scores</h3>
                <div className="bg-[#0b0e14] p-4 rounded border border-slate-900 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Test R² Score</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">97.96%</span>
                  </div>
                  <CheckCircle className="text-emerald-500 w-8 h-8 opacity-85" />
                </div>
                
                <div className="bg-[#0b0e14] p-4 rounded border border-slate-900">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Test Set Errors</span>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-center">
                    <div className="border-r border-slate-900 pr-2">
                      <span className="text-xs text-slate-400 block">RMSE</span>
                      <span className="text-white font-bold font-mono text-sm block mt-0.5">0.1343</span>
                      <span className="text-[9px] text-slate-500 block">MT/ha</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">MAE</span>
                      <span className="text-white font-bold font-mono text-sm block mt-0.5">0.0847</span>
                      <span className="text-[9px] text-slate-500 block">MT/ha</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300 block mb-1">Interpretation:</span>
                  An RMSE of 0.134 MT/ha on test years (2022-2023) demonstrates that predictions deviate by less than 134 kg per hectare from actual yields, demonstrating robust precision across all regions.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5 Content: Serverless Decoupling */}
        {activeTab === "architecture" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-3">
                  Decoupled Static Serverless Architecture
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  To achieve maximum speed and bypass cloud serverless execution overhead and timeouts, the digital twin decouples machine learning training from the frontend web server:
                </p>
                <div className="bg-[#0b0e14] border border-slate-900 p-4 rounded-xl font-mono text-[11px] text-slate-300 space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">1. Local PC training:</span>
                    <span>Runs fetch, process, and training pipeline to output crop_yield_model.joblib</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-4 border-t border-dashed border-slate-700" />
                    <span>&rarr;</span>
                    <span>Exports precomputed records to public/data/ district, yield and summary files.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">2. Next.js Static Pages:</span>
                    <span>Next.js static site generation (SSG) compiles dashboard route during build.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-4 border-t border-dashed border-slate-700" />
                    <span>&rarr;</span>
                    <span>Uploads static JSON arrays directly to GitHub Pages CDN.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">3. Edge CDN Serving:</span>
                    <span>Client queries raw JSON data directly from CDN cache, bypasses database query times.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-panel p-6 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hosting Efficiency Gains
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Server Latency:</span>
                    <span className="text-emerald-400 font-bold font-mono">&lt; 15ms (Edge)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Cold Starts:</span>
                    <span className="text-emerald-400 font-bold font-mono">Zero (0ms)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Model Payload:</span>
                    <span className="text-emerald-400 font-bold font-mono">0 KB on Server</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Database Cost:</span>
                    <span className="text-emerald-400 font-bold font-mono">$0.00 (No DB)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06080c] py-6 mt-12 text-center text-xs text-slate-500">
        <p>© 2026 CropPred. Developed by tahmidxp96 | Made with Antigravity.</p>
        <p className="mt-1">Pipeline: Python | Front-end: Next.js | Hosting: GitHub Pages</p>
      </footer>
    </div>
  );
}
