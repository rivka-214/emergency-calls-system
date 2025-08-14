// src/layouts/PageLayout.tsx
import { ReactNode } from "react";
import "./PageLayout.css";
import SignalRVolunteerCallWatcher from "../components/SignalRVolunteerCallWatcher";
import CallPopupModal from "../components/CallPopupModal";

type Props = {
  children: ReactNode;
};

export default function PageLayout({ children }: Props) {
  return (
    <div className="page-layout">
      <SignalRVolunteerCallWatcher />
      <CallPopupModal />
      <div className="page-container">
        {children}
      </div>
    </div>
  );
}
