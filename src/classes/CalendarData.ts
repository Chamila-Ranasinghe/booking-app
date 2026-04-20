export const MONTH_NAMES: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DAY_SHORT: string[] = ["S", "M", "T", "W", "T", "F", "S"];
export const DAY_LONG: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const COLOR_PALETTE: string[] = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export const DAY_MED: string[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

// export const timeSlots: SlotData [] = [
//   {id: 1, label: "6 AM – 7 AM", timePeriod: 1},
//   {id: 2, label: "7 AM – 8 AM", timePeriod: 1},
//   {id: 3, label: "8 AM – 9 AM", timePeriod: 1},
//   {id: 4, label: "9 AM – 10 AM", timePeriod: 1,isbooked : true},
//   {id: 5, label: "10 AM – 11 AM", timePeriod: 1},
//   {id: 6, label: "11 AM – 12 PM", timePeriod: 1},
//   {id: 7, label: "12 PM – 1 PM", timePeriod: 2},
//   {id: 8, label: "1 PM – 2 PM", timePeriod: 2, isbooked: true},
//   {id: 9, label: "2 PM – 3 PM", timePeriod: 2, isbooked : true},
//   {id: 10, label: "3 PM – 4 PM", timePeriod: 2},
//   {id: 11, label: "4 PM – 5 PM", timePeriod: 2},
//   {id: 12, label: "5 PM – 6 PM", timePeriod: 3},
//   {id: 13, label: "6 PM – 7 PM", timePeriod: 3},
//   {id: 14, label: "7 PM – 8 PM", timePeriod: 3},
//   {id: 15, label: "8 PM – 9 PM", timePeriod: 3},
//   {id: 16, label: "9 PM – 10 PM", timePeriod: 3},
//   {id: 17, label: "10 PM – 11 PM", timePeriod: 3},
//   {id: 18, label: "11 PM – 12 PM", timePeriod: 3}
// ]

export interface SportInterface {
  id: number;
  sportname: string;
  rate: number; 
  icon: string;
}

export interface Sport {
  id: number;
  sport_name: string;
  per_hour_rate: number; 
}
export const Sports: Sport [] = [
  {id: 1, sport_name: "Cricket", per_hour_rate: 2500},
  {id: 2, sport_name: "Football", per_hour_rate: 1500},
  {id: 3, sport_name: "Yoga", per_hour_rate: 500},
  {id: 4, sport_name: "Zumba", per_hour_rate: 1000},
]