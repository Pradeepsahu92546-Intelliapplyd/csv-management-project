import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalysisService } from '../../services/analysis.service';
import { BarChart } from '../../components/charts-components/cartesian-charts/bar-chart/bar-chart';
import { LineChart } from '../../components/charts-components/cartesian-charts/line-chart/line-chart';
import { ScatterChart } from '../../components/charts-components/cartesian-charts/scatter-chart/scatter-chart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import Papa from 'papaparse';

@Component({
  selector: 'app-dashboard',
  imports: [BarChart, LineChart, ScatterChart, CommonModule, FormsModule, NzSelectModule, NzButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  analysisId = '';
  charts = signal<any[]>([]);
  data = signal<any[]>([]);
  allTables = signal<any[]>([]);
  selectedTableIndex = signal(0);

  constructor(
    private route: ActivatedRoute,
    private service: AnalysisService,
    private router: Router
  ) {
    this.analysisId =
      this.route.snapshot.paramMap.get('analysisId')!;
  }

  ngOnInit() {
    this.checkConfigAndLoad();
  }

  checkConfigAndLoad() {
    // Check if analysis has configuration
    this.service.getAnalysisInfo(this.analysisId).subscribe(
      (info) => {
        if (info.requiresConfiguration) {
          // Redirect to configure page if no config
          this.router.navigate(['/analysis', this.analysisId, 'configure']);
        } else {
          // Load dashboard if config exists
          this.load();
        }
      },
      (error) => {
        console.error('Failed to get analysis info', error);
      }
    );
  }

  load() {
    this.service.getConfig(this.analysisId)
      .subscribe(res => {
        if (res && res.exists && res.config && Array.isArray(res.config.charts)) {
          const mapped = res.config.charts.map((c: any) => ({ ...c, table: c.table ?? 0 }));
          this.charts.set(mapped);
        }
      }, () => {
        // ignore if no config
      });
    this.service.getData(this.analysisId)
      .subscribe(csv => {
        const tables = this.parseMultiTableCsv(csv);
        this.allTables.set(tables);
        this.data.set(tables[0]?.data || []);
      });
  }

  selectTable(index: number) {
    this.selectedTableIndex.set(index);
    this.data.set(this.allTables()[index]?.data || []);
  }


  // table spilter from single csv
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

    return tables;
  }

  map(chart: any) {
    const tableIdx = chart.table ?? this.selectedTableIndex();
    const rows = this.allTables()[tableIdx]?.data || [];
    return rows.map((row: any) => ({
      x: row[chart.xKey],
      y: row[chart.yKey],
      timestamp: new Date()
    }));
  }
}
