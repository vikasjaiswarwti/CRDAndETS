import { Form, Select, Button, Input, AutoComplete } from "antd";
import { useLookups } from "../../lookups";
import PageContainer from "../../../shared/components/PageContainer/PageContainer";
import { useTransEhsMutations } from "../hooks/useTransEhsMutations";

const EhsTableRow = ({
  index,
  label,
  value,
  onChange,
}: {
  index: number;
  label: string;
  value: "Y" | "N" | null;
  onChange: (val: "Y" | "N") => void;
}) => {
  const sn = String(index + 1).padStart(2, "0");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "48px 1fr 1fr",
        padding: "10px 32px",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <span style={{ color: "#aaa", fontSize: 13 }}>{sn}</span>
      <span style={{ fontSize: 12 }}>{label}</span>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        <Button
          size="small"
          shape="round"
          // type={value === "Y" ? "primary" : "default"}
          className="text-[10px]"
          style={
            value === "Y"
              ? {
                  paddingInline: "20px",
                  border: "1px solid #005C3D",
                  color: "#fff",
                  background: "#005C3D",
                  fontSize: "10px",
                  fontWeight: 600,
                }
              : {
                  paddingInline: "20px",
                  background: "#fff",
                  color: "#005C3D",
                  border: "1px solid #005C3D",
                  fontSize: "10px",
                  fontWeight: 600,
                }
          }
          onClick={() => onChange("Y")}
        >
          YES
        </Button>
        <Button
          size="small"
          shape="round"
          danger={value === "N"}
          className="text-[10px]"
          // type={value === "N" ? "primary" : "default"}
          style={
            value !== "N"
              ? {
                  paddingInline: "20px",
                  border: "1px solid #E24B4A",
                  color: "#E24B4A",
                  background: "#fff",
                  fontSize: "10px",
                  fontWeight: 600,
                }
              : {
                  paddingInline: "20px",
                  background: "#FF4540",
                  color: "#FFF",
                  border: "1px solid #FF4540",
                  fontSize: "10px",
                  fontWeight: 600,
                }
          }
          onClick={() => onChange("N")}
        >
          NO
        </Button>
      </div>
    </div>
  );
};
const fieldStyle = {
  height: 36,
  borderRadius: 6,
  border: "1px solid #D9D9D9",
};
import { useGetAllVehiclesQuery } from "../../lookups/services/lookupsApi";
const TransEhsPage = () => {
  const [form] = Form.useForm();
  const { locationOptions, EhsChecksQueryOptions } = useLookups({
    only: ["locationOptions", "EhsChecksQueryOptions"],
  });
  const checks = Form.useWatch("ehsChecks", form) || {};
  const { createEhsCheck, isCreating } = useTransEhsMutations();
  const vehicleRegNo = Form.useWatch("vehicleRegNo", form);
  const { data: vehicleList } = useGetAllVehiclesQuery(
    {
      searchTerm: vehicleRegNo,
      page: 1,
      pageSize: 1000,
    },
    {
      skip: !vehicleRegNo || vehicleRegNo.length < 2,
    },
  );
  const handleToggle = (ehs_Id: number | string, val: "Y" | "N") => {
    const current = form.getFieldValue("ehsChecks") || {};
    form.setFieldsValue({ ehsChecks: { ...current, [ehs_Id]: val } });
  };

  const handleSubmit = async (values: any) => {
    const ehsChecks = EhsChecksQueryOptions.map((opt: any) => ({
      ehs_Id: opt.value,
      status: values.ehsChecks?.[opt.value] ?? "N",
    }));
    // console.log("Payload 👉", { ...values, ehsChecks });
    const payload = {
      locCode: values.locCode,
      // transporterId: values.transporterId,
      vehicleId: values.vehicleId,
      ehsChecks: ehsChecks,
    };
    const res = await createEhsCheck(payload);
    console.log(res, "response");
    // reset after success
    if (res) {
      form.resetFields();
    }
  };

  return (
    <PageContainer title="EHS Checks">
      <div>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Top filters */}
          <div
            className="grid grid-cols-3 gap-2"
            style={{ paddingInline: 32, marginBottom: 16 }}
          >
            <Form.Item
              label="Office Location"
              name="locCode"
              rules={[
                { required: true, message: "Select Location" },
                // {
                //   validator: async (_, value) => {
                //     if (!value) {
                //       return Promise.reject("Vehicle not found");
                //     }

                //     return Promise.resolve();
                //   },
                // },
              ]}
            >
              <Select
                placeholder="Select Location"
                options={locationOptions}
                style={fieldStyle}
              />
            </Form.Item>
            {/* <Form.Item
              label="Enter Vehicle Registration"
              name="vehicleRegNo"
              rules={[
                { required: true, message: "Enter Vehicle Registration" },
                {
                  pattern: /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/,
                  message: "Invalid vehicle registration number",
                },
              ]}
            >
              <Input
                placeholder="Enter Vehicle Registration"
                style={fieldStyle}
                maxLength={15}
                onChange={(e) => {
                  form.setFieldsValue({
                    vehicleRegNo: e.target.value.toUpperCase(),
                  });
                }}
                onKeyPress={(e) => {
                  if (!/[a-zA-Z0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item> */}
            <Form.Item
              label="Enter Vehicle Reg."
              name="vehicleRegNo"
              rules={[
                { required: true, message: "Enter Vehicle Registration" },
              ]}
            >
              <AutoComplete
                options={
                  vehicleRegNo?.trim()
                    ? vehicleList?.items?.map((item: any) => ({
                        value: item.vehicle_Registration_No,
                        label: item.vehicle_Registration_No,
                        vehicleId: item.vehicleId,
                        transporterId: item.transporterId,
                        transporterName: item.transporterName,
                      }))
                    : []
                }
                onSelect={(_, option: any) => {
                  form.setFieldsValue({
                    vehicleRegNo: option.value,
                    vehicleId: option.vehicleId,
                    transporterId: option.transporterId,
                    transporterName: option.transporterName,
                  });
                }}
                onSearch={(value) => {
                  form.setFieldsValue({
                    vehicleRegNo: value.toUpperCase(),
                  });
                }}
                notFoundContent={vehicleRegNo?.trim() ? "No Data Found" : null}
              >
                <Input
                  placeholder="Enter Vehicle Registration"
                  style={fieldStyle}
                  maxLength={15}
                  onKeyPress={(e) => {
                    if (!/[a-zA-Z0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </AutoComplete>
            </Form.Item>
            <Form.Item label="Vendor Name" name="transporterName">
              <Input disabled style={fieldStyle} />
            </Form.Item>

            {/* <Form.Item name="transporterId" hidden>
              <Input />
            </Form.Item> */}
            <Form.Item name="vehicleId" hidden>
              <Input />
            </Form.Item>
          </div>

          {/* EHS Table */}
          <Form.Item name="ehsChecks">
            <div
              style={{
                border: "1px solid #f0f0f0",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 180px",
                  padding: "10px 32px",
                  borderBottom: "1px solid #f0f0f0",
                  background: "#fafafa",
                }}
              >
                <span
                  style={{ fontSize: 12, color: "#1D9E75", fontWeight: 500 }}
                >
                  SN.
                </span>
                <span
                  style={{ fontSize: 12, color: "#1D9E75", fontWeight: 500 }}
                >
                  Employee, Health & Security (
                  <span
                    style={{
                      background: "yellow",
                      color: "#633806",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "1px 3px",
                      borderRadius: 4,
                    }}
                  >
                    EHS
                  </span>
                  ) Item
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#888",
                    fontWeight: 500,
                    textAlign: "right",
                  }}
                >
                  Compliance Status
                </span>
              </div>

              {/* Rows — driven by EhsChecksQueryOptions */}
              {EhsChecksQueryOptions.map((opt: any, i: number) => (
                <EhsTableRow
                  key={opt.value}
                  index={i}
                  label={opt.label}
                  value={checks[opt.value] ?? null}
                  onChange={(val) => handleToggle(opt.value, val)}
                />
              ))}
            </div>
          </Form.Item>

          {/* <div
            className="flex items-center gap-5"
            style={{ marginBottom: 12, padding: "0px 32px" }}
          >
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Submit
              </Button>
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="reset">
                Reset
              </Button>
            </Form.Item>
          </div> */}
          <div
            className="flex justify-end gap-4 mt-4"
            style={{ marginBlock: 12, padding: "0px 32px" }}
          >
            <Form.Item>
              <Button
                htmlType="submit"
                loading={isCreating}
                style={{
                  background: "#006B43",
                  border: "none",
                  color: "#fff",
                  height: 40,
                  padding: "0 32px",
                  borderRadius: 24,
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
                }}
              >
                Submit
              </Button>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                htmlType="button"
                onClick={() => form.resetFields()}
                style={{
                  background: "#F1F2F4",
                  border: "none",
                  color: "#006B43",
                  height: 40,
                  padding: "0 26px",
                  borderRadius: 24,
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                Reset
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </PageContainer>
  );
};

export default TransEhsPage;
