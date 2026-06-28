"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Search, Filter, Calendar, Database, 
  Download, ChevronLeft, ChevronRight, RefreshCw, Cpu, Activity
} from "lucide-react";

export default function DataExplorer() {
  const [activeDataset, setActiveDataset] = useState("digital_twin");
  const [data, setData] = useState([]);
  
  // Filtering and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeason, setFilterSeason] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch target dataset on demand to optimize performance
  useEffect(() => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    let url = "";
    if (activeDataset === "digital_twin") {
      url = `${basePath}/data/yield_data.json`;
    } else if (activeDataset === "bbs_raw") {
      url = `${basePath}/data/bbs_raw.json`;
    } else if (activeDataset === "nasa_raw") {
      url = `${basePath}/data/nasa_raw.json`;
    } else if (activeDataset === "historical_crop") {
      url = `${basePath}/data/historical_crop_raw.json`;
    } else if (activeDataset === "division_agroclimatic") {
      url = `${basePath}/data/division_agroclimatic_raw.json`;
    } else {
      url = `${basePath}/data/fao_national.json`;
    }

    fetch(`${url}?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load dataset: ${activeDataset}`);
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [activeDataset]);

  // Client-side filtering
  const getFilteredData = () => {
    return data.filter(row => {
      // 1. Search Query filter (matches district/division/element)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = q === "" 
        || (row.district && row.district.toLowerCase().includes(q))
        || (row.division && row.division.toLowerCase().includes(q))
        || (row.element && row.element.toLowerCase().includes(q));

      // 2. Season filter
      const matchSeason = filterSeason === "All" 
        || (row.season && row.season === filterSeason);

      // 3. Year filter
      const matchYear = filterYear === "All" 
        || (row.year && row.year.toString() === filterYear);

      return matchSearch && matchSeason && matchYear;
    });
  };

  const filteredData = getFilteredData();

  // Pagination calculation
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Extract columns based on dataset schema
  const getColumns = () => {
    if (activeDataset === "digital_twin") {
      return [
        { key: "district", label: "District", align: "left" },
        { key: "division", label: "Division", align: "left" },
        { key: "year", label: "Year", align: "center" },
        { key: "season", label: "Season", align: "center" },
        { key: "area_ha", label: "Area (ha)", align: "right", num: true },
        { key: "yield_mtha", label: "BBS Yield (MT/ha)", align: "right", num: true, emptyVal: 0.0 },
        { key: "pred_yield_mtha", label: "ML Pred (MT/ha)", align: "right", num: true },
        { key: "temp_c", label: "Temp (°C)", align: "right", num: true },
        { key: "rain_mm", label: "Rain (mm)", align: "right", num: true },
        { key: "rh_pct", label: "RH (%)", align: "right", num: true },
        { key: "solar_mj", label: "Solar/PAR (MJ)", align: "right", num: true },
        { key: "flood", label: "Flood Idx", align: "right", num: true },
        { key: "drought", label: "Drought Idx", align: "right", num: true },
        { key: "wind_speed", label: "Wind (m/s)", align: "right", num: true },
        { key: "earth_skin_temp", label: "Skin Temp (°C)", align: "right", num: true },
        { key: "division_prior", label: "Div Prior", align: "right", num: true },
        { key: "historical_baseline", label: "Hist Baseline", align: "right", num: true }
      ];
    } else if (activeDataset === "bbs_raw") {
      return [
        { key: "district", label: "District", align: "left" },
        { key: "year", label: "Year", align: "center" },
        { key: "season", label: "Season", align: "center" },
        { key: "area_ha", label: "Area (ha)", align: "right", num: true },
        { key: "production_mt", label: "Production (MT)", align: "right", num: true },
        { key: "yield_mtha", label: "Obs. Yield (MT/ha)", align: "right", num: true }
      ];
    } else if (activeDataset === "nasa_raw") {
      return [
        { key: "district", label: "District", align: "left" },
        { key: "year", label: "Year", align: "center" },
        { key: "month", label: "Month", align: "center" },
        { key: "temp_c", label: "Temp (°C)", align: "right", num: true },
        { key: "rain_mm_day", label: "Rain (mm/day)", align: "right", num: true },
        { key: "rh_pct", label: "Humidity (%)", align: "right", num: true },
        { key: "solar_mj_m2_day", label: "Solar/PAR (MJ/m²/d)", align: "right", num: true },
        { key: "wind_speed", label: "Wind Speed (m/s)", align: "right", num: true },
        { key: "earth_skin_temp", label: "Skin Temp (°C)", align: "right", num: true }
      ];
    } else if (activeDataset === "historical_crop") {
      return [
        { key: "district", label: "District", align: "left" },
        { key: "division", label: "Division", align: "left" },
        { key: "year", label: "Year", align: "center" },
        { key: "season", label: "Crop/Season", align: "center" },
        { key: "area_acres", label: "Area (Acres)", align: "right", num: true },
        { key: "production_tons", label: "Prod (Tons)", align: "right", num: true },
        { key: "yield_mtha", label: "Calc Yield (MT/ha)", align: "right", num: true }
      ];
    } else if (activeDataset === "division_agroclimatic") {
      return [
        { key: "division", label: "Division", align: "left" },
        { key: "year", label: "Year", align: "center" },
        { key: "yield_mtha", label: "Crop Yield (MT/ha)", align: "right", num: true },
        { key: "temp_max", label: "Max Temp (°C)", align: "right", num: true },
        { key: "temp_min", label: "Min Temp (°C)", align: "right", num: true },
        { key: "wind_speed_max", label: "Max Wind (m/s)", align: "right", num: true },
        { key: "wind_speed_min", label: "Min Wind (m/s)", align: "right", num: true },
        { key: "rain_sum", label: "Rain Corrected (mm)", align: "right", num: true },
        { key: "par", label: "PAR (MJ)", align: "right", num: true },
        { key: "soil_wetness_root", label: "Root Moisture", align: "right", num: true },
        { key: "soil_wetness_surf", label: "Surface Moisture", align: "right", num: true },
        { key: "humidity", label: "Humidity (%)", align: "right", num: true },
        { key: "skin_temp", label: "Skin Temp (°C)", align: "right", num: true }
      ];
    } else { // fao_national
      return [
        { key: "year", label: "Year", align: "center" },
        { key: "element", label: "Parameter", align: "left" },
        { key: "value", label: "Value", align: "right", num: true },
        { key: "unit", label: "Unit", align: "center" }
      ];
    }
  };

  const columns = getColumns();

  // Export current filtered table view as CSV file
  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    
    // Headers
    const headers = columns.map(col => col.label).join(",");
    
    // Rows
    const rows = filteredData.map(row => {
      return columns.map(col => {
        let val = row[col.key];
        if (val === undefined || val === null) val = "";
        // Wrap strings in quotes if they contain commas
        if (typeof val === "string" && val.includes(",")) {
          return `"${val}"`;
        }
        return val;
      }).join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bangladesh_crop_${activeDataset}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get description for the active dataset
  const getDatasetMeta = () => {
    switch(activeDataset) {
      case "digital_twin":
        return {
          title: "Engineered Feature & Prediction Matrix",
          source: "BBS (labels) + NASA POWER Satellite Telemetry (features)",
          desc: "This dataset represents the final synchronized matrix used to train and evaluate the crop models. It aligns district-level seasonal yields with computed planting-to-harvest climatic aggregates, stress metrics, and Random Forest predictions (2015-2024)."
        };
      case "bbs_raw":
        return {
          title: "Raw BBS Yield Records",
          source: "Bangladesh Bureau of Statistics Official Yearbooks (Digitized)",
          desc: "District-level crop census results containing raw historical values of cultivated land area (hectares), production volume (metric tonnes), and calculated crop yields for Aus, Aman, and Boro seasons (2015-2023)."
        };
      case "nasa_raw":
        return {
          title: "Raw NASA POWER Weather Telemetry",
          source: "NASA Langley Research Center POWER API Climatology",
          desc: "Monthly environmental observations extracted for all 64 district coordinates, including surface temperatures, daily precipitation, relative humidity, and solar irradiance. Used to construct seasonal features (2015-2024)."
        };
      case "historical_crop":
        return {
          title: "BBS Historical Crop Registries (1995-2014)",
          source: "Bangladesh Bureau of Statistics Official Records (Excel format)",
          desc: "Raw historical district-level crop statistics parsed from official records spanning 1995 to 2014. Used for long-term historical yield baseline calibration."
        };
      case "division_agroclimatic":
        return {
          title: "Raw Division-Level Agroclimatic Dataset (2000-2024)",
          source: "BBS Crop Data + NASA POWER Climatology Integration",
          desc: "Comprehensive 25-year division-level dataset containing annual average yields aligned with solar PAR, wind speed extremes, surface soil moisture, and land temperatures."
        };
      default:
        return {
          title: "National FAOSTAT Reference Metrics",
          source: "United Nations FAOSTAT Country Yield Registry",
          desc: "Macro country-level paddy rice statistics for Bangladesh used to cross-reference and validate localized model behavior and trend aggregates."
        };
    }
  };

  const meta = getDatasetMeta();

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-200 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[rgba(38,55,83,0.4)] bg-[rgba(13,20,32,0.9)] sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700/80 p-2 rounded-lg text-slate-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Database className="text-emerald-500 w-5 h-5" />
                <h1 className="text-lg font-bold tracking-tight text-white glow-text">
                  Spatial Data Registry Explorer
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Bangladesh Crop Yield Digital Twin Data Warehouse
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/performance" className="bg-[#0f1b2b] border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 hover:-translate-y-0.5 shadow-md">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Performance
            </Link>
            <Link href="/methodology" className="bg-[#0f1b2b] border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 hover:-translate-y-0.5 shadow-md">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Methodology
            </Link>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1.5 rounded border border-emerald-500/20 font-mono hidden sm:inline-block">
              Decoupled Warehouse
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        {/* Dataset Switch Panel */}
        <section className="glass-panel p-4 flex flex-wrap gap-2">
          {[
            { id: "digital_twin", label: "Merged Twin Matrix (Processed)" },
            { id: "bbs_raw", label: "Raw BBS Yields (Census)" },
            { id: "nasa_raw", label: "Raw NASA Climate (Observations)" },
            { id: "historical_crop", label: "Raw Historical Excel Crops (1995-2014)" },
            { id: "division_agroclimatic", label: "Raw Division Agroclimatic (2000-2024)" },
            { id: "fao_national", label: "Raw FAOSTAT National (Reference)" }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveDataset(btn.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                activeDataset === btn.id
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-[#0d1420]/50 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </section>

        {/* Dataset Metadata Description Card */}
        <section className="bg-[#090d16]/80 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">Registry Details</span>
            <h2 className="text-xl font-bold text-white mt-1">{meta.title}</h2>
            <p className="text-xs text-slate-400 mt-1 font-semibold">Source: {meta.source}</p>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-3xl">{meta.desc}</p>
          </div>
          
          <button
            onClick={exportToCSV}
            disabled={filteredData.length === 0 || loading}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold text-xs px-4 py-3 rounded-lg shadow-lg shadow-emerald-500/10 transition-colors w-full md:w-auto justify-center"
          >
            <Download className="w-4 h-4" /> Download Dataset (.csv)
          </button>
        </section>

        {/* Filters and Search Bar */}
        <section className="glass-panel p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          {/* Search Query */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by district name or division..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#0d1420]/60 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Season Filter (Aus, Aman, Boro - skip for FAO) */}
            {activeDataset !== "fao_national" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Season:</span>
                <select
                  value={filterSeason}
                  onChange={(e) => { setFilterSeason(e.target.value); setCurrentPage(1); }}
                  className="bg-[#0d1420]/80 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="All">All Seasons</option>
                  <option value="Aus">Aus</option>
                  <option value="Aman">Aman</option>
                  <option value="Boro">Boro</option>
                </select>
              </div>
            )}

            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Year:</span>
              <select
                value={filterYear}
                onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
                className="bg-[#0d1420]/80 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Years</option>
                {[...new Set(data.map(row => row.year).filter(Boolean))].sort((a, b) => b - a).map(yr => (
                  <option key={yr} value={yr.toString()}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                className="bg-[#0d1420]/80 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                {[10, 25, 50, 100].map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Spreadsheet Table View */}
        <section className="glass-panel overflow-hidden border border-slate-800/80">
          {loading ? (
            <div className="py-24 flex flex-col justify-center items-center">
              <RefreshCw className="animate-spin text-emerald-500 w-10 h-10 mb-3" />
              <p className="text-xs text-slate-400">Loading dataset grid from storage...</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <p className="text-rose-500 font-semibold mb-2">Error loading registry</p>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
          ) : totalRecords === 0 ? (
            <div className="py-24 text-center">
              <p className="text-slate-400 font-semibold">No matching records found</p>
              <p className="text-xs text-slate-500">Refine your search term or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0a0f18] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono font-semibold">
                    <th className="py-3 px-4 border-r border-slate-900 text-center w-12">#</th>
                    {columns.map(col => (
                      <th 
                        key={col.key} 
                        className={`py-3 px-4 border-r border-slate-900 text-${col.align}`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-mono">
                  {paginatedData.map((row, index) => {
                    const rowNum = startIndex + index + 1;
                    return (
                      <tr 
                        key={`row-${rowNum}`} 
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-2 px-3 border-r border-slate-900 text-center text-slate-500 bg-[#090d16]/30">
                          {rowNum}
                        </td>
                        {columns.map(col => {
                          let val = row[col.key];
                          
                          // Format number display
                          if (col.num && typeof val === "number") {
                            if (col.key === "area_ha" || col.key === "production_mt") {
                              val = Math.round(val).toLocaleString();
                            } else {
                              val = val.toFixed(2);
                            }
                          }
                          
                          // Empty observations (e.g. 2024 BBS yield)
                          if (val === 0.0 && col.emptyVal !== undefined && row.year === 2024) {
                            val = <span className="text-amber-500/80 italic font-sans text-[10px]">Unobserved</span>;
                          }
                          
                          return (
                            <td 
                              key={col.key} 
                              className={`py-2.5 px-4 border-r border-slate-900 text-${col.align}`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {!loading && totalRecords > 0 && (
          <section className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#090d16]/60 border border-slate-900 p-4 rounded-xl text-xs font-mono">
            <span className="text-slate-400">
              Showing <span className="text-slate-200 font-semibold">{startIndex + 1}</span> to{" "}
              <span className="text-slate-200 font-semibold">{Math.min(startIndex + pageSize, totalRecords)}</span> of{" "}
              <span className="text-slate-200 font-semibold">{totalRecords.toLocaleString()}</span> records
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700/50 p-2 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-slate-300">
                Page <span className="text-white font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700/50 p-2 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06080c] py-6 mt-12 text-center text-xs text-slate-500">
        <p>© 2026 Bangladesh Crop Yield Digital Twin Research. Built for Graduate Research Portfolio in AI/Agriculture.</p>
      </footer>
    </div>
  );
}
