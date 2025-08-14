// components/InitializedAuth.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, isValidToken } from "./auth.utils";

const getRoleFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
  } catch {
    return null;
  }
};

const InitializedAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getSession();

    if (!token || !isValidToken(token)) {
      navigate("/login");
      return;
    }

    const role = getRoleFromToken(token);
    if (role === "Volunteer") {
      navigate("/volunteerPage");
    } else if (role === "User") {
      navigate("/create-call");
    } else {
      navigate("login"); // ברירת מחדל במקרה שתפקיד לא מזוהה
    }
  }, []);

  return null;
};

export default InitializedAuth;
