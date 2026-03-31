

export interface FormState {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  password:  string;
  confirm:   string;
  plan:      "free" | "pro" | "team";
  terms:     boolean;
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