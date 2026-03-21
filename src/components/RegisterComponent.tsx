import "../css/RegisterComponent.scss";
import React, { useState, useEffect, type FC, type FormEvent, type ChangeEvent } from "react";



/* ══════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════ */
const LogoIcon: FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="4" fill="#c4622d" opacity=".15"/>
    <rect x="3" y="4" width="18" height="18" rx="4" stroke="#c4622d" strokeWidth="1.5"/>
    <line x1="3" y1="9.5" x2="21" y2="9.5" stroke="#c4622d" strokeWidth="1.5"/>
    <line x1="8" y1="2" x2="8" y2="7" stroke="#c4622d" strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="2" x2="16" y2="7" stroke="#c4622d" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="8"  cy="14" r="1.4" fill="#c4622d"/>
    <circle cx="12" cy="14" r="1.4" fill="#c4622d" opacity=".5"/>
    <circle cx="16" cy="14" r="1.4" fill="#5c8a6e"/>
  </svg>
);
const UserIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const EmailIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
  </svg>
);
const LockIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const PhoneIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.42 2 2 0 0 1 3.57 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.89a16 16 0 0 0 6.4 6.4l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const EyeIcon: FC<{ open: boolean }> = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
const CheckIcon: FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5c8a6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const AlertIcon: FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const GoogleIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);
const AppleIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function getStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
}
const STRENGTH_LABELS = ["","Weak","Fair","Good","Strong"];
const STRENGTH_CLASSES = ["","strength-weak","strength-fair","strength-good","strength-strong"];
const BAR_CLASSES = ["","active-weak","active-fair","active-good","active-strong"];

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
interface FormState {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  password:  string;
  confirm:   string;
  plan:      "free" | "pro" | "team";
  terms:     boolean;
}
interface FormErrors {
  firstName?: string;
  lastName?:  string;
  email?:     string;
  phone?:     string;
  password?:  string;
  confirm?:   string;
  terms?:     string;
}

const PLANS: { id: FormState["plan"]; icon: string; name: string; price: string; popular?: boolean }[] = [
  { id: "free",  icon: "🌱", name: "Free",    price: "$0 / mo" },
  { id: "pro",   icon: "⚡", name: "Pro",     price: "$9 / mo", popular: true },
  { id: "team",  icon: "🏆", name: "Team",    price: "$24 / mo" },
];

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
const Register: FC = () => {
  const [form,    setForm]    = useState<FormState>({
    firstName:"", lastName:"", email:"", phone:"",
    password:"", confirm:"", plan:"pro", terms: false,
  });
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [showPwd,  setShowPwd]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const strength = getStrength(form.password);

  /* Progress: count filled required fields */
  const filled = [form.firstName, form.lastName, form.email, form.password, form.confirm].filter(Boolean).length;
  const progress = Math.round((filled / 5) * 100);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.firstName.trim())   errs.firstName = "First name is required";
    if (!form.lastName.trim())    errs.lastName  = "Last name is required";
    if (!form.email.trim())       errs.email     = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    
    if (!form.password)           errs.password  = "Password is required";
    else if (form.password.length < 8) errs.password = "Minimum 8 characters";
    else if (strength < 2)        errs.password  = "Password is too weak";
    if (!form.confirm)            errs.confirm   = "Please confirm your password";
    else if (form.confirm !== form.password) errs.confirm = "Passwords do not match";
    if (!form.terms)              errs.terms     = "You must accept the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    setSuccess(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(p => ({ ...p, [name]: undefined }));
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="reg-page">
        <div className="reg-card">
          <div className="success-screen">
            <div className="success-icon"><CheckIcon/></div>
            <h2 className="success-title">You're all set, {form.firstName}!</h2>
            <p className="success-sub">
              Your CalClone account has been created. Check your email at <strong>{form.email}</strong> to verify your address.
            </p>
            <button className="success-btn" onClick={() => setSuccess(false)}>
              Go to Sign In
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reg-page">
      <div className="reg-card">

        {/* ── Dark header banner ── */}
        <div className="reg-header">
          <div className="reg-header-grain"/>
          <div className="reg-header-orb"/>

          {/* <div className="reg-logo">
            <LogoIcon/>
            <span className="reg-logo-text">CalClone</span>
          </div> */}

          <div className="reg-header-eyebrow">Create account</div>
          <h1 className="reg-header-title">
            Join <span>Sport Zone</span> today
          </h1>
          {/* <p className="reg-header-sub">
            Join us to start booking slots for your favorite sports.
          </p> */}

          {/* Progress bar */}
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}/>
            </div>
            <span className="progress-text">{progress}% complete</span>
          </div>
        </div>

        {/* ── Form body ── */}
        <div className="reg-body">

          {/* Social signup */}
          {/* <div className="social-row">
            <button className="social-btn" type="button"><GoogleIcon/> Google</button>
            <button className="social-btn" type="button"><AppleIcon/> Apple</button>
          </div>
          <div className="divider">
            <div className="divider-line"/>
            <span className="divider-text">or fill in details</span>
            <div className="divider-line"/>
          </div> */}

          <form onSubmit={handleSubmit} noValidate>

            {/* ── Personal info ── */}
            <div className="section-title">Personal Info</div>
            <div className="form-grid-2">
              {/* First name */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="firstName">First name</label>
                <div className="field-input-wrap">
                  <input id="firstName" name="firstName" type="text" autoComplete="given-name"
                    placeholder="Ada" value={form.firstName} onChange={handleChange}
                    className={`field-input ${errors.firstName ? "error" : form.firstName ? "success" : ""}`}
                  />
                  <div className="field-icon"><UserIcon/></div>
                </div>
                {errors.firstName && <span className="field-err"><AlertIcon/>{errors.firstName}</span>}
              </div>

              {/* Last name */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="lastName">Last name</label>
                <div className="field-input-wrap">
                  <input id="lastName" name="lastName" type="text" autoComplete="family-name"
                    placeholder="Lovelace" value={form.lastName} onChange={handleChange}
                    className={`field-input ${errors.lastName ? "error" : form.lastName ? "success" : ""}`}
                  />
                  <div className="field-icon"><UserIcon/></div>
                </div>
                {errors.lastName && <span className="field-err"><AlertIcon/>{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-col">
              {/* Email */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="email">Email address</label>
                <div className="field-input-wrap">
                  <input id="email" name="email" type="email" autoComplete="email"
                    placeholder="ada@example.com" value={form.email} onChange={handleChange}
                    className={`field-input ${errors.email ? "error" : form.email ? "success" : ""}`}
                  />
                  <div className="field-icon"><EmailIcon/></div>
                </div>
                {errors.email && <span className="field-err"><AlertIcon/>{errors.email}</span>}
              </div>

              {/* Phone (optional) */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="phone">Phone <span style={{color:"var(--text-5)",fontWeight:500,textTransform:"none"}}></span></label>
                <div className="field-input-wrap">
                  <input id="phone" name="phone" type="tel" autoComplete="tel"
                    placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange}
                    className="field-input"
                  />
                  <div className="field-icon"><PhoneIcon/></div>
                </div>
              </div>
            </div>

            {/* ── Security ── */}
            <div className="section-title" style={{ marginTop: 24 }}>Security</div>
            <div className="form-col">
              {/* Password */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-input-wrap">
                  <input id="password" name="password" type={showPwd ? "text" : "password"}
                    autoComplete="new-password" placeholder="Create a strong password"
                    value={form.password} onChange={handleChange}
                    className={`field-input ${errors.password ? "error" : ""}`}
                  />
                  <div className="field-icon"><LockIcon/></div>
                  <button type="button" className="eye-btn" onClick={() => setShowPwd(p => !p)}>
                    <EyeIcon open={showPwd}/>
                  </button>
                </div>
                {form.password && (
                  <div className="pwd-strength">
                    <div className="strength-bars">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`strength-bar ${strength >= i ? BAR_CLASSES[strength] : ""}`}/>
                      ))}
                    </div>
                    <span className={`strength-label ${STRENGTH_CLASSES[strength]}`}>
                      {STRENGTH_LABELS[strength]} password
                    </span>
                  </div>
                )}
                {errors.password && <span className="field-err"><AlertIcon/>{errors.password}</span>}
                {!errors.password && (
                  <span className="field-hint">Min. 8 chars · uppercase · number · symbol</span>
                )}
              </div>

              {/* Confirm password */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="confirm">Confirm password</label>
                <div className="field-input-wrap">
                  <input id="confirm" name="confirm" type={showConf ? "text" : "password"}
                    autoComplete="new-password" placeholder="Re-enter password"
                    value={form.confirm} onChange={handleChange}
                    className={`field-input ${errors.confirm ? "error" : form.confirm && form.confirm === form.password ? "success" : ""}`}
                  />
                  <div className="field-icon"><LockIcon/></div>
                  <button type="button" className="eye-btn" onClick={() => setShowConf(p => !p)}>
                    <EyeIcon open={showConf}/>
                  </button>
                </div>
                {errors.confirm && <span className="field-err"><AlertIcon/>{errors.confirm}</span>}
              </div>
            </div>

            {/* ── Plan selector ── */}
            {/* <div className="section-title" style={{ marginTop: 24 }}>Choose a Plan</div>
            <div className="plan-grid" style={{ marginBottom: 22 }}>
              {PLANS.map(p => (
                <div
                  key={p.id}
                  className={`plan-card ${form.plan === p.id ? "selected" : ""}`}
                  onClick={() => setForm(f => ({ ...f, plan: p.id }))}
                >
                  {p.popular && <div className="plan-badge">Popular</div>}
                  <div className="plan-icon">{p.icon}</div>
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-price">{p.price}</div>
                </div>
              ))}
            </div> */}

            {/* Terms */}
            {/* <label className={`terms-wrap ${errors.terms ? "error" : ""}`}>
              <input
                type="checkbox"
                name="terms"
                className="terms-cb"
                checked={form.terms}
                onChange={handleChange}
              />
              <span className="terms-text">
                I agree to CalClone's{" "}
                <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>.
                You'll receive account-related emails.
              </span>
            </label> */}

            {/* {errors.terms && (
              <div style={{ marginBottom: 16, marginTop: -8 }}>
                <span className="field-err"><AlertIcon/>{errors.terms}</span>
              </div>
            )} */}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <><div className="spinner"/><span>Creating account…</span></>
              ) : (
                <>
                  Create my account
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="card-footer">
            Already have an account?&nbsp;
            <a href="/signin">Sign in instead</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;