import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisService } from '../../services/analysis.service';
import { Router } from '@angular/router';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
@Component({
  selector: 'app-unit-list',
  imports: [CommonModule, NzTableModule, NzButtonModule],
  templateUrl: './unit-list.html',
  styleUrl: './unit-list.css',
})
export class UnitList {
    units = signal<any[]>([]);

  constructor(
    private service: AnalysisService,
    private router: Router
  ) {

    this.service.getUnits()
      .subscribe(res => this.units.set(res));
  }

  openAnalyses(unitId: string) {

    this.router.navigate(
      ['/units', unitId, 'analyses']
    );
  }
}
