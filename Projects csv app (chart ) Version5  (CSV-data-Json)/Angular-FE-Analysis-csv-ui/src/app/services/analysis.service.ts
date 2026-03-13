import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AnalysisResult } from '../models/analysis.model';
import { CsvDataResponse, csvTablesToDashboardFormat } from '../models/csv-data.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
 private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getUnits(): Observable<any[]> {
    const units = this.http.get<any[]>(`${this.api}/units`);
    console.log('Ger Unites :', units);
    return units;
  }

  getAnalyses(unitId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/units/${unitId}/analyses`);
  }

  getAnalysisResult(analysisId: string): Observable<AnalysisResult> {
    return this.http.get<AnalysisResult>(`${this.api}/analysis/${analysisId}`);
  }

  getAnalysisInfo(analysisId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/analysis/${analysisId}/info`);
  }

  getConfig(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/analysis/${id}/config`);
  }

  saveConfig(id: string, config: any): Observable<any> {
    return this.http.post(`${this.api}/analysis/${id}/config`, config);
  }

  /**
   * Get parsed CSV data from BE (now returns structured JSON with tables)
   * Converts to dashboard format: { title, columns, data }
   */
  getData(id: string): Observable<any[]> {
    const data = this.http.get<CsvDataResponse>(`${this.api}/analysis/${id}/data`).pipe(
      map(res => csvTablesToDashboardFormat(res.tables))
    );
    console.log('Get Data :', data);
    return data;
  }

  /**
   * Get raw CSV file content for download
   */
  getRawCsv(id: string): Observable<string> {
    return this.http.get(`${this.api}/analysis/${id}/csv`, { responseType: 'text' });
  }
}

