using AutoMapper;
using Common.Dto;
using Reposetory.Entities;
using Repository.Entities;
using Repository.Interfacese;
using Repository.Repositories;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Service.Services; // עבור NotificationHub

namespace Service.Services
{
    public class VolunteersCallService : IService<VolunteerCallsDto>, IVolunteersCallLogic
    {
        private readonly IRepository<VolunteerCalls> _repository;
        private readonly IRepository<Calls> _callsRepository;
        private readonly IRepository<Volunteers> volunteerRepository;
        private readonly IMapper _mapper;
        private readonly IVolunteerLogic _volunteerLogic;
        private readonly VolunteersCallsRepository _volunteerCallsRepository;
        private readonly IHubContext<NotificationHub> _hubContext;

        private static readonly string[] ValidStatuses = { "notified", "going", "cant", "arrived", "finished" };
        private static readonly string[] ActiveStatuses = { "going", "arrived" };

        public VolunteersCallService(
            IRepository<VolunteerCalls> repository,
            IRepository<Calls> callsRepository,
            IMapper mapper,
            IVolunteerLogic volunteerLogic,
            IHubContext<NotificationHub> hubContext // הוסף כאן
        )
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _callsRepository = callsRepository ?? throw new ArgumentNullException(nameof(callsRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _volunteerLogic = volunteerLogic ?? throw new ArgumentNullException(nameof(volunteerLogic));
            _volunteerCallsRepository = repository as VolunteersCallsRepository ?? throw new ArgumentException("Repository must be of type VolunteersCallsRepository");
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext)); // אתחול
        }

        #region IService Implementation

        public async Task<VolunteerCallsDto> AddItemAsync(VolunteerCallsDto item)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            var entity = _mapper.Map<VolunteerCalls>(item);
            var added = await _repository.AddItem(entity);
            return _mapper.Map<VolunteerCallsDto>(added);
        }

        public async Task<List<VolunteerCallsDto>> GetAllAsync()
        {
            var entities = await _repository.GetAll();
            return _mapper.Map<List<VolunteerCallsDto>>(entities);
        }

        public async Task<VolunteerCallsDto> GetByIdAsync(int id)
        {
            var entity = await _repository.GetById(id);
            return _mapper.Map<VolunteerCallsDto>(entity);
        }

        public async Task UpdateItemAsync(int id, VolunteerCallsDto item)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            var entity = _mapper.Map<VolunteerCalls>(item);
            await _repository.UpdateItem(id, entity);
        }

        public async Task DeleteItemAsync(int id)
        {
            await _repository.DeleteItem(id);
        }

        #endregion

        #region Assignment and Management

        public async Task AssignNearbyVolunteersToCall(int callId, double locationX, double locationY)
        {
            var nearbyVolunteers = await _volunteerLogic.GetNearbyVolunteers(locationX, locationY);
            var call = await _callsRepository.GetById(callId);

            if (call == null)
                throw new InvalidOperationException($"Call with ID {callId} not found");

            var volunteersToAssign = nearbyVolunteers.Take(20);

            foreach (var volunteer in volunteersToAssign)
            {
                var volunteerCall = new VolunteerCallsDto
                {
                    CallsId = callId,
                    VolunteerId = volunteer.Id,
                    VolunteerStatus = "notified",
                    ResponseTime = DateTime.UtcNow,
                    GoingVolunteersCount = 0
                };

                await AddItemAsync(volunteerCall);

                // שליחת הודעה ל-Client של המתנדב
                var callDetailsForVolunteer = new
                {
                    CallId = call.Id,
                    Description = call.Description,
                    LocationX = call.LocationX,
                    LocationY = call.LocationY,
                    image= call.ImageUrl,
                    Date = call.Date,
                    Status = call.Status,

                    CallerName = call.User?.FirstName + " " + call.User?.LastName ?? "לא ידוע",

                };

                await _hubContext.Clients.User(volunteer.Id.ToString())
                    .SendAsync("CallAssigned", callDetailsForVolunteer);
            }
        }
      
        //מעבר על כל הקריאות ובדיקה האם צריך לשלוח עוד מתנדבים
        public async Task CheckAndReassignVolunteers()
        {
            var openCalls = await _callsRepository.GetAll();
            var openCallsFiltered = openCalls.Where(c => c.Status == "Open");

            foreach (var call in openCallsFiltered)
            {
                if (await ShouldSendToMoreVolunteers(call.Id))
                {
                    await _volunteerLogic.GetNearbyVolunteersNotAssigned(call.Id, call.LocationX, call.LocationY);
                }
            }
        }

        public async Task<bool> ShouldSendToMoreVolunteers(int callId)
        {
            var goingCount = await _volunteerCallsRepository.GetGoingVolunteersCount(callId);
            var hasArrived = await _volunteerCallsRepository.HasArrivedVolunteer(callId);

            return goingCount < 3 && !hasArrived;
        }

        #endregion

        #region Status Management

        public async Task UpdateVolunteerStatus(int callId, int volunteerId, string status, int currentVolunteerId)
        {
            ValidateStatusUpdate(callId, volunteerId, status, currentVolunteerId);

            var existingCall = await _volunteerCallsRepository.GetVolunteerCall(callId, volunteerId);
            if (existingCall == null)
                throw new InvalidOperationException("המתנדב לא משויך לקריאה זו");

            ValidateStatusTransition(existingCall.VolunteerStatus, status);

            await _volunteerCallsRepository.UpdateVolunteerStatus(callId, volunteerId, status);

            await HandleStatusSideEffects(callId, status);
        }

        public async Task<string> GetVolunteerStatus(int callId, int volunteerId)
        {
            var volunteerCall = await _volunteerCallsRepository.GetVolunteerCall(callId, volunteerId);
            return volunteerCall?.VolunteerStatus ?? "notified";
        }

        public async Task CompleteCallAsync(int callId, int volunteerId, int currentVolunteerId, CompleteCallDto dto)
        {
            if (volunteerId != currentVolunteerId)
                throw new UnauthorizedAccessException("אין הרשאה לעדכן מתנדב אחר");

            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            await _volunteerCallsRepository.CompleteCallAndUpdateVolunteers(
                callId, volunteerId, dto.Summary, dto.SentToHospital, dto.HospitalName);
        }

        #endregion

        #region Volunteer Calls Queries

        public async Task<List<VolunteerCallsDto>> GetActiveCallsForVolunteer(int volunteerId)
        {
            var activeCalls = await _volunteerCallsRepository.GetActiveCallsForVolunteer(volunteerId);
            return _mapper.Map<List<VolunteerCallsDto>>(activeCalls);
        }

        public async Task<List<VolunteerCallsDto>> GetNotifiedCallsForVolunteer(int volunteerId)
        {
            var notifiedCalls = await _volunteerCallsRepository.GetnotifiedCallsForVolunteer(volunteerId);
            return _mapper.Map<List<VolunteerCallsDto>>(notifiedCalls);
        }

        public async Task<List<VolunteerCallsDto>> GetHistoryCallsForVolunteer(int volunteerId)
        {
            var historyCalls = await _volunteerCallsRepository.GetHistoryCallsForVolunteer(volunteerId);
            return _mapper.Map<List<VolunteerCallsDto>>(historyCalls);
        }

        public async Task<VolunteerCallsDto> GetVolunteerCall(int callId, int volunteerId)
        {
            var volunteerCall = await _volunteerCallsRepository.GetVolunteerCall(callId, volunteerId);
            return _mapper.Map<VolunteerCallsDto>(volunteerCall);
        }

        #endregion

        #region Call Queries

        public async Task<List<CallsDto>> GetAllCallsForVolunteer(int volunteerId)
        {
            var volunteerCalls = await _volunteerCallsRepository.GetAllCallsForVolunteer(volunteerId);

            var calls = volunteerCalls
                .Where(vc => vc.Calls != null)
                .Select(vc => _mapper.Map<CallsDto>(vc.Calls))
                .ToList();

            return calls;
        }

        public async Task<List<CallsDto>> GetCallsForVolunteerByStatus(int volunteerId, string status)
        {
            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Status cannot be null or empty", nameof(status));

            var calls = await _volunteerCallsRepository.GetCallsForVolunteerByStatus(volunteerId, status);
            return _mapper.Map<List<CallsDto>>(calls);
        }

        public async Task<List<VolunteersDto>> GetTop20VolunteersForCall(int callId)
        {
            var call = await _callsRepository.GetById(callId);
            if (call == null)
                throw new InvalidOperationException($"Call with ID {callId} not found");

            var nearbyVolunteers = await _volunteerLogic.GetNearbyVolunteers(call.LocationX, call.LocationY);
            return nearbyVolunteers.Take(20).ToList();
        }

        #endregion

        #region Statistics and Info

        public async Task<CallVolunteersInfoDto> GetCallVolunteersInfo(int callId)
        {
            var goingCount = await _volunteerCallsRepository.GetGoingVolunteersCount(callId);
            var hasArrived = await _volunteerCallsRepository.HasArrivedVolunteer(callId);

            var statusMessage = GenerateStatusMessage(goingCount, hasArrived);

            return new CallVolunteersInfoDto
            {
                CallId = callId,
                GoingVolunteersCount = goingCount,
                HasArrivedVolunteer = hasArrived,
                StatusMessage = statusMessage
            };
        }

        public async Task<int> GetGoingVolunteersCount(int callId)
        {
            return await _volunteerCallsRepository.GetGoingVolunteersCount(callId);
        }

        public async Task<bool> HasArrivedVolunteer(int callId)
        {
            return await _volunteerCallsRepository.HasArrivedVolunteer(callId);
        }

        #endregion

        #region Private Helper Methods

        private void ValidateStatusUpdate(int callId, int volunteerId, string status, int currentVolunteerId)
        {
            if (callId <= 0)
                throw new ArgumentException("CallId must be greater than 0", nameof(callId));

            if (volunteerId <= 0)
                throw new ArgumentException("VolunteerId must be greater than 0", nameof(volunteerId));

            if (string.IsNullOrWhiteSpace(status))
                throw new ArgumentException("Status cannot be null or empty", nameof(status));

            if (!ValidStatuses.Contains(status))
                throw new ArgumentException($"Invalid status value: {status}", nameof(status));

            if (volunteerId != currentVolunteerId)
                throw new UnauthorizedAccessException("אין הרשאה לעדכן מתנדב אחר");
        }

        private void ValidateStatusTransition(string currentStatus, string newStatus)
        {
            if (newStatus == "arrived" && currentStatus != "going")
                throw new InvalidOperationException("לא ניתן לעדכן ל-'arrived' לפני שהסטטוס הוא 'going'");

            if (newStatus == "going" && currentStatus != "notified")
                throw new InvalidOperationException("לא ניתן לעדכן ל-'going' לפני שהסטטוס הוא 'notified'");
        }

        private async Task HandleStatusSideEffects(int callId, string status)
        {
            var call = await _callsRepository.GetById(callId);
            if (call == null)
                throw new InvalidOperationException("קריאה לא נמצאה");

            switch (status)
            {
                case "arrived":
                    call.Status = "InProgress";
                    await _callsRepository.UpdateItem(callId, call);
                    break;
                case "going":
                    call.numVolanteer++;
                    await _callsRepository.UpdateItem(callId, call);
                    break;
            }
        }

        private string GenerateStatusMessage(int goingCount, bool hasArrived)
        {
            if (hasArrived)
                return "מתנדב הגיע למקום - בטיפול";

            if (goingCount > 0)
                return $"{goingCount} מתנדבים יצאו לקריאה";

            return "ממתין למתנדבים";
        }

        #endregion
    }
}