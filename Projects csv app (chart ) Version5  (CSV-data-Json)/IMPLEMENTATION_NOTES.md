# Analysis Configuration Flow Implementation

# Csv control Way-1
Csv data Send BE to as FE as string
# response of the BE To FE
{
    "analysisId": "analysis1",
    "csv": "Table 1: Power Plant Data,,,,\nAT,V,AP,RH,PE\n8.34,40.77,1010.84,90.01,480.48\n23.64,58.49,1011.4,74.2,445.75\n29.74,56.9,1007.15,41.91,438.76\n19.07,49.69,1007.22,76.79,453.09\n11.8,40.66,1017.13,97.2,464.43\n13.97,39.16,1016.05,84.6,470.96\n22.1,71.29,1008.2,75.38,442.35\n14.47,41.76,1021.98,78.41,464.79\n,,,,\nTable 2: Sensor 1 Results,,,,\nAR,VT,AP1,RH1,PE1\n8.34,40.77,1010.84,90.01,480.48\n23.64,58.49,1011.4,74.2,445.75",
    "meta": {
        "fileSize": 414,
        "createdAt": "2026-02-18T06:30:43.493Z"
    }
}

 # parser
  Two parser used one is BE and other is FE
  
  # parser 1 : BE => Read the csv file and convert it as a string parse to Frontend
  # parser 2 : FE => parseMultiTableCsv is that function used to separate the tables from a single csv 

## Summary
Implemented a dual-flow system where:
- **analysis1**: Preconfigured dashboard (existing charts loaded directly)
- **analysis2**: User-configurable dashboard (must configure on first visit, then persists)

## Changes Made

### 1. Backend (BE-Analysis-csv)

#### `/database/analyses.json`
- Added `preconfigured` flag to each analysis
- analysis1: `preconfigured: true` (skip config page)
- analysis2: `preconfigured: false` (require configuration)

#### `/server.js`
- Added new endpoint: `GET /api/analysis/:analysisId/info`
  - Returns analysis metadata with `hasConfig` and `requiresConfiguration` flags
  - Used by FE to determine if user needs to configure

### 2. Frontend (Angular-FE-Analysis-csv-ui)

#### `/src/app/services/analysis.service.ts`
- Added `getAnalysisInfo(analysisId)` method
- Calls BE endpoint to fetch analysis info with config status

#### `/src/app/pages/dashboard/dashboard.ts`
- Added `OnInit` lifecycle hook
- Added `checkConfigAndLoad()` method:
  - Checks if analysis requires configuration
  - If yes: redirects to `/analysis/:analysisId/configure`
  - If no: loads and displays dashboard
- This ensures users configuring analysis2 are redirected to configure page first

### 3. Storage

#### `/storage/analysis2.csv`
- Created sample CSV file with data columns: timestamp, temperature, pressure, humidity, efficiency
- Used for user to select axes and chart type during configuration

## User Flow

### Analysis1 (Preconfigured)
1. User clicks analysis1 from analysis-list
2. Dashboard loads directly with preconfigured charts
3. Charts display immediately

### Analysis2 (User-Configurable)
1. User clicks analysis2 from analysis-list
2. System checks if configuration exists
3. **First visit**: No config → Redirects to `/analysis/analysis2/configure`
   - User selects chart type (bar, line, scatter)
   - User maps X-axis and Y-axis columns
   - Configuration saved to `/storage/analysis2.config.json`
   - Redirects to dashboard with configured charts
4. **Subsequent visits**: Config exists → Loads and displays dashboard with saved configuration

## Configuration Persistence
- Configurations stored in: `/storage/{analysisId}.config.json`
- Each analysis maintains its own configuration
- Configuration includes chart type, xKey, yKey mapping
- Can be updated/deleted via PUT/DELETE endpoints
