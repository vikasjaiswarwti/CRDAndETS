// rosterTAT.columns.ts
// Maps form field key → API ColumnName for AppControlUpdateByKey endpoint.
// Rule: PascalCase (first letter uppercase). Exceptions listed below.

const EXCEPTIONS: Record<string, string> = {
  ors_Lock_days: "ORS_Lock_days",
};

export function toColumnName(formKey: string): string {
  return (
    EXCEPTIONS[formKey] ?? formKey.charAt(0).toUpperCase() + formKey.slice(1)
  );
}
