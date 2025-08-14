// import { useEffect, useState } from "react";
// import { getAllVolunteers } from "../../services/volunteer.service";
// import BackgroundLayout from "../../layouts/BackgroundLayout";

// type Volunteer = {
//   id: number;
//   fullName: string;
//   gmail: string;
//   phoneNumber: string;
//   specialization: string;
//   city: string;
// };

// export default function VolunteerListPage() {
//   const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchVolunteers = async () => {
//       try {
//         const res = await getAllVolunteers();
//         setVolunteers(res.data);
//       } catch (err: any) {
//         setError("שגיאה בטעינת מתנדבים");
//         console.error(err);
//       }
//     };

//     fetchVolunteers();
//   }, []);

//   return (
//     <BackgroundLayout>
//       <h2 style={{ textAlign: "center" }}>📋 רשימת מתנדבים</h2>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
//         {volunteers.map((v) => (
//           <div key={v.id} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "10px" }}>
//             <h3>{v.fullName}</h3>
//             <p>📧 {v.gmail}</p>
//             <p>📞 {v.phoneNumber}</p>
//             <p>🩺 {v.specialization}</p>
//             <p>🏙️ {v.city}</p>
//           </div>
//         ))}
//       </div>
//     </BackgroundLayout>
//   );
// }
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllVolunteers } from "../../services/volunteer.service"
import type { Volunteer } from "../../types/volunteer.types"
import BackgroundLayout from "../../layouts/BackgroundLayout"

const VolunteerListPage = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchVolunteers()
  }, [])

  const fetchVolunteers = async () => {
    try {
      const res = await getAllVolunteers()
      setVolunteers(res.data)
    } catch (err: any) {
      setError("שגיאה בטעינת מתנדבים")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <BackgroundLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען רשימת מתנדבים...</p>
        </div>
      </BackgroundLayout>
    )
  }

  if (error) {
    return (
      <BackgroundLayout>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchVolunteers} className="retry-button">
            נסה שוב
          </button>
        </div>
      </BackgroundLayout>
    )
  }

  return (
    <BackgroundLayout>
      <div className="volunteer-list-page">
        <div className="page-header">
          <h1>רשימת מתנדבים</h1>
          <button className="create-button" onClick={() => navigate("/volunteer/register")}>
            הוסף מתנדב חדש
          </button>
        </div>

        <div className="volunteers-grid">
          {volunteers.map((volunteer) => (
            <div key={volunteer.id} className="volunteer-card">
              <div className="volunteer-header">
                <h3>{volunteer.fullName}</h3>
                <span className="volunteer-id">#{volunteer.id}</span>
              </div>

              <div className="volunteer-details">
                <p>
                  <strong>אימייל:</strong> {volunteer.Gmail}
                </p>
                <p>
                  <strong>טלפון:</strong> {volunteer.phoneNumber}
                </p>
                <p>
                  <strong>התמחות:</strong> {volunteer.specialization}
                </p>
                <p>
                  <strong>עיר:</strong> {volunteer.city}
                </p>
                <p>
                  <strong>כתובת:</strong> {volunteer.address}
                </p>
              </div>

              <div className="volunteer-actions">
                <button className="view-button" onClick={() => navigate(`/volunteer/${volunteer.id}`)}>
                  צפה בפרטים
                </button>
              </div>
            </div>
          ))}
        </div>

        {volunteers.length === 0 && (
          <div className="no-volunteers">
            <p>אין מתנדבים רשומים במערכת</p>
          </div>
        )}
      </div>
    </BackgroundLayout>
  )
}

export default VolunteerListPage
