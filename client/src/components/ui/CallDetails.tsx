import React from 'react';
import { MapPin, AlertCircle, Clock, Users, User } from 'lucide-react';
import { Call, VolunteerCall } from '../../types';

// פונקציה מקומית להצגת תאריך
const formatDateTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('he-IL');
};

interface CallDetailsProps {
  call: Call;
  responseTime?: string;
  goingVolunteersCount: number;
  volunteerStatus?: string;
}

export const CallDetails: React.FC<CallDetailsProps> = ({ 
  call, 
  responseTime, 
  goingVolunteersCount, 
  volunteerStatus 
}) => {
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
    <div className="space-y-3 mb-4">
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-medium text-gray-700">כתובת:</span>
          <p className="text-gray-600">{call.address}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-medium text-gray-700">תיאור:</span>
          <p className="text-gray-600">{call.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <span className="font-medium text-gray-700">זמן קריאה:</span>
        <span className="text-gray-600">{formatDateTime(call.timestamp || call.date)}</span>
      </div>

      <div className="flex items-center gap-3">
        <Users className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <span className="font-medium text-gray-700">מתנדבים בדרך:</span>
        <span className="text-gray-600">{goingVolunteersCount}</span>
      </div>

      <div className="flex items-center gap-3">
        <User className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <span className="font-medium text-gray-700">סטטוס המתנדב:</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(volunteerStatus || 'לא זמין')}`}>
          {volunteerStatus || 'לא זמין'}
        </span>
      </div>

      {responseTime && (
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
          <span className="font-medium text-gray-700">זמן תגובה:</span>
          <span className="text-gray-600">{responseTime}</span>
        </div>
      )}
    </div>
  );
};
