import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import BackgroundLayout from "../../layouts/BackgroundLayout";
import { createCall, getFirstAidSuggestions, assignNearbyVolunteers } from "../../services/calls.service";
import "../../style/emergency-styles.css";

export default function CreateCallPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<{ x: string; y: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    urgencyLevel: "", // יישמר כערך string, אבל יומר למספר
    status: "Open",
    fileImage: null as File | null,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({
          x: pos.coords.latitude.toString(),
          y: pos.coords.longitude.toString(),
        }),
      () => alert("⚠️ לא הצלחנו לאתר מיקום")
    );
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.files?.[0] || null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert("📍 אין מיקום זמין עדיין");
      return;
    }

    setIsLoading(true);

    const data = new FormData();

    data.append("Status", formData.status);
    data.append("LocationX", Number(location.x).toString());
    data.append("LocationY", Number(location.y).toString());
    data.append("UrgencyLevel", Number(formData.urgencyLevel).toString());
    data.append("CreatedAt", new Date().toISOString());

    if (formData.description) data.append("Description", formData.description);
    if (formData.fileImage) data.append("FileImage", formData.fileImage);

    try {
      const response = await createCall(data);
      // נוודא שה-id מגיע מהשרת
      const callId = (response.data as any).id || (response.data as any).callId;
      if (!callId) throw new Error("לא התקבל מזהה קריאה מהשרת");
      
      // שיוך מתנדבים קרובים לקריאה
      try {
        console.log("👥 Assigning volunteers to regular call:", callId);
        await assignNearbyVolunteers(callId);
        console.log("✅ Volunteers assigned to regular call successfully");
      } catch (assignError) {
        console.error("❌ Failed to assign volunteers to regular call:", assignError);
        // אל תעצור את התהליך - הקריאה נוצרה בהצלחה
      }
      
      let guides = [];
      if (formData.description) {
        const res = await getFirstAidSuggestions(formData.description);
        guides = res.data;
      }
      navigate(`/call-confirmation/${callId}`, { state: { callId, description: formData.description, guides } });
    } catch {
      alert("❌ שגיאה בשליחה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <div className="create-call-container">
        <h2 className="page-title" style={{ color: '#ef4444', textShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }}>🚨 פתיחת קריאת חירום</h2>

   

        <form onSubmit={handleSubmit} className="form">
          <textarea
            name="description"
            placeholder="תיאור המצב (לא חובה) - תאר מה קרה בקצרה"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="form-textarea"
          />

          {/* 🔽 קומבו־בוקס לרמת דחיפות */}
          <select
            name="urgencyLevel"
            value={formData.urgencyLevel}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">בחר רמת דחיפות</option>
            <option value="1">נמוכה</option>
            <option value="2">בינונית</option>
            <option value="3">גבוהה</option>
            <option value="4">קריטית</option>
          </select>

          <div className="file-upload-container">
            <input
              type="file"
              name="fileImage"
              onChange={handleChange}
              accept="image/*"
            />
            <small className="file-help-text">📸 אפשר לצרף תמונה להמחשת המצב</small>
          </div>

          <button type="submit" disabled={isLoading} className="emergency-submit-btn">
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                שולח קריאת חירום...
              </>
            ) : (
              <>
                � שלח קריאת חירום
              </>
            )}
          </button>
        </form>
      </div>
    </BackgroundLayout>
  );
}
