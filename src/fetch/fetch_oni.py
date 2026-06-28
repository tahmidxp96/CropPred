import os
import urllib.request
import pandas as pd

def fetch_noaa_oni():
    print("Downloading Oceanic Niño Index (ONI) from NOAA CPC...")
    url = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"
    raw_path = "data/raw/oni_raw.txt"
    output_path = "data/raw/noaa_oni.csv"
    
    os.makedirs("data/raw", exist_ok=True)
    
    try:
        urllib.request.urlretrieve(url, raw_path)
        print("Successfully downloaded raw ONI ascii file.")
    except Exception as e:
        print(f"Error downloading ONI data: {e}")
        return
        
    season_month_map = {
        "DJF": 1,
        "JFM": 2,
        "FMA": 3,
        "MAM": 4,
        "AMJ": 5,
        "MJJ": 6,
        "JJA": 7,
        "JAS": 8,
        "ASO": 9,
        "SON": 10,
        "OND": 11,
        "NDJ": 12
    }
    
    records = []
    with open(raw_path, "r") as f:
        # Skip header line: SEAS  YR   TOTAL   ANOM
        header = f.readline()
        
        for line in f:
            tokens = line.strip().split()
            if len(tokens) == 4:
                seas, yr, total, anom = tokens
                try:
                    year = int(yr)
                    anomaly = float(anom)
                    month = season_month_map.get(seas)
                    if month is not None:
                        records.append({
                            "year": year,
                            "month": month,
                            "oni_anomaly": anomaly
                        })
                except ValueError:
                    # Skip lines that are not data values (e.g. text logs or footer comments)
                    continue
                    
    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    print(f"Successfully processed {len(df)} ONI records. Saved to {output_path}")

if __name__ == "__main__":
    fetch_noaa_oni()
