# API Response Format Reference

## GET /api/analysis/:analysisId/data

### Response Format (New JSON Structure)

```json
{
  "analysisId": "analysis1",
  "tables": [
    {
      "name": "Power Plant Data",
      "columns": ["AT", "V", "AP", "RH", "PE"],
      "rows": [
        [8.34, 40.77, 1010.84, 90.01, 480.48],
        [23.64, 58.49, 1011.4, 74.2, 445.75],
        [13.97, 46.46, 1010.4, 87.4, 446.4]
      ]
    },
    {
      "name": "Sensor 1 Results",
      "columns": ["Sensor_ID", "Reading_1", "Reading_2", "Reading_3"],
      "rows": [
        [1, 100.5, 102.3, 101.8],
        [2, 98.2, 99.5, 100.1]
      ]
    }
  ],
  "meta": {
    "fileSize": 15234,
    "createdAt": "2024-02-19T10:30:00.000Z"
  }
}
```

### Conversion in FE (AnalysisService)

The service automatically converts the above to dashboard format:

```json
[
  {
    "title": "Power Plant Data",
    "columns": ["AT", "V", "AP", "RH", "PE"],
    "data": [
      { "AT": 8.34, "V": 40.77, "AP": 1010.84, "RH": 90.01, "PE": 480.48 },
      { "AT": 23.64, "V": 58.49, "AP": 1011.4, "RH": 74.2, "PE": 445.75 },
      { "AT": 13.97, "V": 46.46, "AP": 1010.4, "RH": 87.4, "PE": 446.4 }
    ]
  },
  {
    "title": "Sensor 1 Results",
    "columns": ["Sensor_ID", "Reading_1", "Reading_2", "Reading_3"],
    "data": [
      { "Sensor_ID": 1, "Reading_1": 100.5, "Reading_2": 102.3, "Reading_3": 101.8 },
      { "Sensor_ID": 2, "Reading_1": 98.2, "Reading_2": 99.5, "Reading_3": 100.1 }
    ]
  }
]
```

This format is then consumed by:
- **dashboard.ts**: For displaying charts
- **configure-dashboard.ts**: For configuring chart axes

---

## CSV Input Format Expected (Backend)

The backend expects CSV files formatted as:

```
Table 1: Power Plant Data
AT,V,AP,RH,PE
8.34,40.77,1010.84,90.01,480.48
23.64,58.49,1011.4,74.2,445.75
13.97,46.46,1010.4,87.4,446.4

Table 2: Sensor 1 Results
Sensor_ID,Reading_1,Reading_2,Reading_3
1,100.5,102.3,101.8
2,98.2,99.5,100.1
```

The `parseMultiTableCsv()` function parses this and converts it to the JSON response format shown above.
