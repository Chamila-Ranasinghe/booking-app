import React, { useState, useEffect, type FC, type FormEvent, type ChangeEvent } from "react";
import "../css/SigninComponent.scss";


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
 
const EmailIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);
 
const LockIcon: FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
 
const EyeIcon: FC<{ open: boolean }> = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
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
   TYPES
══════════════════════════════════════════════════════════════ */
interface FormState {
  email: string;
  password: string;
  remember: boolean;
}
interface FormErrors {
  email?: string;
  password?: string;
}
 
/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
const SignIn: FC = () => {
  const [form,    setForm]    = useState<FormState>({ email: "", password: "", remember: false });
  const [errors,  setErrors]  = useState<FormErrors>({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(false);
 
  /* Inject CSS */
  useEffect(() => {
    const id = "calclone-signin-styles";
    document.getElementById(id)?.remove();
    const tag = document.createElement("style");
    tag.id = id;
    document.head.appendChild(tag);
    return () => { document.getElementById(id)?.remove(); };
  }, []);
 
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.email.trim())                    errs.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password)                        errs.password = "Password is required";
    else if (form.password.length < 6)         errs.password = "Minimum 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
 
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };
 
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(p => ({ ...p, [name]: undefined }));
    }
  };
 
  return (
    <div className="signinContainer"> 
      {/* ── Right form panel ── */}
      <div className="signin-form-wrap">
        <div className="signin-card">
 
          {/* Mobile logo */}
          {/* <div className="mobile-logo">
            <LogoIcon/>
            <span className="mobile-logo-text">CalClone</span>
          </div> */}
 
          <div className="card-eyebrow">Welcome back</div>
          <h1 className="card-title">Sign in to your account</h1>
          <p className="card-sub">Enter your credentials to continue</p>
 
          {/* Social login */}
          {/* <div className="social-row">
            <button className="social-btn" type="button" aria-label="Sign in with Google">
              <GoogleIcon/> Google
            </button>
            <button className="social-btn" type="button" aria-label="Sign in with Apple">
              <AppleIcon/> Apple
            </button>
          </div> */}
 
          <div className="divider">
            {/* <div className="divider-line"/> */}
            {/* <span className="divider-text">or continue with email</span> */}
            <div className="divider-line"/>
          </div>
 
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-body">
 
              {/* Email */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="email">Email address</label>
                <div className="field-input-wrap">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="hello@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`field-input ${errors.email ? "error" : ""}`}
                  />
                  <div className="field-icon"><EmailIcon/></div>
                </div>
                {errors.email && (
                  <span className="field-err">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors.email}
                  </span>
                )}
              </div>
 
              {/* Password */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange}
                    className={`field-input ${errors.password ? "error" : ""}`}
                  />
                  <div className="field-icon"><LockIcon/></div>
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPwd(p => !p)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPwd}/>
                  </button>
                </div>
                {errors.password && (
                  <span className="field-err">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errors.password}
                  </span>
                )}
              </div>
 
              {/* Remember / Forgot */}
              {/* <div className="remember-row">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                  />
                  <span className="checkbox-label">Remember me</span>
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div> */}
 
            </div>
 
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <><div className="spinner"/><span>Signing in…</span></>
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>
 
          <div className="card-footer">
            Don't have an account?&nbsp;
            <a href="/register">Create Account</a>
          </div>
        </div>
      </div>
 
      {/* Toast */}
      {toast && (
        <div className="toast">
          <div className="toast-dot"/>
          Signed in successfully! Redirecting…
        </div>
      )}
    </div>
  );
};
 
export default SignIn;