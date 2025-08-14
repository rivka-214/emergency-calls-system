import type { Call } from './call.types';

export interface VolunteerCall {
  callsId: number;
  volunteerId: number;
  volunteerStatus?: "notified" | "going" | "cant" | "arrived" | "finished" | "pending";
  responseTime?: string;
  call: Call;
  goingVolunteersCount: number;
}
