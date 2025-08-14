import React from "react";
import "./CSS/BackgroundLayout.css";

interface Props {
  children: React.ReactNode;
}

export default function BackgroundLayout({ children }: Props) {
  return (
    <div
      className="background-layout"
      style={{ backgroundImage: `url(/images/ambulance.jpg)` }}
    >
      <div className="content-wrapper">
        {children}
      </div>
    </div>
  );
}
