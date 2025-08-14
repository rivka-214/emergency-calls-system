import { useEffect, useState } from "react";
import BackgroundLayout from "../layouts/BackgroundLayout";
import axios from "../services/axios";
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  nameid: string;
};

function getVolunteerIdFromToken(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = jwtDecode<any>(token);
    const id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    return id ? parseInt(id) : null;
  } catch (e) {
    console.error("⚠️ שגיאה בפענוח ה-token:", e);
    return null;
  }
}

export default function UpdateVolunteerPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "",
    address: ""
  });

  const volunteerId = getVolunteerIdFromToken();

  useEffect(() => {
    if (!volunteerId) return;

    axios.get(`/Volunteer/${volunteerId}`)
      .then(res => {
        const data = res.data || {};
        setFormData({
          fullName: data.fullName || "",
          phone: data.phone || "",
          city: data.city || "",
          address: data.address || ""
        });
      })
      .catch(() => alert("❌ שגיאה בטעינת פרטים"));
  }, [volunteerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/Volunteer/${volunteerId}`, formData);
      alert("✅ נשמר בהצלחה");
    } catch {
      alert("❌ שגיאה בשמירה");
    }
  };

  return (
    <BackgroundLayout>
      <h2>⚙ עדכון פרטים אישיים</h2>
      <form onSubmit={handleSubmit} className="form">
        <input name="fullName" placeholder="שם מלא" value={formData.fullName} onChange={handleChange} />
        <input name="phone" placeholder="טלפון" value={formData.phone} onChange={handleChange} />
        <input name="city" placeholder="עיר" value={formData.city} onChange={handleChange} />
        <input name="address" placeholder="כתובת" value={formData.address} onChange={handleChange} />
        <button type="submit">שמור</button>
      </form>
    </BackgroundLayout>
  );
}
