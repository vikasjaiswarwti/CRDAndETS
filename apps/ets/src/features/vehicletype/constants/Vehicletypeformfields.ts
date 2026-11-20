import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

interface VehicleTypeFormOptions {
  locationOptions?: { label: string; value: string | number }[];
}

export const getVehicleTypesFormFields = ({
  locationOptions = [],
}: VehicleTypeFormOptions = {}): FormFieldDef[] => [
    {
      name: "locCode",
      label: "Office",
      type: "select",
      options: locationOptions,
      placeholder: "Select location",
      span: 24,
      rules: [
        { required: true, message: "Office is required" },
      ],
    },
    {
      name: "vehicleTypeDesc",
      label: "Vehicle Type Description",
      type: "text",
      placeholder: "Enter vehicle type description",
      rules: [
        { required: true, message: "Vehicle type description is required" },
        {
          pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
          message:
            "No special characters allowed (letters, digits, spaces, . - ' only)",
        },
      ],
      span: 12,
    },

    {
      name: "capacity",
      label: "Capacity",
      type: "number",
      placeholder: "Enter seating capacity",
      span: 12,
      rules: [
        {
          required: true,
          message: "Capacity is required",
        },
        {
          validator: (_: any, value: string) => {
            if (value === undefined || value === null || value === "") {
              return Promise.resolve();
            }
            const capacity = Number(value);
            if (isNaN(capacity)) {
              return Promise.reject(
                new Error("Capacity must be a number")
              );
            }
            if (capacity <= 1) {
              return Promise.reject(
                new Error("Capacity must be greater than 1")
              );
            }
            if (capacity >= 50) {
              return Promise.reject(
                new Error("Capacity must be less than 50")
              );
            }
            return Promise.resolve();
          },
        },
      ],
    },
    {
      name: "isActive",
      label: "Active",
      type: "switch",
      span: 12,
      fieldProps: {
        checkedChildren: "Active",
        unCheckedChildren: "Inactive",
      },
      hidden:({vehicleType_Id})=> !!vehicleType_Id,
    },
  ];
