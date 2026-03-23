import { useState, useEffect, type FC, type FormEvent, type ChangeEvent } from "react";
import "../css/SigninComponent.scss";
import { useNavigate } from "react-router-dom";



/* ══════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════ */

 
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

  const navigate = useNavigate();
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
            <a onClick={()=> navigate("/register")}>Create Account</a>
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