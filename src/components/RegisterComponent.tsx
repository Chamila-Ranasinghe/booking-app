import "../css/RegisterComponent.scss";
import { useState, type FC, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {UserIcon, EmailIcon, LockIcon, PhoneIcon, EyeIcon, CheckIcon, AlertIcon, EmailCheckIcon} from "../icons/RegisterIcons";
import type {FormState, FormErrors } from "../classes/RegisterClass";
import { createRecords, useApiMutation, type ResponseObj } from "../api/common";
import { createUser, OtpVerification, verifyemail } from "../api/APIclass";
import ThreeDots from "./ThreeDots";



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


const Register: FC = () => {

  const createUserMutation = useApiMutation(createRecords(createUser), ["users"]);
  const verifyUseremail = useApiMutation(createRecords(verifyemail), ["email_verify"]);
  const OTPverification = useApiMutation(createRecords(OtpVerification), ["otp-verification"]);

  const navigate = useNavigate();
  const [form,    setForm]    = useState<FormState>({
    firstName:"", lastName:"", email:"", phone:"",
    password:"", confirm:""
  });
  

  const [errors,   setErrors]   = useState<FormErrors>({});
  const [showPwd,  setShowPwd]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [isemailverifid, setemailverify] = useState(false);
  const [showemailverify, setshowemailverify] = useState(false);
  const [showEmailverifyError, setemailverifyerrorPage] = useState(false);
  const [emailVerifyErrorMessage, setemailVerifyErrorMessage] = useState("");

  const [emailVerify, setEmailVerify] = useState<string>("");
  const [errorsOnOTPVerify, setErrorsOnOTPverify ] = useState<string>("");
  const [RegisterpageErrors, setRegisterPageErrors] = useState("");

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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    createUserMutation.mutate(
      form, {
        onSuccess: (data : ResponseObj<any>) => {
          setLoading(false);
          if(data.success){
              setLoading(false);
              setSuccess(true);
          }
          else{
            setRegisterPageErrors(data.error)
          }
      },
        onError(data){
          setLoading(false);
          setRegisterPageErrors(data.message);
        }
      }
    );
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(p => ({ ...p, [name]: undefined }));
    }
  };

  const handleEmailVerify = () => {
    let requestObj = {
      code: emailVerify,
      email: form.email
    };
    OTPverification.mutate(
      requestObj, {
        onSuccess: (data : ResponseObj<any>) => {
          if(data.success){
            setshowemailverify(false);
            setemailverify(true);
          }
          else{
            setshowemailverify(true);
            setemailverify(false);
            setErrorsOnOTPverify(data.error)
          }
      },
      onError:() =>{
      }
  })
  };

  const hadleCheckEmail = () => {
    let errs: FormErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)){
        errs.email ="Enter a valid email";
        setErrors(errs);
        return;
    }
    setshowemailverify(true);
    let requestObj = {
      email: form.email,
    };

    verifyUseremail.mutate(requestObj, {
      onSuccess: (data : ResponseObj<any>) => {
          if(data.success){
              setemailVerifyErrorMessage("");
              setemailverifyerrorPage(false);
          }
          else{
             setemailVerifyErrorMessage(data.error);
             setemailverifyerrorPage(true);
          }
      },
      onError:() =>{
          setemailVerifyErrorMessage("Error occoure while verifying the email!");
          setemailverifyerrorPage(true);
      }
    });
  };

  const handleEmailVerifyBack = ()=>{
      setshowemailverify(false);
      setemailverify(false);
  }

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="reg-page">
        <div className="reg-card-success">
          <div className="success-screen">
            <div className="success-icon"><CheckIcon/></div>
            <h2 className="success-title">You're all set, {form.firstName}!</h2>
            <p className="success-sub">
              Your Sports Zone account has been created. SignIn to start booking !
            </p>
            <button className="success-btn" onClick={() => {setSuccess(false); navigate("/signin");}}>
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

   /* ── email verification screen ── */
  if (showemailverify) {
    
    return(

      verifyUseremail.isPending ? ( <div className=""><ThreeDots /></div>) : 
      (<>
      <div className="email-verify-container">
          <div className="email-card">
            <div className="back-button-div">
                <button className="submit-btn back-button" onClick={handleEmailVerifyBack}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>Back
                  </button>
            </div>
            {showEmailverifyError ? 
            (
              <div className="email-header error">
                  <h2 className="success-title error">Email Validation Error !</h2>
                  <span className="error-email">{form.email} ,</span>
                  <p className="error">{ emailVerifyErrorMessage }</p>
              </div>
            ): (
            <>
            <div className="email-header">
              <h2 className="success-title">Verify Email</h2>
              <p>Please enter the 6-digit code sent to your email</p>
              <div>
                <p className="alert-msg">
                  A verification code has been sent to your Email
                </p>
              </div>
            </div>
            <div className="email-body">
              <input
                id="verifyc"
                placeholder="......"
                className="email-verification-textbox"
                pattern="\d{6}"
                maxLength={6}
                onChange={(e) => {
                  let value = e.target.value
                  if (/^\d*$/.test(value)) {setEmailVerify(value)}
                  }}
                value={emailVerify}
              ></input>
              {errorsOnOTPVerify && <span className="field-err verify-err"><AlertIcon/>{errorsOnOTPVerify}</span>}
            </div>
            <div className="email-footer">

              <button
                className="submit-btn"
                disabled={emailVerify?.length <= 5 || OTPverification.isPending}
                onClick={handleEmailVerify}
              >
              {OTPverification.isPending ? (
                <><div className="spinner"/><span>Verifying…</span></>
              ) : (
                <>
                  Verify OTP
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}  
              </button>

              <div className="email-footer-resend">
                Didn't receive code?&nbsp;
                <a onClick={hadleCheckEmail}>Resend Code</a>
              </div>
            </div> </>)} 

          </div>
      </div>
      </>)
    );
  }

  return (
    <div className="reg-page">
      <div className="reg-card">

        {/* ── Dark header banner ── */}
        <div className="reg-header">
          <div className="reg-header-grain"/>
          <div className="reg-header-orb"/>

          <div className="reg-header-eyebrow">Create account</div>
          <h1 className="reg-header-title">
            Join <span>Sports Zone</span> today
          </h1>

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
          <form onSubmit={handleSubmit} noValidate>

            {/* ── Personal info ── */}
            <div className="section-title">Personal Info</div>
            <div className="form-grid-2">
              {/* First name */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="firstName">First name</label>
                <div className="field-input-wrap">
                  <input id="firstName" name="firstName" type="text" autoComplete="given-name"
                    placeholder="John" value={form.firstName} onChange={handleChange}
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
                    placeholder="Doe" value={form.lastName} onChange={handleChange}
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
                  
                  <input id="email" name="email" type="email" autoComplete="email" disabled={isemailverifid}
                    placeholder="ada@example.com" value={form.email} onChange={handleChange}
                    className={`field-input ${errors.email ? "error" : form.email ? "success" : ""}`}
                  />
                 <div className="field-icon"><EmailIcon/></div>
                 <button type="button" className="eye-btn verify-email" disabled={isemailverifid} onClick={hadleCheckEmail}>
                    <EmailCheckIcon open={isemailverifid}/>
                  </button>
                </div>
                {errors.email && <span className="field-err"><AlertIcon/>{errors.email}</span>}
              </div>

              {/* Phone (optional) */}
              <div className="field-wrap">
                <label className="field-label" htmlFor="phone">Phone <span style={{color:"var(--text-5)",fontWeight:500,textTransform:"none"}}></span></label>
                <div className="field-input-wrap">
                  <input id="phone" name="phone" type="text" autoComplete="tel" pattern="\d{10}" maxLength={10}
                    placeholder="0710100100" value={form.phone} onChange={handleChange}
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

            <div className="common-error">
              {RegisterpageErrors && <span className="field-err verify-err"><AlertIcon/>{RegisterpageErrors}</span>}
            </div>
            <button type="submit" className="submit-btn" disabled={loading || !isemailverifid}>
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
            <a onClick={()=> navigate("/signin")}>Sign in instead</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;