import { useState, type FC, type FormEvent, type ChangeEvent } from "react";
import "../css/SigninComponent.scss";
import { useNavigate } from "react-router-dom";
import { EmailIcon, LockIcon, EyeIcon } from "../icons/SignInIcons";
import type { FormState, FormErrors } from "../classes/SignInClass";
import { createRecords, useApiMutation, type ResponseObj } from "../api/common";
import { loginuser } from "../api/APIclass";
import { useAuth } from "./AuthManager/AuthContext";
import type { User } from "../classes/CalendarClass";

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
const SignIn: FC = () => {
  const loginUserMutation = useApiMutation(createRecords(loginuser), ["users"]);
  const { login } = useAuth();
  const userdata: User = {
    email: "",
    firstname: "",
    id: 0,
    lastname: "",
    phone: 0,
    regDate: "",
    userType: "",
  };

  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [SigninpageErrors, setSigninPageErrors] = useState("");

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Minimum 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    let requestobject = {
      email: form.email,
      password: form.password,
    };
    loginUserMutation.mutate(requestobject, {
      onSuccess: (data: ResponseObj<any>) => {
        setLoading(false);
        if (data.success) {
          userdata.email = data.data.email;
          userdata.firstname = data.data.first_name;
          userdata.lastname = data.data.last_name;
          userdata.id = data.data.id;
          userdata.phone = data.data.phone;
          userdata.regDate = data.data.reg_date;
          userdata.userType = data.data.user_type;
          userdata.isAdmin = data.data.user_type === "user" ? false : true;
          login({ user: userdata });
          navigate("/calendar");
        } else {
          setSigninPageErrors(data.error);
        }
      },
      onError: (data) => {
        setLoading(false);
        setSigninPageErrors(data.message);
      },
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((p) => ({ ...p, [name]: undefined }));
    }
  };

  return (
    <div className="signinContainer">
      {/* ── Right form panel ── */}
      <div className="signin-form-wrap">
        <div className="signin-card">
          <div className="card-eyebrow">Welcome back</div>
          <h1 className="card-title">Sign in to your account</h1>
          <p className="card-sub">Enter your credentials to continue</p>

          <div className="divider">
            <div className="divider-line" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-body">
              {/* Email */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="email">
                  Email address
                </label>
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
                  <div className="field-icon">
                    <EmailIcon />
                  </div>
                </div>
                {errors.email && (
                  <span className="field-err">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="password">
                  Password
                </label>
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
                  <div className="field-icon">
                    <LockIcon />
                  </div>
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPwd((p) => !p)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
                {errors.password && (
                  <span className="field-err">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.password}
                  </span>
                )}
              </div>
            </div>

            <div className="common-error">
              {SigninpageErrors && (
                <span className="field-err">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {SigninpageErrors}
                </span>
              )}
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  Sign in
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="card-footer">
            Don't have an account?&nbsp;
            <a onClick={() => navigate("/register")}>Create Account</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
