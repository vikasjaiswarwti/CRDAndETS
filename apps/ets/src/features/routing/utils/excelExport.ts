import * as XLSX from "xlsx";

// Column header maps — raw key → display label
const USER_DUMP_COLS: Record<string, string> = {
  office: "Office",
  commutrID: "CommutrID",
  employeeID: "Employee ID",
  name: "Name",
  gender: "Gender",
  emailID: "Email",
  mobileno: "Mobile",
  address: "Address",
  userLAT: "Latitude",
  userLNG: "Longitude",
};

const APP_REG_COLS: Record<string, string> = {
  office: "Office",
  employeeID: "Employee ID",
  userName: "Name",
  gender: "Gender",
  department: "Department",
  projectName: "Project",
  lobName: "LOB",
  mobileNumber: "Mobile",
  userType: "User Type",
  status: "Status",
};

const TRIP_CANCEL_COLS: Record<string, string> = {
  office: "Office",
  tripDate: "Trip Date",
  tripId: "Trip ID",
  commutrID: "CommutrID",
  requestedBy: "Requested By",
  requestFor: "Request For",
  shift: "Shift",
  tripType: "Trip Type",
  requestSource: "Source",
  actionDate: "Action Date",
};

function remapKeys(
  data: Record<string, unknown>[],
  colMap: Record<string, string>,
): Record<string, unknown>[] {
  return data.map((row) => {
    const mapped: Record<string, unknown> = {};
    Object.keys(colMap).forEach((key) => {
      mapped[colMap[key]] = row[key] ?? "";
    });
    return mapped;
  });
}

export function downloadExcel(
  data: Record<string, unknown>[],
  colMap: Record<string, string>,
  filename: string,
): void {
  const remapped = remapKeys(data, colMap);
  const ws = XLSX.utils.json_to_sheet(remapped);

  // Auto column widths
  const colWidths = Object.values(colMap).map((header) => ({
    wch: Math.max(header.length + 2, 14),
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export { USER_DUMP_COLS, APP_REG_COLS, TRIP_CANCEL_COLS };
