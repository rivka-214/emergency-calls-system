import { useState } from 'react';
import { updateVolunteerStatus } from '../services/volunteer.service';

export const useVolunteerStatus = (initialStatus?: string) => {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (callId: number, newStatus: 'going' | 'arrived' | 'finished') => {
    setIsLoading(true);
    try {
      await updateVolunteerStatus(callId, newStatus);
      setCurrentStatus(newStatus);
      return { success: true };
    } catch (error) {
      console.error('Error updating volunteer status:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStatus,
    isLoading,
    updateStatus,
    setCurrentStatus
  };
};
