import { useNavigate } from "react-router-dom";
import { useUILibrary } from "@commutr/ui/ui-lib";
import { ROUTES } from "../../../shared/constants/app.constants";
import { useCreateBookingMutation } from "../services/bookingsApi";
import type { NewBooking, VehicleClass } from "../types";

const VEHICLES: VehicleClass[] = ["Hatchback", "Sedan", "SUV", "Tempo Traveller"];

export default function CreateBookingPage() {
  const { Form, FormItem, Input, Select, DatePicker, Button, Card, message } =
    useUILibrary();
  const navigate = useNavigate();
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const [form] = (Form.useForm as () => [unknown])();

  const onFinish = async (v: {
    pickup: string;
    drop: string;
    date: { format: (f: string) => string };
    vehicleClass: VehicleClass;
    passengers: number;
    notes?: string;
  }) => {
    const payload: NewBooking = {
      pickup: v.pickup,
      drop: v.drop,
      date: v.date.format("YYYY-MM-DD"),
      vehicleClass: v.vehicleClass,
      passengers: Number(v.passengers),
      notes: v.notes,
    };
    const created = await createBooking(payload).unwrap();
    message.success(`Booking ${created.id} created`);
    navigate(ROUTES.BOOKINGS);
  };

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <Card title="Create Booking">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <FormItem name="pickup" label="Pickup location" rules={[{ required: true }]}>
            <Input placeholder="e.g. Gurugram Sector 44" />
          </FormItem>
          <FormItem name="drop" label="Drop location" rules={[{ required: true }]}>
            <Input placeholder="e.g. IGI Airport T3" />
          </FormItem>
          <FormItem name="date" label="Travel date" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </FormItem>
          <FormItem name="vehicleClass" label="Vehicle class" rules={[{ required: true }]}>
            <Select
              placeholder="Select a vehicle"
              options={VEHICLES.map((v) => ({ label: v, value: v }))}
            />
          </FormItem>
          <FormItem name="passengers" label="Passengers" rules={[{ required: true }]}>
            <Input type="number" />
          </FormItem>
          <FormItem name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </FormItem>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Create booking
          </Button>
        </Form>
      </Card>
    </div>
  );
}
