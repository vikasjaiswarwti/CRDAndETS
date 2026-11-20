import * as XLSX from "xlsx";

type ExcelDownloadOptions<T> = {
    data: T[];                 // array of objects
    fileName?: string;         // file name
    sheetName?: string;        // sheet name
};

export function downloadExcel<T extends object>({
    data,
    fileName = "Template.xlsx",
    sheetName = "Sheet1",
}: ExcelDownloadOptions<T>) {
    if (!data || data.length === 0) {
        console.warn("No data provided for Excel download");
        return;
    }

    // Convert JSON → worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    // Save file
    const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    // Trigger download (native browser way)
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}