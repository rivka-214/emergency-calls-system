import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'going':
      case 'בדרך':
        return 'text-red-600 bg-red-100';
      case 'arrived':
      case 'הגיע':
        return 'text-green-600 bg-green-100';
      case 'completed':
      case 'הושלם':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
      {status}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'גבוה':
        return 'bg-red-500';
      case 'medium':
      case 'בינוני':
        return 'bg-yellow-500';
      case 'low':
      case 'נמוך':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(priority)} ${className}`}>
      {priority}
    </div>
  );
};
