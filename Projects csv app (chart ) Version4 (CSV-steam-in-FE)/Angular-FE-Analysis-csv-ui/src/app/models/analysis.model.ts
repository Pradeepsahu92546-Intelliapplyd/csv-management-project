export interface AnalysisResult {
  id: string;
  name: string;
  columns: string[];
  data: any[];
  meta: Record<string, any>;
}
