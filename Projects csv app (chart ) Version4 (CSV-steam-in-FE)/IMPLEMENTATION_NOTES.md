# Analysis Configuration Flow Implementation

# Csv control Way-2
Csv data Send BE to as FE as Csv Stream


 # parser
    In FE only one parser which used to which handle both csv steam read data and also separate data
  
  # parser 1 : FE => parseMultiTableCsv is that function used to separate the tables from a single csv 

  For Export csv used FileServer.js 

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
