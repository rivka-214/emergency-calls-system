import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setSession } from "../../auth/auth.utils";
import { Paths } from "../../routes/paths";
import axios from "../../services/axios";
import { LogIn, Mail, Lock } from "lucide-react";
import BackgroundLayout from "../../layouts/BackgroundLayout";
import "../../style/auth.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await axios.post("/VolunteerLogin", { email, password });
      const { token, role } = res.data;
      setSession(token);

      if (role === "User") navigate(`/${Paths.userHome}`);
      else if (role === "Volunteer") navigate(`/${Paths.volunteerHome}`);
      else navigate("/");
    } catch (err) {
      alert("התחברות נכשלה - בדוק את הפרטים שלך");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BackgroundLayout>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <LogIn size={28} />
            </div>
            <h1 className="auth-title">התחברות</h1>
            <p className="auth-subtitle">ברוך הבא חזרה למערכת</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">כתובת אימייל</label>
              <input
                className="form-input"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">סיסמה</label>
              <div className="password-row">
                <input
                  className="form-input"
                  type="password"
                  placeholder="הכנס סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="login-button-small"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="loading-spinner-small" />
                  ) : (
                    'התחבר'
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="auth-footer">
            <p>אין לך חשבון? 
              <br />
              <a href="/register-user" className="auth-link">הירשם כמשתמש</a> | 
              <a href="/register-volunteer" className="auth-link"> הירשם כמתנדב</a>
            </p>
          </div>
        </div>
      </div>
    </BackgroundLayout>
  );
}
