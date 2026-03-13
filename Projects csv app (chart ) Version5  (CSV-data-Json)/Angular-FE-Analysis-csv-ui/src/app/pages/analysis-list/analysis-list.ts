import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { saveAs } from 'file-saver';

import { AnalysisService } from '../../services/analysis.service';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-analysis-list',
  imports: [CommonModule, NzTableModule, NzButtonModule],
  templateUrl: './analysis-list.html',
  styleUrl: './analysis-list.css',
})
export class AnalysisList {
  analyses: any[] = [];
  unitId: string = '';

  constructor(
    private service: AnalysisService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.unitId = this.route.snapshot.paramMap.get('unitId')!;

    this.service.getAnalyses(this.unitId).subscribe((res) => (this.analyses = res));
  }

  open(id: string) {
    this.service.getConfig(id).subscribe({
      next: (res) => {
        this.router.navigate(['/analysis', id, 'dashboard']);
      },

      error: () => {
        this.router.navigate(['/analysis', id, 'configure']);
      },
    });
  }

  // download / Export the csv
  downloadCsv(id: string) {
    this.service.getRawCsv(id).subscribe({
      next: (csv) => {
        try {
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          saveAs(blob, `${id}.csv`);
        } catch (err) {
          console.error('Download failed', err);
          alert('Failed to download CSV');
        }
      },
      error: (err) => {
        console.error('Failed to fetch CSV', err);
        alert('Failed to fetch CSV data');
      }
    });
  }
}
