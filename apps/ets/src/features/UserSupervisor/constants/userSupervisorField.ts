import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const getUserSupervisorFormField: FormFieldDef[] = [
    {
        name: 'users',
        label: 'Upload User Supervisor Excel',
        type: 'upload',
        required: true,
        placeholder: 'e.g. forma',
    }
];

export const getExcelDownload = {
    fileName: "user_supervisor_Template.xlsx",
    sheetName: "usersupervisor",
    data: [
        {
            "employeeId": "1",
            "supEmployeeId": "2"
        }
    ],
}
