// ✅ הגדרות בסיסיות של קריאות חירום

export interface Call {
  id: number;
  locationX: number;
  locationY: number;
  arrImage?: string;
  date: string;
  fileImage?: string | null;
  description: string;
  urgencyLevel: number;
  status: "Open" | "InProgress" | "Closed";
  summary?: string;
  sentToHospital?: boolean | null;
  hospitalName?: string | null;
  userId: number;
  address?: string; // Made optional since it might not always be available
  priority?: string; // Made optional
  timestamp?: string; // Made optional
  type?: string; // Made optional
  numVolunteer?: number; // Added property
  imageUrl?: string; // Added property
}

export interface VolunteerCall {
  id: number;
  callsId: number;
  volunteerId: number;
  volunteerStatus?: "notified" | "going" | "cant" | "arrived" | "finished";
  responseTime?: string;
  call: Call;
  goingVolunteersCount?: number;
}

export interface CompleteCallDto {
  summary: string;
  sentToHospital: boolean;
  hospitalName?: string;
}

export interface CallStatus {
  Open: "Open";
  InProgress: "InProgress";
  Closed: "Closed";
}

export interface VolunteerStatus {
  volunteerId: number
  response: "notified" | "going" | "cant" | "arrived" | "finished"
  updatedAt?: string
}

export interface CallCreateRequest {
  description?: string
  urgencyLevel: number // 🔧 שינוי מ-string ל-number
  locationX: number
  locationY: number
  fileImage?: File
}

export interface CallResponse {
  id: number
  message: string
  status: string
}
