import { useState, useEffect } from 'react';
import { getActiveCalls, updateVolunteerStatus } from '../services/volunteer.service';
import type { Call } from '../types/call.types';

export function useActiveCalls() {
  const [activeCalls, setActiveCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActiveCalls = async () => {
    setIsLoading(true);
    try {
      const res = await getActiveCalls();
      setActiveCalls(res.data);
    } catch (err) {
      console.error("❌ שגיאה בטעינת קריאות פעילות:", err);
      setError("שגיאה בטעינת קריאות פעילות");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (callId: number, status: "going" | "arrived" | "finished") => {
    try {
      await updateVolunteerStatus(callId, status);
      await loadActiveCalls();
    } catch (err) {
      console.error("❌ שגיאה בעדכון סטטוס:", err);
      alert("שגיאה בעדכון הסטטוס");
    }
  };

  useEffect(() => {
    loadActiveCalls();
  }, []);

  return { activeCalls, isLoading, error, reloadCalls: loadActiveCalls, handleStatusUpdate };
}
