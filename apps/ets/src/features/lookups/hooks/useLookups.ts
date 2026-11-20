import {
  useGetAllCityZonesQuery,
  useGetAllLocationsForMappingQuery,
  useGetAllLocationsQuery,
  useGetAllBillPlanTypesQuery,
  useGetAllRolesQuery,
  useGetAllMenusQuery,
  useGetAllDocumentOwnerTypesQuery,
  useGetAllEscortVendorsQuery,
  useGetAllDepartmentsQuery,
  useGetAllProjectsQuery,
  useGetAllLOBsQuery,
  useGetAllDocumentTypesQuery,
  useGetAllCurrentStatusesQuery,
  useGetAllStatesQuery,
  useGetAllVendorsQuery,
  useGetAllVehicleStatusQuery,
  useGetAllIntervalsQuery,
  // ----------
  useGetAllFuelTypesQuery,
  useGetAllDriversQuery,
  useGetAllVehicleTypesQuery,
  // ======
  useGetAllEhsChecksQuery,
  useGetAllVehiclesQuery,
  useGetAllSpecialCaseQuery,
  useGetAllUsersQuery,
} from "../services/lookupsApi";

export const useLookups = (filters?: {
  locCode?: number;
  searchTerm?: string;
  only?: string[]; // ← NEW
}) => {
  const only = filters?.only;
  // if `only` is defined, skip anything NOT in the list
  const s = (key: string) => only != null && !only.includes(key);

  //   const { vendorOptions, currentStatusOptions } = useLookups(
  //  {
  //   only: ['vendorOptions', 'currentStatusOptions'],
  // });

  const cityZonesQuery = useGetAllCityZonesQuery(
    {
      page: 1,
      pageSize: 100, // fetch enough for dropdown
    },
    { skip: s("cityZoneOptions") },
  );

  const locationsQueryOptionsForMapping = useGetAllLocationsForMappingQuery(
    {
      page: 1,
      pageSize: 100,
    },
    { skip: s("locationOptionsFormapping") },
  );

  const locationsQuery = useGetAllLocationsQuery(undefined, {
    skip: s("locationOptions"),
  });

  // console.log("locationsQuery from UseLookup", locationsQuery);

  const billPlanTypesQuery = useGetAllBillPlanTypesQuery(
    {
      page: 1,
      pageSize: 100,
    },
    { skip: s("billPlanTypeOptions") },
  );

  const documentOwnerTypesQuery = useGetAllDocumentOwnerTypesQuery(
    {
      page: 1,
      pageSize: 1000,
    },
    { skip: s("documentOwnerTypeOptions") },
  );

  const rolesQuery = useGetAllRolesQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("roleOptions") },
  );

  const menusQuery = useGetAllMenusQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("menuOptions") },
  );

  const escortVendorsQuery = useGetAllEscortVendorsQuery(
    {
      page: 1,
      pageSize: 1000,
    },
    { skip: s("escortVendorOptions") },
  );

  const departmentsQuery = useGetAllDepartmentsQuery(
    {
      page: 1,
      pageSize: 1000,
    },
    { skip: s("departmentOptions") },
  );

  const projectsQuery = useGetAllProjectsQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("projectOptions") },
  );

  const lobQuery = useGetAllLOBsQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("lobOptions") },
  );

  const cityZoneOptions = (cityZonesQuery.data?.items || []).map(
    (zone: any) => ({
      label: zone.cityZoneCode,
      value: zone.cityZoneCode, // or zone.id if needed
    }),
  );

  // const usersQuery = useGetAllUsersQuery({
  //   locCode: 183,
  //   page: 1,
  //   pageSize: 1000,
  // });

  const usersQuery = useGetAllUsersQuery(
    {
      locCode: filters?.locCode,
      searchTerm: filters?.searchTerm ?? "", // ← ADD
      page: 1,
      pageSize: 1000,
    },
    { skip: s("userOptions") },
  );

  const locationOptionsForMapping = (
    locationsQueryOptionsForMapping.data?.items || []
  )
    .filter((item) => item.active == true)
    .map((loc: any) => ({
      label: loc.locName,
      value: loc.id || loc.locCode,
    }));

  const locationOptions = (locationsQuery.data ?? []).map((loc: any) => ({
    label: loc.locName,
    value: loc.id ?? loc.locCode,
  }));

  const billPlanTypeOptions = (billPlanTypesQuery.data?.items || []).map(
    (type: any) => ({
      label: type.bptName || type.name || "",
      value: type.bptCode || type.id || "", // Important: value should be bptCode
    }),
  );

  const roleOptions = (rolesQuery.data?.items || []).map((r: any) => ({
    label: r.roleName || r.name || "",
    value: r.id || "",
  }));

  const menuOptions = (menusQuery.data?.items || []).map((m: any) => ({
    label: m.menuName || m.name || "",
    value: m.id || "",
  }));

  const documentOwnerTypeOptions = (
    documentOwnerTypesQuery.data?.items || []
  ).map((item: any) => ({
    label: item.docOwnerTypeName || "",
    value: item.docOwnerTypeId || item.id || "",
  }));

  const escortVendorOptions = (escortVendorsQuery.data?.items || []).map(
    (vendor: any) => ({
      label: vendor.vendorName || vendor.name || "",
      value: vendor.escortVendorId || vendor.id || "",
    }),
  );
  // {
  //   "mstEscortVendor_Id": "085e6180-cd51-4761-b1cf-2618af155ed9",
  //   "escortVendorId": 1,
  //   "vendorName": "Rahul",
  // }

  // 2. Map the options
  const departmentOptions = (departmentsQuery.data?.items || []).map(
    (d: any) => ({
      label: d.depName || "",
      value: d.depCode || "",
    }),
  );

  const projectOptions = (projectsQuery.data?.items || []).map((p: any) => ({
    label: p.proname || "",
    value: p.procode || "",
  }));

  const lobOptions = (lobQuery.data?.items || []).map((l: any) => ({
    label: l.lobName || l.name || "",
    value: l.id || l.lobCode || "",
  }));

  const intervalsQuery = useGetAllIntervalsQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("intervalOptions") },
  );
  // const intervalOptions = (intervalsQuery.data?.items || []).map((l: any) => ({
  //   label: l.intervalText || "",
  //   value: l.intervalMinute || "",
  // }));

  const intervalOptions = Array.from(
    new Map(
      (intervalsQuery.data?.items ?? []).map((l: any) => [l.intervalMinute, l]),
    ).values(),
  ).map((l: any) => ({
    label: l.intervalText || `${l.intervalMinute} minutes`,
    value: l.intervalMinute,
  }));

  const documentTypesQuery = useGetAllDocumentTypesQuery(
    {
      page: 1,
      pageSize: 1000,
    },
    { skip: s("documentTypesOptions") },
  );
  const documentTypesOptions = (documentTypesQuery.data?.items || []).map(
    (l: any) => ({
      label: l.docTypeName || "",
      value: l.docTypeId || "",
    }),
  );
  //   {
  //     "docTypeId": 1,
  //     "docType_Id": "ef286aac-e1e7-4230-adc6-64cfcf099b2c",
  //     "docOwnerTypeId": 1,
  //     "docTypeName": "Vehicle Registration",
  // }
  const currentStatusesQuery = useGetAllCurrentStatusesQuery(
    {
      page: 1,
      pageSize: 1000,
    },
    { skip: s("currentStatusOptions") },
  );
  const currentStatusOptions = (currentStatusesQuery.data?.items || []).map(
    (l: any) => ({
      label: l.statusName || "",
      value: l.id || "",
    }),
  );
  const statesQuery = useGetAllStatesQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("statesOptions") },
  );
  const statesOptions = (statesQuery.data?.items || []).map((l: any) => ({
    label: l.stateName || "",
    value: l.stateCode || "",
  }));
  //   {
  //     "id": "f368a180-5e13-457e-87ca-0a8a3049eb07",
  //     "stateCode": 2,
  //     "stateName": "Bangalore",
  // }
  const vendorsQuery = useGetAllVendorsQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("vendorOptions") },
  );

  // console.log("vendorsQuery from lookup", vendorsQuery);
  const vendorOptions = (vendorsQuery.data?.items || []).map((l: any) => ({
    label: l.vendorName || "",
    value: l.transporterId || "",
    locCode: l.locCode || 1,
  }));
  //   {
  //     "mstVendor_Id": "77ae8c90-890f-4037-ab90-3cea3cde02de",
  //     "transporterId": 1,
  //     "vendorName": "Vikas Jaiswar",
  // }
  const vehicleStatusQuery = useGetAllVehicleStatusQuery(
    {
      page: 1,
      pageSize: 1000,
    },
    { skip: s("vehicleStatusOptions") },
  );
  const vehicleStatusOptions = (vehicleStatusQuery.data?.items || []).map(
    (l: any) => ({
      label: l.vehicleStatusName || "",
      value: l.vehicleStatusId || "",
    }),
  );

  // useGetAllFuelTypesQuery,
  // useGetAllDriversQuery,
  // useGetAllVehicleTypesQuery,
  const fuelTypeQuery = useGetAllFuelTypesQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("fuelTypeOptions") },
  );
  const fuelTypeOptions = (fuelTypeQuery.data?.items || []).map((l: any) => ({
    label: l.fuelTypeDesc || "",
    value: l.fuelTypeCode || "",
  }));

  const driverQuery = useGetAllDriversQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("driverOptions") },
  );
  const driverOptions = (driverQuery.data?.items || []).map((l: any) => ({
    label: l.driverName + "-" + l.mobileNo || "",
    value: l.driverId || "",
  }));
  const vehicleTypeQuery = useGetAllVehicleTypesQuery(
    {
      page: 1,
      pageSize: 1000,
    },
    { skip: s("vehicleTypeOptions") },
  );
  const vehicleTypeOptions = (vehicleTypeQuery.data?.items || []).map(
    (l: any) => ({
      label: l.vehicleTypeDesc || "",
      value: l.vehicleTypeCode || "",
    }),
  );
  const EhsChecksQuery = useGetAllEhsChecksQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("EhsChecksQueryOptions") },
  );
  const EhsChecksQueryOptions = (EhsChecksQuery.data?.items || []).map(
    (l: any) => ({
      label: l.ehsType,
      value: l.id,
    }),
  );

  const allVehicleQuery = useGetAllVehiclesQuery(
    { page: 1, pageSize: 1000 },
    { skip: s("allVehicleOptions") },
  );
  const allVehicleOptions = (allVehicleQuery.data?.items || []).map(
    (l: any) => ({
      label: `${l.vehicle_Registration_No} (${l.vehicleTypeName})`,
      value: l.vehicleId,
    }),
  );
  const allSpecialCaseQuery = useGetAllSpecialCaseQuery(
    {
      page: 1,
      pageSize: 1000,
    },
    { skip: s("allSpecialCaseOptions") },
  );
  const allSpecialCaseOptions = (allSpecialCaseQuery.data?.items || []).map(
    (l: any) => ({
      label: l.specialCaseDesc,
      value: l.specialCaseId,
    }),
  );
  // {
  //     "specialCaseId": 2,
  //     "specialCaseDesc": "Fever",
  // }

  // const userOptions = (usersQuery.data?.items || []).map((u: any) => ({
  //   label: [u.firstName, u.emailId, u.mobileNo].filter(Boolean).join("-"),

  //   value: u.empId,
  // }));

  const userOptions = (usersQuery.data?.items || []).map((u: any) => ({
    label: `${u.firstName}${u.lastName ? " " + u.lastName : ""} - ${u.employeeId || u.emailId || ""}`,
    value: u.empId,
  }));

  const approveUserOptions = (usersQuery.data?.items || []).map((u: any) => ({
    label: `${u.firstName} ${u.lastName}`,
    value: u.empId,
    employeeCode: u.employeeId,
    userId: u.user_Id,
  }));

  const isLoading =
    cityZonesQuery.isLoading ||
    locationsQueryOptionsForMapping.isLoading ||
    locationsQuery.isLoading ||
    billPlanTypesQuery.isLoading ||
    rolesQuery.isLoading ||
    menusQuery.isLoading ||
    documentOwnerTypesQuery.isLoading ||
    escortVendorsQuery.isLoading ||
    departmentsQuery.isLoading ||
    projectsQuery.isLoading ||
    lobQuery.isLoading ||
    documentTypesQuery.isLoading ||
    currentStatusesQuery.isLoading ||
    statesQuery.isLoading ||
    vendorsQuery.isLoading ||
    vehicleStatusQuery.isLoading ||
    allSpecialCaseQuery.isFetching ||
    intervalsQuery.isLoading ||
    usersQuery.isLoading;

  const error =
    cityZonesQuery.error ||
    locationsQueryOptionsForMapping.error ||
    locationsQuery.error ||
    billPlanTypesQuery.error ||
    rolesQuery.error ||
    menusQuery.error ||
    documentOwnerTypesQuery.error ||
    escortVendorsQuery.error ||
    departmentsQuery.error ||
    projectsQuery.error ||
    documentTypesQuery.error ||
    currentStatusesQuery.error ||
    statesQuery.error ||
    vendorsQuery.error ||
    vehicleStatusQuery.error ||
    lobQuery.error ||
    allSpecialCaseQuery.error ||
    intervalsQuery.error ||
    usersQuery.error;
  const refetchAll = () => {
    cityZonesQuery.refetch();
    locationsQueryOptionsForMapping.refetch();
    locationsQuery.refetch();
    billPlanTypesQuery.refetch();
    rolesQuery.refetch();
    menusQuery.refetch();
    documentOwnerTypesQuery.refetch();
    escortVendorsQuery.refetch();
    departmentsQuery.refetch();
    projectsQuery.refetch();
    lobQuery.refetch();
    documentTypesQuery.refetch();
    currentStatusesQuery.refetch();
    statesQuery.refetch();
    vendorsQuery.refetch();
    vehicleStatusQuery.refetch();
    intervalsQuery.refetch();
    fuelTypeQuery.refetch();
    driverQuery.refetch();
    vehicleTypeQuery.refetch();
    EhsChecksQuery.refetch();
    allVehicleQuery.refetch();
    allSpecialCaseQuery.refetch();
    usersQuery.refetch();
  };
  return {
    cityZoneOptions,
    locationOptionsForMapping,
    locationOptions,
    billPlanTypeOptions,
    roleOptions,
    menuOptions,
    documentOwnerTypeOptions,
    escortVendorOptions,
    departmentOptions,
    projectOptions,
    lobOptions,
    documentTypesOptions,
    currentStatusOptions,
    statesOptions,
    vendorOptions,
    vehicleStatusOptions,
    intervalOptions,
    fuelTypeOptions,
    driverOptions,
    vehicleTypeOptions,
    EhsChecksQueryOptions,
    allVehicleOptions,
    allSpecialCaseOptions,
    userOptions,
    approveUserOptions,

    isLoading,
    error,

    refetchIntervals: () => intervalsQuery.refetch(), // ← add
    refetchLocations: () => locationsQuery.refetch(),
    refetchAll,
  };
};
