import {
 Component,
 Input,
 ElementRef,
 ViewChild,
 OnChanges,
 SimpleChanges
} from '@angular/core';
import * as d3 from 'd3';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bar-chart',
  imports: [FormsModule, CommonModule],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.css',
})
export class BarChart implements OnChanges {

 @Input() data: any[] = [];
 @Input() xKey: string = '';
 @Input() yKey: string = '';

 @ViewChild('chart', { static: false }) chart!: ElementRef;

 filtered: any[] = [];
 dataSize: number = 10;
 totalDataSize: number = 0;

 ngOnChanges(changes: SimpleChanges) {
   this.totalDataSize = this.data.length;
   if (this.chart) {
     this.setFilter('day');
   }
 }

 setFilter(range: string) {
   this.filtered = this.data.slice(0, this.dataSize);
   this.render();
 }

 onDataSizeChange(size: number) {
   this.dataSize = size;
   this.setFilter('day');
 }

 render() {

   if (!this.chart) {
     return;
   }

   const el = this.chart.nativeElement;

   d3.select(el).selectAll('*').remove();

   const svg = d3.select(el)
     .append('svg')
     .attr('width', 600)
     .attr('height', 400);

   svg.selectAll('rect')
     .data(this.filtered)
     .enter()
     .append('rect')
     .attr('x', (_, i) => i * 40)
     .attr('y', d => 400 - d.y)
     .attr('width', 30)
     .attr('height', d => d.y)
     .attr('fill', 'steelblue');
 }
}