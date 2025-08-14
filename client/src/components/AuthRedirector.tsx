// ✅ src/components/AuthRedirector.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, isValidToken, getRoleFromToken } from "../auth/auth.utils";
// import { refreshToken } from "../services/auth.service";
import HomePage from "../pages/HomePage";

const AuthRedirector = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getSession();

    if (token && isValidToken(token)) {
      const role = getRoleFromToken(token);
     // refreshToken(token); // 🆕 רענון טוקן

      if (role === "User") navigate("/create-call");
      else if (role === "Volunteer") navigate("/volunteerPage");
      else navigate("/auth/login");
    }

    setChecking(false);
  }, []);

  if (checking) return null;
  return <HomePage />;
};

export default AuthRedirector;