const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

const STORAGE_FOLDER = path.join(__dirname, 'storage');
const DATABASE_FOLDER = path.join(__dirname, 'database');

// Helper functions
function getUnits() {
  return JSON.parse(
    fs.readFileSync(path.join(DATABASE_FOLDER, 'units.json'))
  );
}

// Parse multi-table CSV string into structured JSON format
function parseMultiTableCsv(csvString) {
  const tables = [];
  
  // Split by table headers: "Table N: Name,,,,"
  const tableBlocks = csvString.split(/Table \d+: /);
  
  tableBlocks.forEach((block, idx) => {
    if (idx === 0 || !block.trim()) return; // Skip first empty split
    
    // Extract title (everything before first newline)
    const lines = block.split(/\r?\n/);
    const titleLine = lines[0];
    const name = titleLine.replace(/,+$/, '').trim(); // Remove trailing commas and spaces
    
    // Rest is CSV data
    const csvData = lines.slice(1).join('\n');
    
    // Skip empty separators (lines with only commas)
    const cleanCsv = csvData
      .split(/\r?\n/)
      .filter(line => line.trim() && !/^,+$/.test(line))
      .join('\n');
    
    if (!cleanCsv.trim()) return;
    
    // Parse CSV manually (simple implementation)
    const csvLines = cleanCsv.split(/\r?\n/);
    const headers = csvLines[0]
      .split(',')
      .map(h => h.trim());
    
    const rows = [];
    for (let i = 1; i < csvLines.length; i++) {
      const line = csvLines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => {
        const trimmed = v.trim();
        // Try to convert to number
        const num = parseFloat(trimmed);
        return isNaN(num) ? trimmed : num;
      });
      
      rows.push(values);
    }
    
    if (rows.length > 0) {
      tables.push({
        name,
        columns: headers,
        rows
      });
    }
  });
  
  return tables;
}

function getAnalyses() {
  return JSON.parse(
    fs.readFileSync(path.join(DATABASE_FOLDER, 'analyses.json'))
  );
}

function getCsvPath(analysisId) {
  return path.join(STORAGE_FOLDER, `${analysisId}.csv`);
}

function getConfigPath(analysisId) {
  return path.join(STORAGE_FOLDER, `${analysisId}.config.json`);
}

// Units APIs
app.get('/api/units', (req, res) => {
  try {
    const units = getUnits();
    res.json(units);

  } catch (error) {
    res.status(500).json({
      error: 'Failed to load units'
    });
  }
});


// Analyses APIs
app.get('/api/units/:unitId/analyses', (req, res) => {

  try {
    const analyses = getAnalyses();
    const filtered =
      analyses.filter(
        a => a.unitId === req.params.unitId
      );
    res.json(filtered);

  } catch (error) {
    res.status(500).json({
      error: 'Failed to load analyses'
    });
  }
});



// Get Analysis CSV Data (Parsed as JSON)
app.get('/api/analysis/:analysisId/data', (req, res) => {
  const analysisId = req.params.analysisId;
  const csvPath = getCsvPath(analysisId);

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({
      error: 'CSV file not found'
    });
  }
  try {
    const content = fs.readFileSync(csvPath, 'utf8');
    const stats = fs.statSync(csvPath);
    
    // Parse multi-table CSV into structured JSON format
    const tables = parseMultiTableCsv(content);

    res.json({
      analysisId,
      tables,
      meta: {
        fileSize: stats.size,
        createdAt: stats.birthtime
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read CSV' });
  }
});

// Get Raw CSV File (for download)
app.get('/api/analysis/:analysisId/csv', (req, res) => {
  const analysisId = req.params.analysisId;
  const csvPath = getCsvPath(analysisId);

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({
      error: 'CSV file not found'
    });
  }
  try {
    const content = fs.readFileSync(csvPath, 'utf8');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${analysisId}.csv"`);
    res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'));
    res.end(content, 'utf8');
  } catch (err) {
    console.error('CSV download error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to read CSV' });
    }
  }
});


// Get Analysis Metadata Only

app.get('/api/analysis/:analysisId/meta', (req, res) => {
  const csvPath =
    getCsvPath(req.params.analysisId);

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({
      error: 'Analysis not found'
    });
  }

  const stats = fs.statSync(csvPath);

  res.json({
    analysisId: req.params.analysisId,
    fileSize: stats.size,
    createdAt: stats.birthtime
  });
});

// Dashboard Configuration APIs

// Check config exists
app.get('/api/analysis/:analysisId/config', (req, res) => {
  const configPath =
    getConfigPath(req.params.analysisId);

  if (!fs.existsSync(configPath)) {
    return res.status(404).json({
      exists: false,
      message: 'Config not found'
    });
  }

  const config =
    JSON.parse(
      fs.readFileSync(configPath)
    );

  res.json({
    exists: true,
    analysisId: req.params.analysisId,
    config
  });
});


// Save config
app.post('/api/analysis/:analysisId/config', (req, res) => {
  const configPath =
    getConfigPath(req.params.analysisId);

  const config = req.body;

  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify(config, null, 2)
    );

    res.json({
      success: true,
      message: 'Dashboard configuration saved',
      config
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: 'Failed to save config'
    });
  }
});


// Update config
app.put('/api/analysis/:analysisId/config', (req, res) => {

  const configPath =
    getConfigPath(req.params.analysisId);

  if (!fs.existsSync(configPath)) {
    return res.status(404).json({
      error: 'Config not found'
    });
  }

  try {
    fs.writeFileSync(
      configPath,
      JSON.stringify(req.body, null, 2)
    );
    res.json({
      success: true,
      message: 'Config updated'
    });
  } catch {
    res.status(500).json({
      error: 'Update failed'
    });
  }
});


// Delete config
app.delete('/api/analysis/:analysisId/config', (req, res) => {
  const configPath =
    getConfigPath(req.params.analysisId);
  if (!fs.existsSync(configPath)) {
    return res.status(404).json({
      error: 'Config not found'
    });
  }

  fs.unlinkSync(configPath);
  res.json({
    success: true,
    message: 'Config deleted'
  });
});



// Get Analysis Info (with config status)
app.get('/api/analysis/:analysisId/info', (req, res) => {
  const analysisId = req.params.analysisId;
  const analyses = getAnalyses();
  const analysis = analyses.find(a => a.id === analysisId);

  if (!analysis) {
    return res.status(404).json({
      error: 'Analysis not found'
    });
  }

  const configPath = getConfigPath(analysisId);
  const hasConfig = fs.existsSync(configPath);

  res.json({
    ...analysis,
    hasConfig: hasConfig,
    requiresConfiguration: !hasConfig
  });
});

// Get Dashboard (Config + Data)
app.get('/api/analysis/:analysisId/dashboard', (req, res) => {
  const analysisId = req.params.analysisId;
  const configPath = getConfigPath(analysisId);
  const csvPath = getCsvPath(analysisId);
  if (!fs.existsSync(configPath)) {
    return res.status(404).json({
      error: 'Dashboard not configured'
    });
  }
  const config =
    JSON.parse(
      fs.readFileSync(configPath)
    );
  try {
    const content = fs.readFileSync(csvPath, 'utf8');
    res.json({
      analysisId,
      config,
      csv: content,
      meta: {
        fileSize: fs.statSync(csvPath).size
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read CSV' });
  }
});



// server listening => node server.js
app.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}`
  );
});
