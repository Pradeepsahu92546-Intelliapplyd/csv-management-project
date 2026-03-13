import { Component, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { AnalysisService } from '../../services/analysis.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';

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
      (tables) => {
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
}

