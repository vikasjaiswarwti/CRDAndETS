export interface City {
  cityID: number;
  cityName: string;
}

export interface CitySpeedCell {
  speedID: number;
  cityID: number;
  cityName: string;
  dayOfWeek: number;
  dayName: string;
  hourOfDay: number;
  hours: string;
  avgSpeedKmh: number;
}

// One row per hour; `data` holds that hour's value for each weekday.
export interface CitySpeedRow {
  label: string;
  data: CitySpeedCell[];
}
