export interface ChartConfig {
  type: 'bar' | 'line' | 'scatter' | 'pie' | 'donut';
  xKey: string;
  yKey: string;
}
