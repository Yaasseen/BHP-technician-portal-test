import * as XLSX from "xlsx";

/**
 * Builds an .xlsx file from an array of { header, key } column definitions
 * and an array of row objects, then triggers a browser download.
 */
export function exportToExcel(filename, columns, rows) {
    const worksheetData = rows.map((row) => {
        const mapped = {};
        columns.forEach(({ header, key }) => {
            mapped[header] = row[key] ?? "";
        });
        return mapped;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
        header: columns.map((c) => c.header),
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Export");

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `${filename}-${timestamp}.xlsx`);
}
