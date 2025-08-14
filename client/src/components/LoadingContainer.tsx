import React from 'react';

interface LoadingContainerProps {
  message: string;
}

export default function LoadingContainer({ message }: LoadingContainerProps) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
}
