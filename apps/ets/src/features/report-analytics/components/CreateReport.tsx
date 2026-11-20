import { useState, useMemo, type ReactNode } from "react";
import { Server, ShieldCheck, ListChecks, ChevronDown } from "lucide-react";
import { C } from "../pages/ReportPage";
import { Select, Button, message } from "antd";
import { useLookups } from "../../lookups";
import { useCreateReportConfigMutation } from "../services/ReportApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// ---------------- types ----------------
type HttpMethod = "GET" | "POST";
type FieldType = "int" | "string" | "date" | "bool" | "decimal" | "guid";

/** What actually goes into the payload. */
interface SchemaField {
  name: string;
  type: FieldType;
  required: boolean;
}

interface ReportPayload {
  name: string;
  displayName: string;
  category: string;
  link: string;
  httpMethod: HttpMethod;
  requestSchema: { fields: SchemaField[] };
  isActive: boolean;
  roleIds: string[];
}

const HTTP_METHODS: HttpMethod[] = ["GET", "POST"];

// starter rows mirroring the request schema you shared
const AVAILABLE_FIELDS: SchemaField[] = [
  { name: "locCode", type: "int", required: true },
  { name: "fromDate", type: "date", required: true },
  { name: "toDate", type: "date", required: true },
  { name: "tripType", type: "int", required: true },
  { name: "shiftId", type: "int", required: true },
  { name: "empId", type: "int", required: true },
];

export default function CreateReport() {
  const [name, setName] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [httpMethod, setHttpMethod] = useState<HttpMethod>("POST");
  const [isActive, _setIsActive] = useState<boolean>(true);
  const [payloadOpen, setPayloadOpen] = useState<boolean>(false);

  // whole field objects that have been checked
  const [selectedFields, setSelectedFields] = useState<SchemaField[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const { roleOptions } = useLookups();
  const [createReport, { isLoading: submitting, error: errorData, isError }] =
    useCreateReportConfigMutation();

  // ---- build the exact payload ----
  const payload: ReportPayload = useMemo(
    () => ({
      name,
      displayName,
      category,
      link,
      httpMethod,
      requestSchema: { fields: selectedFields },
      isActive,
      roleIds: selectedRoleIds,
    }),
    [
      name,
      displayName,
      category,
      link,
      httpMethod,
      selectedFields,
      isActive,
      selectedRoleIds,
    ],
  );

  // ---- validation ----
  const errors: string[] = [];
  if (!name.trim()) errors.push("Name is required");
  if (!displayName.trim()) errors.push("Display name is required");
  if (!link.trim()) errors.push("Link is required");
  // if (payload.requestSchema.fields.length === 0)
  //   errors.push("Include at least one field");
  if (selectedRoleIds.length === 0) errors.push("Assign at least one role");
  const canSubmit = errors.length === 0 && !submitting;

  async function submitReport(): Promise<void> {
    if (!canSubmit) return;
    try {
      await createReport(payload).unwrap();
      message.success("Report Added Successfully");
    } catch (err) {
      console.log(err, "err");
    }
  }
  const apiError = errorData as FetchBaseQueryError;
  // console.log(errorData, "errorData");
  const errorMessage =
    (apiError?.data as { title?: string })?.title ??
    (apiError?.data as { message?: string })?.message ??
    "";
  return (
    <div className=" bg-white text-slate-800 font-sans">
      <div
        className="mx-auto"
        style={{ padding: "1rem", background: C.pageBg }}
      >
        {/* header */}
        <header
          className="flex items-center gap-3"
          style={{ marginBottom: "2rem" }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-500 text-white">
            <Server size={20} />
          </div>
          <div>
            <h1
              className="text-xl tracking-tight text-slate-900"
              style={{ fontWeight: 600 }}
            >
              Register report endpoint
            </h1>
            <p className="text-sm text-slate-500">
              Define its metadata, request schema, and who can run it.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* ---------------- FORM ---------------- */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            {/* endpoint details */}
            <section
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
              style={{ padding: "1rem" }}
            >
              <SectionTitle>Endpoint details</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Name" hint="internal key, no spaces">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="RouteAnalysisReport"
                    className="input font-mono"
                  />
                </Field>
                <Field label="Display name">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Route Analysis"
                    className="input"
                  />
                </Field>
                <Field label="Category">
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Analytics"
                    className="input"
                  />
                </Field>
                <Field label="HTTP method">
                  <select
                    value={httpMethod}
                    onChange={(e) =>
                      setHttpMethod(e.target.value as HttpMethod)
                    }
                    className="input"
                  >
                    {HTTP_METHODS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Link" hint="API route">
                    <input
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="/api/v1/Report/RouteAnalysisReport"
                      className="input font-mono"
                    />
                  </Field>
                </div>
              </div>
            </section>
            {/* request schema fields — searchable multiselect, pushes whole object */}
            <section
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
              style={{ padding: "1rem" }}
            >
              <div className="mb-1 flex items-center justify-between">
                <SectionTitle icon={<ListChecks size={15} />}>
                  Request schema fields
                </SectionTitle>
                <span
                  className="rounded-full bg-slate-100 text-xs font-medium text-slate-500"
                  style={{ paddingInline: 10, paddingBlock: 6 }}
                >
                  {selectedFields.length} selected
                </span>
              </div>
              <p
                className="text-xs text-slate-500"
                style={{ marginBottom: "0.75rem" }}
              >
                Pick the fields this report accepts. In case of date - Select fromDate and toDate both,  
              </p>
              <FieldMultiSelect
                options={AVAILABLE_FIELDS}
                selected={selectedFields}
                onChange={setSelectedFields}
              />
            </section>
            {/* roles */}
            <section
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
              style={{ padding: "1rem" }}
            >
              <div className="mb-1 flex items-center justify-between">
                <SectionTitle icon={<ShieldCheck size={15} />}>
                  Access roles
                </SectionTitle>
                <span
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
                  style={{ paddingInline: 10, paddingBlock: 6 }}
                >
                  {selectedRoleIds.length} selected
                </span>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                Roles allowed to run this report.
              </p>

              <Select
                mode="multiple"
                allowClear
                showSearch
                placeholder="Select roles…"
                value={selectedRoleIds}
                onChange={setSelectedRoleIds}
                filterOption={(input, opt) =>
                  (opt?.label as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={roleOptions}
                style={{
                  width: "100%",
                  background: "white",
                  borderRadius: "0.5rem",
                }}
              />
            </section>
          </div>

          {/* ---------------- PREVIEW / SUBMIT ---------------- */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-6">
              <div
                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm"
                style={{ padding: "14px" }}
              >
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
                  <button
                    className="flex items-center gap-1.5 text-white w-full hover:text-slate-200 cursor-pointer"
                    aria-expanded={payloadOpen}
                    onClick={() => setPayloadOpen((o) => !o)}
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${payloadOpen ? "" : "-rotate-90"} text-white`}
                    />
                    <span className="font-mono text-xs uppercase tracking-wider text-white">
                      payload
                    </span>
                  </button>
                </div>
                {payloadOpen && (
                  <pre
                    className="max-h-105 overflow-auto font-mono leading-relaxed text-cyan-100"
                    style={{ padding: "0.75rem", fontSize: "14px" }}
                  >
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                )}
              </div>

              {errors.length > 0 && (
                <ul
                  style={{ padding: 12 }}
                  className="rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-700"
                >
                  {errors.map((e) => (
                    <li key={e} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-amber-500" /> {e}
                    </li>
                  ))}
                </ul>
              )}
              {isError && errorMessage && (
                <div
                  className="mt-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-600"
                  style={{ padding: 5 }}
                >
                  {errorMessage}
                </div>
              )}

              <Button
                type="primary"
                onClick={submitReport}
                disabled={!canSubmit}
                style={{
                  width: "100%",
                  border: "1px solid",
                  color: "white",
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? "Creating…" : "Create report"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(203 213 225);
          background: white;
          padding: 0.5rem 0.7rem;
          font-size: 0.875rem;
          color: rgb(30 41 59);
          outline: none;
        }
      `}</style>
    </div>
  );
}

// ---------------- subcomponents ----------------
function SectionTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <h2
      style={{ marginBottom: "0.75rem" }}
      className="flex items-center gap-1.5 text-sm font-semibold text-slate-900"
    >
      {icon} {children}
    </h2>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span
        className=" flex items-baseline gap-2"
        style={{ marginBottom: "0.25rem" }}
      >
        <span className="text-xs font-medium text-slate-600">{label}</span>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Searchable multiselect built on AntD. Hands the full array of field objects back via onChange. */
function FieldMultiSelect({
  options,
  selected,
  onChange,
}: {
  options: SchemaField[];
  selected: SchemaField[];
  onChange: (fields: SchemaField[]) => void;
}) {
  const byName = useMemo(
    () => new Map(options.map((o) => [o.name, o])),
    [options],
  );

  return (
    <Select
      mode="multiple"
      allowClear
      showSearch
      placeholder="Select fields…"
      value={selected.map((s) => s.name)}
      onChange={(names: string[]) => onChange(names.map((n) => byName.get(n)!))}
      filterOption={(input, opt) =>
        (opt?.value as string).toLowerCase().includes(input.toLowerCase())
      }
      options={options.map((o) => ({ value: o.name, label: o.name }))}
      optionRender={(opt) => {
        const f = byName.get(opt.value as string)!;
        return (
          <div className="flex flex-col">
            <span className="font-mono text-sm text-slate-800">{f.name}</span>
          </div>
        );
      }}
      style={{ width: "100%", background: "white", borderRadius: "0.5rem" }}
    />
  );
}
