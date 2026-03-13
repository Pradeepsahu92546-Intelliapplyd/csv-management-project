import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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

  downloadCsv(id: string) {
    this.service.getData(id).subscribe({
      next: (csv) => {
        try {
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${id}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
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
