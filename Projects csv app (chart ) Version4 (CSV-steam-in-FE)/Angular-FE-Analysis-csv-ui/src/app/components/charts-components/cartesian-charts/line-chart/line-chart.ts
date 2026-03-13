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
  selector: 'app-line-chart',
  imports: [FormsModule, CommonModule],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.css',
})
export class LineChart implements OnChanges {
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
      .domain([0, this.filtered.length - 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.filtered, d => d.y) || 100])
      .range([height, 0]);

    // Create line generator
    const line = d3.line<any>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d.y));

    // Draw path
    svg.append('path')
      .datum(this.filtered)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Draw circles for data points
    svg.selectAll('.dot')
      .data(this.filtered)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (_, i) => xScale(i))
      .attr('cy', d => yScale(d.y))
      .attr('r', 4)
      .attr('fill', 'steelblue');

    // Draw X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Draw Y axis
    svg.append('g')
      .call(d3.axisLeft(yScale));
  }
}
