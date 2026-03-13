import { Component, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { AnalysisService } from '../../services/analysis.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import Papa from 'papaparse';

interface ChartConfig {
  id: string;
  type: string;
  xKey: string;
  yKey: string;
  table?: number;
}

@Component({
  selector: 'app-configure-dashboard',
  imports: [NzSelectModule, NzButtonModule, NzCardModule, FormsModule, CommonModule, NzIconModule],
  templateUrl: './configure-dashboard.html',
  styleUrl: './configure-dashboard.css',
})
export class ConfigureDashboard {
  analysisId = '';
  allTables = signal<{ title: string; columns: string[]; data: any[] }[]>([]);
  selectedTableIndex = signal(0);
  columns = signal<string[]>([]);
  charts = signal<ChartConfig[]>([]);

  constructor(
    private route: ActivatedRoute,
    private service: AnalysisService,
    private router: Router,
  ) {
    this.analysisId = this.route.snapshot.paramMap.get('analysisId')!;
    this.service.getData(this.analysisId).subscribe(
      (csv) => {
        const tables = this.parseMultiTableCsv(csv);
        this.allTables.set(tables);
        if (tables.length > 0) {
          this.columns.set(tables[0].columns);
        }

        // Load existing config (if any) so user can edit existing charts
        this.service.getConfig(this.analysisId).subscribe(
          (res) => {
            if (res && res.exists && res.config && Array.isArray(res.config.charts)) {
              const mapped = res.config.charts.map((c: any) => ({
                id: c.id,
                type: c.type,
                xKey: c.xKey,
                yKey: c.yKey,
                table: c.table ?? 0
              }));
              this.charts.set(mapped);
            }
          },
          () => {
            // ignore if no config
          }
        );
      },
      (error) => {
        console.error('Failed to load CSV data', error);
        alert('Failed to load analysis data');
      }
    );
    // Initialize with one empty chart
    this.charts.set([
      {
        id: crypto.randomUUID(),
        type: 'bar',
        xKey: '',
        yKey: '',
      },
    ]);
  }

  selectTable(index: number) {
    this.selectedTableIndex.set(index);
    this.columns.set(this.allTables()[index]?.columns || []);
  }

  addChart() {
    const newChart: ChartConfig = {
      id: crypto.randomUUID(),
      type: 'bar',
      xKey: '',
      yKey: '',
      table: this.selectedTableIndex()
    };
    this.charts.update((charts) => [...charts, newChart]);
  }

  removeChart(id: string) {
    this.charts.update((charts) => charts.filter((chart) => chart.id !== id));
  }

  save() {
    // Filter out charts with missing configuration
    const validCharts = this.charts().filter(
      (chart) => chart.xKey && chart.yKey
    );

    if (validCharts.length === 0) {
      alert('Please configure at least one chart with X and Y axes');
      return;
    }

    const config = {
      charts: validCharts,
    };

    this.service.saveConfig(this.analysisId, config).subscribe(() => {
      this.router.navigate(['/analysis', this.analysisId, 'dashboard']);
    });
  }

  // using papaparse separating multiple tables by "Table N: Name,,,,"
  parseMultiTableCsv(csvString: string) {
    const tables: { title: string; data: any[]; columns: string[] }[] = [];
    
    // Split by table headers: "Table N: Name,,,,"
    const tableBlocks = csvString.split(/Table \d+: /);
    
    tableBlocks.forEach((block, idx) => {
      if (idx === 0 || !block.trim()) return; // Skip first empty split
      
      // Extract title (everything before first newline)
      const lines = block.split(/\r?\n/);
      const titleLine = lines[0];
      const title = titleLine.replace(/,+$/, '').trim(); // Remove trailing commas and spaces
      
      // Rest is CSV data
      const csvData = lines.slice(1).join('\n');
      
      // Skip empty separators (lines with only commas)
      const cleanCsv = csvData
        .split(/\r?\n/)
        .filter(line => line.trim() && !/^,+$/.test(line))
        .join('\n');
      
      if (!cleanCsv.trim()) return;
      
      // Parse with PapaParse
      const parsed = Papa.parse(cleanCsv, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (h: string) => h.trim()
      });
      
      const columns = Object.keys(parsed.data[0] || {});
      tables.push({
        title,
        columns,
        data: parsed.data
      });
    });

    console.log('Parsed tables:', tables);
    return tables;
  }
}

