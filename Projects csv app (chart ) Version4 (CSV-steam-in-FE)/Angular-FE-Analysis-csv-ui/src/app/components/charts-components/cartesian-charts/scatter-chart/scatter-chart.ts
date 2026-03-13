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
  selector: 'app-scatter-chart',
  imports: [FormsModule, CommonModule],
  templateUrl: './scatter-chart.html',
  styleUrl: './scatter-chart.css',
})
export class ScatterChart implements OnChanges {
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
    if (!this.chart || !this.filtered.length) {
      return;
    }

    const el = this.chart.nativeElement;
    d3.select(el).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(el)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.filtered, d => d.x) || 100])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.filtered, d => d.y) || 100])
      .range([height, 0]);

    // Draw circles for scatter points
    svg.selectAll('.dot')
      .data(this.filtered)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 5)
      .attr('fill', 'rgba(70, 130, 180, 0.6)')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5);

    // Draw X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Draw Y axis
    svg.append('g')
      .call(d3.axisLeft(yScale));
  }
}
