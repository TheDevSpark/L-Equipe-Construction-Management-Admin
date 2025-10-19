// Utility to parse Excel files (client-side) using xlsx (sheetjs)
import * as XLSX from "xlsx";

/**
 * Parse an uploaded Excel File (File object) to JSON.
 * Returns an object where each sheet name maps to an array of row objects.
 */
export async function parseExcelFile(file) {
  if (!file) return null;
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const result = {};
  workbook.SheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
    result[name] = json;
  });
  return result;
}

/**
 * Convenience to convert first sheet only to JSON array (most use-cases)
 */
export async function parseExcelFileFirstSheet(file) {
  const sheets = await parseExcelFile(file);
  if (!sheets) return [];
  const firstKey = Object.keys(sheets)[0];
  return sheets[firstKey] || [];
}
