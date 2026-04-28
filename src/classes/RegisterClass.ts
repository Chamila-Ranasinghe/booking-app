

export interface FormState {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  password:  string;
  confirm:   string;
}

export interface FormErrors {
  firstName?: string;
  lastName?:  string;
  email?:     string;
  phone?:     string;
  password?:  string;
  confirm?:   string;
  terms?:     string;
}

export interface EventSheetErrors {
  sport?: string;
  date?:  string;
  timeslots?:     string;
  title?:  string;
  recurringEndDate?: string
}