using Common.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IVolunteersCallLogic
    {
        // Assignment and management
        Task AssignNearbyVolunteersToCall(int callId, double locationX, double locationY);
        Task CheckAndReassignVolunteers();
        Task<bool> ShouldSendToMoreVolunteers(int callId);

        // Status management
        Task UpdateVolunteerStatus(int callId, int volunteerId, string status, int currentVolunteerId);
        Task<string> GetVolunteerStatus(int callId, int volunteerId);
        Task CompleteCallAsync(int callId, int volunteerId, int currentVolunteerId, CompleteCallDto dto);

        // Volunteer calls queries
        Task<List<VolunteerCallsDto>> GetActiveCallsForVolunteer(int volunteerId);
        Task<List<VolunteerCallsDto>> GetNotifiedCallsForVolunteer(int volunteerId);
        Task<List<VolunteerCallsDto>> GetHistoryCallsForVolunteer(int volunteerId);
        Task<VolunteerCallsDto> GetVolunteerCall(int callId, int volunteerId);

        // Call queries
        Task<List<CallsDto>> GetAllCallsForVolunteer(int volunteerId);
        Task<List<CallsDto>> GetCallsForVolunteerByStatus(int volunteerId, string status);
        Task<List<VolunteersDto>> GetTop20VolunteersForCall(int callId);

        // Statistics and info
        Task<CallVolunteersInfoDto> GetCallVolunteersInfo(int callId);
        Task<int> GetGoingVolunteersCount(int callId);
        Task<bool> HasArrivedVolunteer(int callId);
    }
}