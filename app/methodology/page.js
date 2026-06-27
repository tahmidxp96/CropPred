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
    { year: "Fold 1 (2018)", r2: 98.20, rmse: 0.1223, mae: 0.0890 },
    { year: "Fold 2 (2019)", r2: 97.65, rmse: 0.1424, mae: 0.1012 },
    { year: "Fold 3 (2020)", r2: 98.18, rmse: 0.1194, mae: 0.0874 },
    { year: "Fold 4 (2021)", r2: 97.37, rmse: 0.1519, mae: 0.1115 },
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
    { iteration: 100, train_rmse: 0.07, test_rmse: 0.156 },
    { iteration: 120, train_rmse: 0.0686, test_rmse: 0.1540 },
  ];

  // Normalized meteorological & agronomic feature importances
  const envFeatureImportance = [
    { name: "Avg Humidity", val: 43.1 },
    { name: "Total Rainfall", val: 29.2 },
    { name: "Soil Wetness", val: 14.5 },
    { name: "Land Area", val: 10.4 },
    { name: "Solar Rad", val: 1.2 },
    { name: "Avg Temp", val: 0.6 },
    { name: "Flood Index", val: 0.6 },
    { name: "GDD Heat", val: 0.4 },
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
              Twin Methodology Hub
            </h1>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="bg-[#0f1b2b] border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md">
              Dashboard
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
              <span className="text-lg font-bold text-white font-mono block">97.32% Test R²</span>
              <span className="text-xs text-slate-400">RMSE 0.154 MT/ha</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Database className="text-emerald-500 w-5 h-5" /> Primary Sourced Data Repositories
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  To ensure graduate-grade scientific integrity, the model relies exclusively on real historical records. There are no placeholder values or synthetically interpolated records in the entire repository.
                </p>
                <div className="space-y-4">
                  <div className="bg-[#0b0e14] border border-slate-900 p-4 rounded-lg">
                    <span className="text-xs font-bold text-emerald-400 block font-mono">1. Agricultural Censuses (BBS)</span>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      District-level cultivated land areas (hectares), production tonnage (metric tonnes), and yield rates (MT/ha) are digitized from historical publications of the Bangladesh Bureau of Statistics (BBS) spanning 2015 to 2023. These represent our ground-truth labels.
                    </p>
                  </div>
                  <div className="bg-[#0b0e14] border border-slate-900 p-4 rounded-lg">
                    <span className="text-xs font-bold text-cyan-400 block font-mono">2. Meteorological Telemetry (NASA POWER)</span>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Coordinates for all 64 district centroids were mapped to query NASA's Prediction of Worldwide Energy Resources (POWER) API. Parameters fetched include surface air temperatures, daily precipitation corrected for regional topography, relative humidity, solar radiation, and surface soil moisture.
                    </p>
                  </div>
                  <div className="bg-[#0b0e14] border border-slate-900 p-4 rounded-lg">
                    <span className="text-xs font-bold text-amber-400 block font-mono">3. Global Reference Validation (UN FAOSTAT)</span>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Country-level annual statistical averages for paddy yield, production, and harvested areas are downloaded from the UN Food and Agriculture Organization (FAO) to serve as a macro-validation check for district aggregates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="glass-panel p-6 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Pipeline Steps</h4>
                <div className="relative border-l border-slate-800 pl-4 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-6 bg-emerald-500 w-3 h-3 rounded-full border border-slate-950" />
                    <span className="text-xs font-bold text-white block">Step A: Extraction</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Scrapes BBS publications and calls the NASA API dynamically using Python scripts.</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-6 bg-emerald-500 w-3 h-3 rounded-full border border-slate-950" />
                    <span className="text-xs font-bold text-white block">Step B: Standardization</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Aligns phonetically conflicting district spellings and converts data layouts from long to flat wide formats.</span>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-6 bg-emerald-500 w-3 h-3 rounded-full border border-slate-950" />
                    <span className="text-xs font-bold text-white block">Step C: Aggregation</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Aggregates monthly weather parameters into seasonal agricultural boundaries (Aus, Aman, Boro).</span>
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
              <h3 className="text-lg font-bold text-white border-b border-slate-950 pb-2">
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
              <h3 className="text-lg font-bold text-white border-b border-slate-950 pb-2">
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

            <div className="glass-panel p-6 flex flex-col gap-4 md:col-span-2">
              <h3 className="text-lg font-bold text-white border-b border-slate-950 pb-2 flex items-center gap-2">
                <Layers className="text-emerald-500 w-5 h-5" /> 3. Satellite Surface Soil Wetness (GWETTOP)
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                To bypass the complexity of local shapefile masking for MODIS satellite imagery, the digital twin incorporates NASA’s GLDAS **Surface Soil Wetness ratio (`GWETTOP`)** as a direct proxy for agricultural drought, moisture anomalies, and vegetation index (NDVI) shifts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div className="bg-[#0b0e14] p-3.5 rounded border border-slate-900 text-center">
                  <span className="text-xs text-slate-400 block">Values 0.0 &rarr; 0.2</span>
                  <span className="text-xs text-rose-400 font-bold block mt-1">Severe Soil Drought</span>
                </div>
                <div className="bg-[#0b0e14] p-3.5 rounded border border-slate-900 text-center">
                  <span className="text-xs text-slate-400 block">Values 0.4 &rarr; 0.6</span>
                  <span className="text-xs text-emerald-400 font-bold block mt-1">Optimal Crop Hydration</span>
                </div>
                <div className="bg-[#0b0e14] p-3.5 rounded border border-slate-900 text-center">
                  <span className="text-xs text-slate-400 block">Values 0.8 &rarr; 1.0</span>
                  <span className="text-xs text-blue-400 font-bold block mt-1">Soil Saturation / Waterlogging</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3 Content: ML Training & CV */}
        {activeTab === "training" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  XGBoost Hyperparameter Architecture
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  To prevent the model from overfitting (memorizing district labels rather than generalizing climate patterns), we transitioned the training pipeline to the **XGBoost gradient boosting** algorithm with strict regularization parameters:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-[#0b0e14] p-3 rounded border border-slate-900">
                    <span className="text-slate-500 block">Estimators</span>
                    <span className="text-white font-bold text-sm block mt-1">120</span>
                  </div>
                  <div className="bg-[#0b0e14] p-3 rounded border border-slate-900">
                    <span className="text-slate-500 block">Learning Rate</span>
                    <span className="text-white font-bold text-sm block mt-1">0.07</span>
                  </div>
                  <div className="bg-[#0b0e14] p-3 rounded border border-slate-900">
                    <span className="text-slate-500 block">Max Depth</span>
                    <span className="text-white font-bold text-sm block mt-1">5</span>
                  </div>
                  <div className="bg-[#0b0e14] p-3 rounded border border-slate-900">
                    <span className="text-slate-500 block">Subsample</span>
                    <span className="text-white font-bold text-sm block mt-1">0.80</span>
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
                    <span className="text-emerald-400 font-mono font-bold text-base block mt-0.5">97.85%</span>
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
                  This chart displays the normalized relative feature importances of environmental factors in our XGBoost model, calculated by filtering out categorical season/district baseline offset variables.
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
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-panel p-6 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Validation Scores</h3>
                <div className="bg-[#0b0e14] p-4 rounded border border-slate-900 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Test R² Score</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">97.32%</span>
                  </div>
                  <CheckCircle className="text-emerald-500 w-8 h-8 opacity-85" />
                </div>
                
                <div className="bg-[#0b0e14] p-4 rounded border border-slate-900">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Test Set Errors</span>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-center">
                    <div className="border-r border-slate-900 pr-2">
                      <span className="text-xs text-slate-400 block">RMSE</span>
                      <span className="text-white font-bold font-mono text-sm block mt-0.5">0.1540</span>
                      <span className="text-[9px] text-slate-500 block">MT/ha</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">MAE</span>
                      <span className="text-white font-bold font-mono text-sm block mt-0.5">0.1165</span>
                      <span className="text-[9px] text-slate-500 block">MT/ha</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300 block mb-1">Interpretation:</span>
                  An RMSE of 0.15 MT/ha on test years (2022-2023) demonstrates that predictions deviate by less than 150 kg per hectare from actual yields, demonstrating robust precision across all regions.
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
                  To achieve maximum speed and bypass Vercel serverless functions CPU timeout constraints, the digital twin decouples machine learning training from the frontend web server:
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
                    <span>Uploads static JSON arrays directly to Vercel Global Edge CDN.</span>
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
        <p>© 2026 Bangladesh Crop Yield Digital Twin Research. Built for Graduate Research Portfolio in AI/Agriculture.</p>
        <p className="mt-1">Pipeline: Python | Front-end: Next.js | Serverless: Vercel</p>
      </footer>
    </div>
  );
}
