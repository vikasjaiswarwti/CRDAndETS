import type { TripTypeOption } from "../types/progressTrip.types";
const tripFilters = [
    {
        id: "A1B1C1D1-0000-0000-0000-000000000000",
        filterKey: "All",
        displayName: "All",
        filterType: "STATUS",
        statusCodeCsv: "1",
        sortOrder: 10,
        isActive: true,
    },
    {
        id: "A1B1C1D1-0000-0000-0000-000000000001",
        filterKey: "ROUTE_CREATED",
        displayName: "Route Created",
        filterType: "STATUS",
        statusCodeCsv: "1",
        sortOrder: 10,
        isActive: true,
    },
    {
        id: "A1B1C1D1-0000-0000-0000-000000000002",
        filterKey: "PUBLISHED_NOT_YET_STARTED",
        displayName: "Published Not Yet Started",
        filterType: "STATUS",
        statusCodeCsv: "2",
        sortOrder: 20,
        isActive: true,
    },
    {
        id: "A1B1C1D1-0000-0000-0000-000000000003",
        filterKey: "STARTED",
        displayName: "Started",
        filterType: "STATUS",
        statusCodeCsv: "3",
        sortOrder: 30,
        isActive: true,
    },
    {
        id: "A1B1C1D1-0000-0000-0000-000000000004",
        filterKey: "COMPLETED",
        displayName: "Completed",
        filterType: "STATUS",
        statusCodeCsv: "4,5,6",
        sortOrder: 40,
        isActive: true,
    },
    {
        id: "A1B1C1D1-0000-0000-0000-000000000005",
        filterKey: "CANCELLED",
        displayName: "Cancelled",
        filterType: "STATUS",
        statusCodeCsv: "7,9",
        sortOrder: 50,
        isActive: true,
    },
    {
        id: "A1B1C1D1-0000-0000-0000-000000000006",
        filterKey: "VEHICLE_UNASSIGNED",
        displayName: "Vehicle Unassigned",
        filterType: "VEHICLE_NULL",
        statusCodeCsv: null,
        sortOrder: 60,
        isActive: true,
    },
    {
        id: "A1B1C1D1-0000-0000-0000-000000000007",
        filterKey: "VENDOR_UNASSIGNED",
        displayName: "Vendor Unassigned",
        filterType: "VENDOR_NULL",
        statusCodeCsv: null,
        sortOrder: 70,
        isActive: true,
    },
];
export const tripFilterOption = tripFilters.map(item => {
    return { label: item.displayName, value: item.id }
})

const startedFilter = tripFilters.find((f) => f.filterKey === "STARTED");
if (!startedFilter) {
    throw new Error('TripOption: "STARTED" filter is missing from tripFilters.');
}

const allFilter = tripFilters.find((f) => f.filterKey === "All");
if (!allFilter) {
    throw new Error('TripOption: "All" filter is missing from tripFilters.');
}
const publishedNotYetStartedFilter = tripFilters.find((f) => f.filterKey === "PUBLISHED_NOT_YET_STARTED");
if (!publishedNotYetStartedFilter) {
    throw new Error('TripOption: "PUBLISHED_NOT_YET_STARTED" filter is missing from tripFilters.');
}
export const ALL_TRIP_FILTER_ID = allFilter.id;
export const STARTED_TRIP_FILTER_ID = startedFilter.id;
export const PUBLISHED_NOT_YET_STARTED_FILTER_ID = publishedNotYetStartedFilter.id;

export const LIVE_MERGE_FILTER_IDS: ReadonlySet<string> = new Set([
    ALL_TRIP_FILTER_ID,
    STARTED_TRIP_FILTER_ID,
    PUBLISHED_NOT_YET_STARTED_FILTER_ID,
]);

export const tripTypeOption: TripTypeOption[] = [
    {
        label: "Both",
        value: 0
    },
    {
        label: "Login",
        value: 1
    },
    {
        label: "Logout",
        value: 2
    }
]
export const TOTAL_MINUTES = 24 * 60;
export const ManIcons = () => { return `<svg width="5" height = "10" viewBox = "0 0 5 12" fill = "none" xmlns = "http://www.w3.org/2000/svg" > <path d="M1.61458 2.13333C1.37153 1.88889 1.25 1.59375 1.25 1.24792C1.25 0.902084 1.37222 0.607639 1.61667 0.364583C1.86111 0.121528 2.15625 0 2.50208 0C2.84792 0 3.14236 0.122222 3.38542 0.366666C3.62847 0.611111 3.75 0.906249 3.75 1.25208C3.75 1.59792 3.62778 1.89236 3.38333 2.13542C3.13889 2.37847 2.84375 2.5 2.49792 2.5C2.15208 2.5 1.85764 2.37778 1.61458 2.13333ZM1 12V8.5H0V5C0 4.5875 0.146875 4.23438 0.440625 3.94063C0.734375 3.64688 1.0875 3.5 1.5 3.5H3.5C3.9125 3.5 4.26562 3.64688 4.55937 3.94063C4.85312 4.23438 5 4.5875 5 5V8.5H4V12H1Z" fill = "#3B82F6" /> </svg>` }
export const WomenIcons = () => { return `<svg width="6" height="10" viewBox="0 0 6 12" fill="none" xmlns="http:/ / www.w3.org / 2000 / svg"> <path d="M2.11458 2.13333C1.87153 1.88889 1.75 1.59375 1.75 1.24792C1.75 0.902084 1.87222 0.607639 2.11667 0.364583C2.36111 0.121528 2.65625 0 3.00208 0C3.34792 0 3.64236 0.122222 3.88542 0.366666C4.12847 0.611111 4.25 0.906249 4.25 1.25208C4.25 1.59792 4.12778 1.89236 3.88333 2.13542C3.63889 2.37847 3.34375 2.5 2.99792 2.5C2.65208 2.5 2.35764 2.37778 2.11458 2.13333ZM1.5 12V9H0L1.89583 4.25C1.99306 4.01389 2.14236 3.82986 2.34375 3.69792C2.54514 3.56597 2.76389 3.5 3 3.5C3.23611 3.5 3.45486 3.56597 3.65625 3.69792C3.85764 3.82986 4.00694 4.01389 4.10417 4.25L6 9H4.5V12H1.5Z" fill="#F43F5E"/> </svg>` }