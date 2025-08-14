// קבוע למיפוי צבעים של עדיפות
export const getPriorityColor = (priority: string): string => {
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

// קבוע למיפוי צבעים של סטטוס
export const getStatusColor = (status: string): string => {
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

// פונקציה להצגת תאריך
export const formatDateTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('he-IL');
};
