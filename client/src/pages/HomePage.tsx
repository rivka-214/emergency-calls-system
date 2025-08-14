import { useNavigate } from "react-router";
import BackgroundLayout from "../layouts/BackgroundLayout";
import { Heart, UserPlus, LogIn, Zap } from "lucide-react";
import "../style/HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <BackgroundLayout>
      {/* כפתור התחברות קטן בפינה */}
      <div className="login-corner">
        <button 
          className="corner-login-btn"
          onClick={() => navigate("/login")}
        >
          <LogIn size={20} />
          התחברות
        </button>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-icon">
            <Zap size={48} />
          </div>
          <h1 className="hero-title">מערכת חירום מתקדמת</h1>
          <p className="hero-subtitle">הירשמו עכשיו כדי שתוכלו בזמן אמת להציל חיים</p>
          
          <div className="action-cards">
            <div className="action-card" onClick={() => navigate("/register-user")}>
              <div className="card-icon">
                <UserPlus size={32} />
              </div>
              <h3>הרשמת משתמש</h3>
              <p>הצטרף כמבקש עזרה</p>
            </div>
            
            <div className="action-card" onClick={() => navigate("/register-volunteer")}>
              <div className="card-icon volunteer">
                <Heart size={32} />
              </div>
              <h3>הרשמת מתנדב</h3>
              <p>הצטרף לצוות המצילים</p>
            </div>
          </div>
          
          <p className="footer-text">המערכת זמינה עבור כל המכשירים</p>
        </div>
      </div>
    </BackgroundLayout>
  );
}