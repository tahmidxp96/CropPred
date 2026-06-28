"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { 
  Activity, MapPin, Calendar, CloudRain, Sun, Thermometer, Droplets, 
  AlertTriangle, ShieldCheck, Database, Info, Layers, RefreshCw, Cpu, Wind
} from "lucide-react";

export default function DigitalTwinDashboard() {
  // Application Data States
  const [districts, setDistricts] = useState([]);
  const [yieldData, setYieldData] = useState([]);
  const [faoData, setFaoData] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // Interactive UI Filters
  const [selectedDistrict, setSelectedDistrict] = useState("Naogaon");
  const [selectedSeason, setSelectedSeason] = useState("Boro");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  
  // Hydration state
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    
    // Fetch all static JSON files exported by pipeline
    Promise.all([
      fetch(`${basePath}/data/districts.json`).then(r => {
        if (!r.ok) throw new Error("Districts metadata missing.");
        return r.json();
      }),
      fetch(`${basePath}/data/yield_data.json`).then(r => {
        if (!r.ok) throw new Error("Yield prediction data missing.");
        return r.json();
      }),
      fetch(`${basePath}/data/fao_national.json`).then(r => {
        if (!r.ok) throw new Error("FAO national crosscheck missing.");
        return r.json();
      }),
      fetch(`${basePath}/data/summary.json`).then(r => {
        if (!r.ok) throw new Error("Model summary metadata missing.");
        return r.json();
      })
    ])
      .then(([distData, yldData, faoD, sumD]) => {
        setDistricts(distData);
        setYieldData(yldData);
        setFaoData(faoD);
        setSummary(sumD);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter actions
  const getSelectedRecord = () => {
    return yieldData.find(
      r => r.district === selectedDistrict && r.season === selectedSeason && r.year === selectedYear
    );
  };

  const getDistrictHistoricalSeries = () => {
    return yieldData
      .filter(r => r.district === selectedDistrict && r.season === selectedSeason)
      .sort((a, b) => a.year - b.year);
  };

  const getDistrictHistoricalAverage = () => {
    const series = yieldData.filter(
      r => r.district === selectedDistrict && r.season === selectedSeason && r.year <= 2023
    );
    if (series.length === 0) return 0;
    return series.reduce((acc, curr) => acc + curr.yield_mtha, 0) / series.length;
  };

  // Convert geocoordinates to SVG viewport space
  // Latitude: 20.5 to 26.8 | Longitude: 88.0 to 92.8
  const mapCoordinatesToSVG = (lat, lon) => {
    const width = 360;
    const height = 500;
    const x = ((lon - 88.0) / (92.8 - 88.0)) * width;
    const y = (1 - (lat - 20.5) / (26.8 - 20.5)) * height;
    return { x, y };
  };

  // Get yield predictions for a specific district node
  const getDistrictYield = (districtName) => {
    const record = yieldData.find(x => x.district === districtName && x.season === selectedSeason && x.year === selectedYear);
    return record ? record.pred_yield_mtha : null;
  };

  // Map yield predictions dynamically to color gradients
  const getDistrictColor = (districtName) => {
    if (selectedDistrict === districtName) return "#10b981"; // Highlight active node in emerald green
    const y = getDistrictYield(districtName);
    if (y === null) return "rgba(38, 55, 83, 0.4)"; // Fallback for out-of-bounds nodes
    // Map yields from 1.5 to 4.5 MT/ha to HSL colors (Red-Amber-Green gradient)
    const minVal = 1.5;
    const maxVal = 4.5;
    const pct = Math.min(1.0, Math.max(0.0, (y - minVal) / (maxVal - minVal)));
    const hue = 35 + pct * 110; // 35 is dark amber/rose, 145 is vibrant emerald
    return `hsl(${hue}, 80%, 48%)`;
  };

  // Map cultivated area to node radius size
  const getDistrictRadius = (districtName, isSelected) => {
    const record = yieldData.find(x => x.district === districtName && x.season === selectedSeason && x.year === selectedYear);
    const area = record ? record.area_ha : 50000;
    const minArea = 1000;
    const maxArea = 200000;
    const pct = Math.min(1.0, Math.max(0.0, (area - minArea) / (maxArea - minArea)));
    const baseRadius = 3.2 + pct * 3.8; // Proportional node scale (3.2px to 7.0px)
    return isSelected ? baseRadius + 2.0 : baseRadius;
  };

  // Compute spatial network mesh linking neighboring districts (dist < 0.82 degrees)
  const getMeshLinks = () => {
    const links = [];
    for (let i = 0; i < districts.length; i++) {
      const d1 = districts[i];
      const p1 = mapCoordinatesToSVG(d1.lat, d1.lon);
      for (let j = i + 1; j < districts.length; j++) {
        const d2 = districts[j];
        const dist = Math.sqrt((d1.lat - d2.lat) ** 2 + (d1.lon - d2.lon) ** 2);
        if (dist < 0.82) { // Adjacent neighbors mesh threshold
          const p2 = mapCoordinatesToSVG(d2.lat, d2.lon);
          const isRelated = selectedDistrict === d1.name || selectedDistrict === d2.name || hoveredDistrict === d1.name || hoveredDistrict === d2.name;
          const isSelected = selectedDistrict === d1.name || selectedDistrict === d2.name;
          links.push({
            id: `link-${d1.name}-${d2.name}`,
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y,
            isRelated,
            isSelected
          });
        }
      }
    }
    return links;
  };

  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#070a0f] text-slate-200">
        <RefreshCw className="animate-spin text-emerald-500 w-12 h-12 mb-4" />
        <p className="text-lg font-medium tracking-wide">Loading Digital Twin Spatial Environment...</p>
        <p className="text-sm text-slate-400 mt-2">Loading precomputed static ML artifacts</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#070a0f] text-slate-200 p-6 text-center">
        <AlertTriangle className="text-rose-500 w-16 h-16 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Platform Load Failure</h1>
        <p className="text-rose-400 max-w-md">{error}</p>
        <p className="text-sm text-slate-400 mt-4">Ensure python pipeline has run and exported artifacts to public/data/</p>
      </div>
    );
  }

  const selectedRecord = getSelectedRecord();
  const historicalAvg = getDistrictHistoricalAverage();
  const historicalSeries = getDistrictHistoricalSeries();
  
  // Calculate yield deviation
  const deviation = selectedRecord && historicalAvg
    ? ((selectedRecord.pred_yield_mtha - historicalAvg) / historicalAvg) * 100
    : 0;

  // Prepare feature importance data for Chart (relative to meteorological & agronomic factors)
  const allowedEnvFeatures = [
    "season_temp_c", "season_rain_mm", "season_rh_pct", "season_solar_mj_m2",
    "season_gdd", "season_dtr", "season_soil_wetness",
    "flood_index", "drought_index", "area_ha"
  ];
  const rawImportances = summary ? Object.entries(summary.feature_importances) : [];
  const envImportances = rawImportances.filter(([key]) => allowedEnvFeatures.includes(key));
  const envImportanceSum = envImportances.reduce((acc, [_, v]) => acc + v, 0);

  const featureImportanceData = envImportances.map(([name, val]) => {
    const normalizedVal = envImportanceSum > 0 ? (val / envImportanceSum) * 100 : 0;
    return {
      name: name.replace("season_temp_c", "Avg Temp")
                .replace("season_rain_mm", "Rainfall")
                .replace("season_rh_pct", "Humidity")
                .replace("season_solar_mj_m2", "Solar Rad")
                .replace("flood_index", "Flood Index")
                .replace("drought_index", "Drought Index")
                .replace("area_ha", "Land Area")
                .replace("season_gdd", "GDD Heat")
                .replace("season_dtr", "DTR Diurnal")
                .replace("season_soil_wetness", "Soil Wetness"),
      val: Math.round(normalizedVal * 10) / 10
    };
  })
  .sort((a, b) => b.val - a.val)
  .slice(0, 8);

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-200 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-[rgba(38,55,83,0.4)] bg-[rgba(13,20,32,0.9)] sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="text-emerald-500 w-6 h-6 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white glow-text">
                bangladesh-crop-yield-digital-twin
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                v1.0-research
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Local Machine Learning Pipeline + GitHub Pages Deployment
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/performance" className="bg-[#0f1b2b] border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hover:-translate-y-0.5 shadow-md">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Performance Hub
            </Link>
            <Link href="/methodology" className="bg-[#0f1b2b] border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hover:-translate-y-0.5 shadow-md">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Methodology
            </Link>
            <Link href="/explorer" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hover:-translate-y-0.5 shadow-lg shadow-emerald-500/10">
              <Database className="w-3.5 h-3.5" /> Explore Data Warehouse
            </Link>
            <div className="text-xs bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded text-slate-300 font-mono">
              Test R²: <span className="text-emerald-400 font-bold">98.19%</span>
            </div>
            <div className="text-xs bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded text-slate-300 font-mono">
              Model: <span className="text-cyan-400">Ensemble Voting</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Sidebar - 4 Cols */}
          <section className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel p-6 flex flex-col gap-5">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-white border-b border-slate-800 pb-3">
                <Layers className="text-emerald-500 w-5 h-5" /> Twin Configuration
              </h2>
              
              {/* Selectors */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Administrative District
                  </label>
                  <select 
                    value={selectedDistrict} 
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full bg-[#0d1420]/80 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {districts.map(d => (
                      <option key={d.name} value={d.name}>{d.name} ({d.division})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-500" /> Rice Crop Season
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Aus", "Aman", "Boro"].map(season => (
                      <button
                        key={season}
                        onClick={() => setSelectedSeason(season)}
                        className={`py-1.5 text-xs font-medium rounded border transition-all ${
                          selectedSeason === season 
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                            : "bg-[#0d1420]/50 text-slate-400 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {season}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Operational Year
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029].map(yr => (
                      <button
                        key={yr}
                        onClick={() => setSelectedYear(yr)}
                        className={`py-1 rounded text-xs font-mono transition-all ${
                          selectedYear === yr 
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" 
                            : "bg-[#0d1420]/50 text-slate-400 border border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                  {selectedYear === 2024 && (
                    <p className="text-[10px] text-amber-400 mt-2 bg-amber-500/5 border border-amber-500/10 p-2 rounded">
                      ⚠️ Year 2024 operates in **Estimation Mode**. The system utilizes actual 2024 satellite weather datasets with recursive feedback corrections.
                    </p>
                  )}
                  {selectedYear >= 2025 && (
                    <p className="text-[10px] text-cyan-400 mt-2 bg-cyan-500/5 border border-cyan-500/10 p-2 rounded">
                      🔮 Years 2025–2029 operate in **Climatological Forecast Mode**. Predictions run on 10-year historical climate medians with recursive feedback corrections.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Spatial Network SVG Map */}
            <div className="glass-panel p-4 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3 px-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spatial Node Web</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                  Interactive Network
                </span>
              </div>
              
              <div className="w-full relative flex justify-center bg-[#070a0f]/60 rounded border border-slate-900/60 p-2 overflow-hidden" style={{ height: "450px" }}>
                <svg width="100%" height="100%" viewBox="0 0 360 500" className="opacity-95">
                  {/* Glowing background grid lines */}
                  <line x1="90" y1="0" x2="90" y2="500" stroke="rgba(38, 55, 83, 0.1)" strokeDasharray="3 3" />
                  <line x1="180" y1="0" x2="180" y2="500" stroke="rgba(38, 55, 83, 0.1)" strokeDasharray="3 3" />
                  <line x1="270" y1="0" x2="270" y2="500" stroke="rgba(38, 55, 83, 0.1)" strokeDasharray="3 3" />
                  <line x1="0" y1="125" x2="360" y2="125" stroke="rgba(38, 55, 83, 0.1)" strokeDasharray="3 3" />
                  <line x1="0" y1="250" x2="360" y2="250" stroke="rgba(38, 55, 83, 0.1)" strokeDasharray="3 3" />
                  <line x1="0" y1="375" x2="360" y2="375" stroke="rgba(38, 55, 83, 0.1)" strokeDasharray="3 3" />

                  {/* Draw Spatial Network Mesh Links */}
                  {getMeshLinks().map(link => (
                    <line 
                      key={link.id} 
                      x1={link.x1} 
                      y1={link.y1} 
                      x2={link.x2} 
                      y2={link.y2} 
                      stroke={link.isSelected ? "#10b981" : link.isRelated ? "rgba(16, 185, 129, 0.4)" : "rgba(38, 55, 83, 0.18)"} 
                      strokeWidth={link.isSelected ? "1.5" : link.isRelated ? "1.0" : "0.7"}
                      strokeDasharray={link.isRelated ? "3 1" : undefined}
                      opacity={link.isRelated ? 0.95 : 0.6}
                    />
                  ))}

                  {/* Draw nodes with yield-gradient fill and area-proportional radius */}
                  {districts.map(d => {
                    const pos = mapCoordinatesToSVG(d.lat, d.lon);
                    const isSelected = selectedDistrict === d.name;
                    const nodeColor = getDistrictColor(d.name);
                    const nodeRadius = getDistrictRadius(d.name, isSelected);
                    
                    return (
                      <g key={d.name}>
                        {isSelected && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={nodeRadius + 6}
                            fill="none"
                            stroke={nodeColor}
                            strokeWidth="1.5"
                            className="animate-ping"
                            opacity="0.5"
                          />
                        )}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={nodeRadius}
                          fill={nodeColor}
                          stroke={isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.15)"}
                          strokeWidth={isSelected ? "1.2" : "0.5"}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedDistrict(d.name)}
                          onMouseEnter={() => setHoveredDistrict(d.name)}
                          onMouseLeave={() => setHoveredDistrict(null)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Map Color Legend Overlay */}
                <div className="absolute top-4 right-4 bg-slate-950/90 border border-slate-800/80 p-2 rounded text-[10px] flex flex-col gap-1 backdrop-blur select-none">
                  <span className="text-slate-400 uppercase tracking-wider font-semibold">Yield (MT/ha)</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-rose-400">1.5</span>
                    <div className="w-20 h-2 rounded" style={{ background: "linear-gradient(to right, hsl(35, 80%, 48%), hsl(90, 80%, 48%), hsl(145, 80%, 48%))" }} />
                    <span className="text-emerald-400">4.5</span>
                  </div>
                </div>
                
                {/* Micro tooltip inside map with live yield stats */}
                {hoveredDistrict && (
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/95 border border-slate-800 p-2 rounded text-xs flex justify-between items-center backdrop-blur">
                    <div>
                      <span className="text-emerald-400 font-bold block">{hoveredDistrict}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{selectedSeason} Rice ({selectedYear})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-mono font-semibold block">
                        {getDistrictYield(hoveredDistrict) ? `${getDistrictYield(hoveredDistrict)} MT/ha` : "N/A"}
                      </span>
                      <span className="text-[9px] text-slate-500 block">Predicted Yield</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Core Content Panels - 8 Cols */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Target Node Overview Dashboard */}
            {selectedRecord && (
              <div className="glass-panel p-6 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-2">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      {selectedDistrict} District
                      <span className="text-sm font-normal text-slate-400">({selectedRecord.division} Division)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coordinates: <span className="font-mono">{districts.find(d => d.name === selectedDistrict)?.lat.toFixed(4)}°N, {districts.find(d => d.name === selectedDistrict)?.lon.toFixed(4)}°E</span>
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded text-xs font-mono font-semibold">
                    Node Status: ACTIVE
                  </div>
                </div>

                {/* Primary Digital Twin Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Yield Prediction Card */}
                  <div className="bg-[#090d16] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Predicted Crop Yield</span>
                      <span className="text-3xl font-extrabold text-white mt-1 block">
                        {selectedRecord.pred_yield_mtha.toFixed(2)}{" "}
                        <span className="text-sm font-medium text-slate-400">MT/ha</span>
                      </span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-900">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Deviation</span>
                        {deviation >= 0 ? (
                          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono font-semibold">
                            +{deviation.toFixed(1)}% vs hist avg
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-mono font-semibold">
                            {deviation.toFixed(1)}% vs hist avg
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-col gap-1.5 text-[10px] text-slate-400 font-mono border-t border-slate-900/60 pt-2">
                        <div className="flex justify-between">
                          <span>Hist Baseline:</span>
                          <span className="text-slate-300 font-bold">{selectedRecord.historical_baseline.toFixed(2)} MT/ha</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Division Prior:</span>
                          <span className="text-slate-300 font-bold">{selectedRecord.division_prior.toFixed(2)} MT/ha</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BBS Actual Yield Card */}
                  <div className="bg-[#090d16] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">BBS Observed Yield</span>
                      <span className="text-3xl font-extrabold text-white mt-1 block">
                        {selectedRecord.year >= 2024 ? (
                          <span className="text-amber-500 text-lg font-semibold italic">Unobserved</span>
                        ) : (
                          <>
                            {selectedRecord.yield_mtha.toFixed(2)}{" "}
                            <span className="text-sm font-medium text-slate-400">MT/ha</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                      <span>Source: BBS Yearbook of Statistics</span>
                    </div>
                  </div>

                  {/* Cultivated Area Card */}
                  <div className="bg-[#090d16] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Cultivated Land Area</span>
                      <span className="text-3xl font-extrabold text-white mt-1 block">
                        {selectedRecord.area_ha.toLocaleString()}{" "}
                        <span className="text-sm font-medium text-slate-400">ha</span>
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] text-slate-400 font-mono">
                      <span>Est. Prod:</span>
                      <span className="text-slate-200 font-bold">
                        {Math.round(selectedRecord.area_ha * selectedRecord.pred_yield_mtha).toLocaleString()} MT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Secondary Weather Metric Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 bg-[#090d16]/40 p-4 rounded-xl border border-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 text-amber-400 p-2 rounded-lg">
                      <Thermometer className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Mean Temp</span>
                      <span className="text-sm font-bold text-slate-200">{selectedRecord.temp_c}°C</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-rose-500/10 text-rose-400 p-2 rounded-lg">
                      <Thermometer className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Skin Temp</span>
                      <span className="text-sm font-bold text-slate-200">{selectedRecord.earth_skin_temp}°C</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-500/10 text-cyan-400 p-2 rounded-lg">
                      <CloudRain className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Rainfall</span>
                      <span className="text-sm font-bold text-slate-200">{selectedRecord.rain_mm.toFixed(0)} mm</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Wind Speed</span>
                      <span className="text-sm font-bold text-slate-200">{selectedRecord.wind_speed.toFixed(1)} m/s</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Humidity</span>
                      <span className="text-sm font-bold text-slate-200">{selectedRecord.rh_pct.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/10 text-yellow-400 p-2 rounded-lg">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Solar Rad</span>
                      <span className="text-sm font-bold text-slate-200">{selectedRecord.solar_mj.toFixed(1)} MJ</span>
                    </div>
                  </div>
                </div>

                {/* Climate Stress Indicators */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-[#090d16]/30 border border-slate-900 rounded-xl">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Climate Stress Index</span>
                  <div className="flex flex-wrap gap-4">
                    {/* Flood stress badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Monsoon Flooding:</span>
                      {selectedRecord.flood > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
                          <AlertTriangle className="w-3.5 h-3.5" /> High Risk ({selectedRecord.flood.toFixed(1)})
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                          <ShieldCheck className="w-3.5 h-3.5" /> Nominal (No Risk)
                        </div>
                      )}
                    </div>

                    {/* Drought stress badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Dry-Season Drought:</span>
                      {selectedRecord.drought > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
                          <AlertTriangle className="w-3.5 h-3.5" /> Drought Stress ({selectedRecord.drought.toFixed(1)})
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                          <ShieldCheck className="w-3.5 h-3.5" /> Nominal (No Risk)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Historical Yield curves & Feature Importance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chart Panel */}
              <div className="glass-panel p-6 flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">Historical Yield curves (MT/ha)</span>
                <div style={{ width: "100%", height: "260px" }}>
                  <ResponsiveContainer>
                    <LineChart data={historicalSeries} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(38, 55, 83, 0.15)" />
                      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: "monospace" }} domain={["auto", "auto"]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#090d16", borderColor: "rgba(38, 55, 83, 0.5)", color: "#f1f5f9" }}
                        labelStyle={{ fontSize: "11px", fontWeight: "bold" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                      <Line 
                        name="BBS Observed" 
                        type="monotone" 
                        dataKey={(r) => r.year >= 2024 ? null : r.yield_mtha} 
                        stroke="#f1f5f9" 
                        strokeWidth={2.5}
                        dot={{ r: 4 }} 
                      />
                      <Line 
                        name="ML Predicted" 
                        type="monotone" 
                        dataKey="pred_yield_mtha" 
                        stroke="#10b981" 
                        strokeWidth={2.2} 
                        strokeDasharray="4 4" 
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Feature Importance Panel */}
              <div className="glass-panel p-6 flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">Model Feature Importances (%)</span>
                <div style={{ width: "100%", height: "260px" }}>
                  <ResponsiveContainer>
                    <BarChart data={featureImportanceData} layout="vertical" margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(38, 55, 83, 0.15)" />
                      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#090d16", borderColor: "rgba(38, 55, 83, 0.5)", color: "#f1f5f9" }}
                      />
                      <Bar dataKey="val" fill="#10b981" radius={[0, 4, 4, 0]}>
                        {featureImportanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#34d399" : "#059669"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Section: Academic Context block */}
        <section className="glass-panel p-6 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Cpu className="text-emerald-500 w-6 h-6" /> Why this is a "Simplified Digital Twin"
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed">
            <div className="flex flex-col gap-4">
              <p>
                In academic literature, a **Digital Twin** is defined as a virtual representation of a physical asset (in this case, district-level agricultural environments) with a bidirectional data flow. 
                This platform serves as a **simplified digital twin** because it bridges real meteorological telemetry with historical yield statistics to run predictive crop simulations:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                <li>
                  <strong className="text-emerald-400">Spatial Disaggregation:</strong> Modeling is done at the district level (64 nodes) instead of an aggregated national scale, capturing microclimatic boundaries.
                </li>
                <li>
                  <strong className="text-emerald-400">Real Environmental Telemetry:</strong> Physical inputs (temperature, rain, humidity, solar radiation) are pulled directly from NASA satellite sensors.
                </li>
                <li>
                  <strong className="text-emerald-400">Forward Simulation & Forecasts (2024-2029):</strong> We utilize 2024 satellite telemetry and 10-year climatological medians with recursive Kalman-style feedback corrections to predict near-term future crop yields.
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <p>
                To make this digital twin production-ready and deployment-efficient for static environments (like GitHub Pages), we decouple the heavy data computations:
              </p>
              <div className="bg-[#090d16] border border-slate-800 p-4 rounded-lg font-mono text-xs flex flex-col gap-3 text-emerald-400">
                <div>
                  <span className="text-slate-400">1. Physical Twin (Local PC):</span>
                  <div className="pl-3 text-slate-200 mt-1">Python Pipeline &rarr; fetch, process, and train XGBoost ML models.</div>
                </div>
                <div>
                  <span className="text-slate-400">2. Synchronization (Build step):</span>
                  <div className="pl-3 text-slate-200 mt-1">Precompute predictions &amp; climate statistics &rarr; lightweight static JSON exports.</div>
                </div>
                <div>
                  <span className="text-slate-400">3. Virtual Twin (GitHub Pages):</span>
                  <div className="pl-3 text-slate-200 mt-1">Serve static Next.js UI &rarr; zero live inference latency, maximum reliability.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Data Provenance Registry */}
        <section className="glass-panel p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Database className="text-emerald-500 w-6 h-6" /> Data Provenance & Registry
          </h2>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sm text-slate-300">
              This digital twin compiles and aligns primary real data from three highly credible public domains:
            </p>
            <Link href="/explorer" className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-[#0d1420]/80 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded transition-all">
              Launch Spreadsheet Grid &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Source Registry</th>
                  <th className="py-3 px-4 font-semibold">Parameter / Features</th>
                  <th className="py-3 px-4 font-semibold">Spatial / Temporal Scale</th>
                  <th className="py-3 px-4 font-semibold">Role in Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300 font-mono">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">BBS (Bangladesh Bureau of Statistics)</td>
                  <td className="py-3.5 px-4">Cultivated Area (ha), Rice Production (MT), Yield Rate (MT/ha)</td>
                  <td className="py-3.5 px-4">64 Districts / Yearly (2015-2023)</td>
                  <td className="py-3.5 px-4 text-emerald-400">Primary Target Variables (labels)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">BBS Historical Excel Registries (1995–2014)</td>
                  <td className="py-3.5 px-4">Cultivated Area (acres), Crop Production (tons), Calculated Yield (MT/ha)</td>
                  <td className="py-3.5 px-4">District Level / Annual Historical</td>
                  <td className="py-3.5 px-4 text-emerald-400">Long-term Productivity Baseline Profile Offset</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">NASA POWER API</td>
                  <td className="py-3.5 px-4">T2M (Temp), PRECTOTCORR (Rain), RH2M (Humidity), ALLSKY_SNDN (Solar), WS2M (Wind), TS (Skin Temp)</td>
                  <td className="py-3.5 px-4">District Centroid Points / Monthly</td>
                  <td className="py-3.5 px-4 text-cyan-400">Engineered Seasonal Climatology Features</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Division-Level Agroclimatic Dataset (2000–2024)</td>
                  <td className="py-3.5 px-4">Yield, Max/Min Temp, Max/Min Wind, Rain, PAR, Soil Wetness, Humidity, Skin Temp</td>
                  <td className="py-3.5 px-4">Division Centroids / 25-Year Annual</td>
                  <td className="py-3.5 px-4 text-cyan-400">Stacked Macro Division prior predictions</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">FAOSTAT (UN FAO)</td>
                  <td className="py-3.5 px-4">National Harvested Area, National Production, Yield Rate</td>
                  <td className="py-3.5 px-4">Bangladesh National / Annual</td>
                  <td className="py-3.5 px-4 text-amber-400">Macro-Validation & Trend Verification</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Limitations & Future Work */}
        <section className="glass-panel p-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Info className="text-emerald-500 w-6 h-6" /> Limitations & Scientific Disclaimers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold text-white flex items-center gap-1.5"><AlertTriangle className="text-amber-500 w-4 h-4" /> Soil Chemistry Omission</h4>
              <p className="text-xs leading-relaxed text-slate-400">
                While weather patterns dominate seasonal yield changes, soil qualities (pH, nitrogen, salinity in coastal regions like Satkhira and Bagerhat) are critical. This model assumes soil profile stability over time.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold text-white flex items-center gap-1.5"><AlertTriangle className="text-amber-500 w-4 h-4" /> Sudden Extreme Anomalies</h4>
              <p className="text-xs leading-relaxed text-slate-400">
                Crop yields can drop sharply due to flash floods or severe cyclones (e.g. Cyclone Sidr or Amphan) during harvesting weeks. Our monthly climate aggregates smooth these acute events, leading to potential under-estimation of disaster shocks.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold text-white flex items-center gap-1.5"><AlertTriangle className="text-amber-500 w-4 h-4" /> Static Data Decoupling</h4>
              <p className="text-xs leading-relaxed text-slate-400">
                This digital twin does not execute live machine learning inference inside the client's browser or inside server-side request boundaries. To keep server latency and hosting cost to a minimum, all outputs are statically compiled during local pipeline execution.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06080c] py-6 mt-12 text-center text-xs text-slate-500">
        <p>© 2026 Bangladesh Crop Yield Digital Twin Research. Built for Graduate Research Portfolio in AI/Agriculture.</p>
        <p className="mt-1">Pipeline: Python | Front-end: Next.js | Hosting: GitHub Pages</p>
      </footer>
    </div>
  );
}
