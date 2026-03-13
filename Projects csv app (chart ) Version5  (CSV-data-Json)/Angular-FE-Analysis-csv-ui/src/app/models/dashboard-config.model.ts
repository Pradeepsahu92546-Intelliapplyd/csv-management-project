export interface ChartConfig {

  id: string;

  type: 'line' | 'bar' | 'scatter' | 'pie' | 'donut';

  xKey: string;

  yKey: string;

  title: string;
}

export interface DashboardConfig {

  analysisId: string;

  charts: ChartConfig[];
}
