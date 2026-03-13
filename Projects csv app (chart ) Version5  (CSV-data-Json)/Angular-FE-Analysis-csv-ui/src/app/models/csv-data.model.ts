/**
 * CSV Data Model
 * Represents the parsed CSV data structure returned from BE
 */

export interface CsvTable {
  name: string;
  columns: string[];
  rows: any[][];
}

export interface CsvDataResponse {
  analysisId: string;
  tables: CsvTable[];
  meta?: {
    fileSize: number;
    createdAt: string;
  };
}

/**
 * Converts CsvTable (rows-based format)
 */
export function csvTableToObjects(table: CsvTable): any[] {
  console.log('Convert CsvTable to Objects :', table);
  return table.rows.map((row) => {
    const obj: any = {};
    table.columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

/**
 * Converts CsvTable array to format compatible with old dashboard format
 * { title, columns, data }
 */
export function csvTablesToDashboardFormat(tables: CsvTable[]) {
  console.log('Convert CsvTables to Dashboard Format :', tables);
  return tables.map((table) => ({
    title: table.name,
    columns: table.columns,
    data: csvTableToObjects(table),
  }));
}
