import type { Passenger, ShuttleTripHeaderInfo } from "../types/apiRouteTypes";

export const DUMMY_TRIP_INFO: ShuttleTripHeaderInfo = {
  tripId: "123",
  isSelected: true,
};

export interface ShuttleStop {
  id: string;
  stopNumber: number;
  stopName: string;
  address: string;
  passengerCount: number;
  distanceKms: number;
  eta: string;
  passengers: Passenger[];
}
export const DUMMY_SHUTTLE_STOPS: ShuttleStop[] = [
  {
    id: "stop-1",
    stopNumber: 1,
    stopName: "Lantana, Nahar Amrit Shakti",
    address: "Nahar's Amrit Shakti, OK Milan Colony, Chandivali, Powai, Mumbai 400072",
    passengerCount: 4,
    distanceKms: 2,
    eta: "17:30",
    passengers: [
      {
        id: "pax-1-1",
        name: "Simran Kaur",
        empId: "123456",
        gender: "F",
        isChecked: true,
      },
      {
        id: "pax-1-2",
        name: "Kunal Singh",
        empId: "234567",
        gender: "M",
        isChecked: true,
      },
      {
        id: "pax-1-3",
        name: "Rohit Shetty",
        empId: "345678",
        gender: "M",
        isChecked: true,
      },
      {
        id: "pax-1-4",
        name: "Karan Lohar",
        empId: "456789",
        gender: "M",
        isChecked: true,
      },
    ],
  },
  {
    id: "stop-2",
    stopNumber: 2,
    stopName: "Hiranandani Gardens, Powai",
    address: "Hiranandani Business Park, Lake Boulevard Rd, Powai, Mumbai 400076",
    passengerCount: 3,
    distanceKms: 4,
    eta: "17:45",
    passengers: [
      {
        id: "pax-2-1",
        name: "Priya Mehta",
        empId: "567890",
        gender: "F",
        isChecked: true,
      },
      {
        id: "pax-2-2",
        name: "Aakash Verma",
        empId: "678901",
        gender: "M",
        isChecked: true,
      },
      {
        id: "pax-2-3",
        name: "Sneha Pillai",
        empId: "789012",
        gender: "F",
        isChecked: false,
      },
    ],
  },
  {
    id: "stop-3",
    stopNumber: 3,
    stopName: "Oberoi Mall, Goregaon East",
    address: "Western Express Hwy, Goregaon East, Mumbai 400063",
    passengerCount: 5,
    distanceKms: 7,
    eta: "18:00",
    passengers: [
      {
        id: "pax-3-1",
        name: "Neha Joshi",
        empId: "890123",
        gender: "F",
        isChecked: true,
      },
      {
        id: "pax-3-2",
        name: "Vivek Sharma",
        empId: "901234",
        gender: "M",
        isChecked: true,
      },
      {
        id: "pax-3-3",
        name: "Anjali Rao",
        empId: "012345",
        gender: "F",
        isChecked: true,
      },
      {
        id: "pax-3-4",
        name: "Deepak Nair",
        empId: "112233",
        gender: "M",
        isChecked: false,
      },
      {
        id: "pax-3-5",
        name: "Ritika Desai",
        empId: "223344",
        gender: "F",
        isChecked: true,
      },
    ],
  },
  {
    id: "stop-4",
    stopNumber: 4,
    stopName: "Infinity Mall, Malad West",
    address: "New Link Rd, Shastri Nagar, Andheri West, Mumbai 400053",
    passengerCount: 2,
    distanceKms: 11,
    eta: "18:20",
    passengers: [
      {
        id: "pax-4-1",
        name: "Farhan Qureshi",
        empId: "334455",
        gender: "M",
        isChecked: true,
      },
      {
        id: "pax-4-2",
        name: "Meera Iyer",
        empId: "445566",
        gender: "F",
        isChecked: true,
      },
    ],
  },
];