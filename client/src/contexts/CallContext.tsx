
import React, { useState, useContext, createContext } from 'react';
import { Call } from '../types/call.types'

interface CallContextType {
  popupCall: Call | null;
  setPopupCall: React.Dispatch<React.SetStateAction<Call | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  activeCalls: Call[];
  setActiveCalls: React.Dispatch<React.SetStateAction<Call[]>>;
}



const CallContext = createContext<CallContextType | null>(null);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [popupCall, setPopupCall] = useState<Call | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCalls, setActiveCalls] = useState<Call[]>([]);

  return (
    <CallContext.Provider value={{ 
      popupCall, 
      setPopupCall, 
      isLoading, 
      setIsLoading,
      activeCalls,
      setActiveCalls
    }}>
      {children}
    </CallContext.Provider>
  );
};
export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallContext must be used within a CallProvider");
  }
  return context;
};