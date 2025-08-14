import React from "react";
import "../style/FormLayout.css";

type Props = {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
};

export default function FormLayout({ title, onSubmit, children }: Props) {
  return (
    <div className="form-container">
      <form className="form" onSubmit={onSubmit}>
        <h2>{title}</h2>
        {children}
        <button type="submit">שלח</button>
      </form>
    </div>
  );
}
