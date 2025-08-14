import React from 'react';

interface ErrorContainerProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorContainer({ message, onRetry }: ErrorContainerProps) {
  return (
    <div className="error-container">
      <p>{message}</p>
      <button onClick={onRetry} className="retry-button">
        נסה שוב
      </button>
    </div>
  );
}
