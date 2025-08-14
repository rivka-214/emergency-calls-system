using Microsoft.EntityFrameworkCore;
using Reposetory.Entities;
using Repository.Entities;
using Repository.Interfacese;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Repositories
{
    public class VolunteersCallsRepository : IRepository<VolunteerCalls>
    {
        private readonly IContext context;

        public VolunteersCallsRepository(IContext context)
        {
            this.context = context;
        }

        public async Task<VolunteerCalls> AddItem(VolunteerCalls item)
        {
            await context.VolunteerCallsDb.AddAsync(item);
            await context.SaveAsync();

            return await context.VolunteerCallsDb
                .Include(vc => vc.Calls)
                .Include(vc => vc.Volunteer)
                .FirstOrDefaultAsync(vc => vc.Id == item.Id);
        }

        public async Task DeleteItem(int id)
        {
            var volunteerCall = await GetById(id);
            context.VolunteerCallsDb.Remove(volunteerCall);
            await context.SaveAsync();
        }

        public async Task<List<VolunteerCalls>> GetAll()
        {
            return await context.VolunteerCallsDb
                .Include(vc => vc.Calls)
                .Include(vc => vc.Volunteer)
                .ToListAsync();
        }

        public async Task<VolunteerCalls> GetById(int id)
        {
            return await context.VolunteerCallsDb
                .Include(vc => vc.Calls)
                .Include(vc => vc.Volunteer)
                .FirstOrDefaultAsync(x => x.CallsId == id);
        }
        public async Task<List<VolunteerCalls>> GetByCallId(int callId)
        {
            return await context.VolunteerCallsDb
                .Where(vc => vc.CallsId == callId)
                .Include(vc => vc.Calls)
                .Include(vc => vc.Volunteer)
                .ToListAsync();
        }


        public async Task UpdateItem(int id, VolunteerCalls item)
        {
            var volunteerCall = await GetById(id);
            if (volunteerCall != null)
            {
                volunteerCall.VolunteerStatus = item.VolunteerStatus;
                volunteerCall.ResponseTime = item.ResponseTime;
                await context.SaveAsync();
            }
        }

        public async Task<List<VolunteerCalls>> GetActiveCallsForVolunteer(int volunteerId)
        {
            return await context.VolunteerCallsDb
                .Where(vc => vc.VolunteerId == volunteerId &&
                             vc.VolunteerStatus != "cant" &&
                             vc.VolunteerStatus != "finished" &&
                             vc.VolunteerStatus != "notified")
                .Include(vc => vc.Calls)
                .Include(vc => vc.Volunteer)
                .ToListAsync();
        }

        public async Task<List<VolunteerCalls>> GetnotifiedCallsForVolunteer(int volunteerId)
        {
            return await context.VolunteerCallsDb
                .Where(vc => vc.VolunteerId == volunteerId &&
                             vc.VolunteerStatus == "notified")
                .Include(vc => vc.Calls)
                .Include(vc => vc.Volunteer)
                .ToListAsync();
        }

        public async Task<List<VolunteerCalls>> GetHistoryCallsForVolunteer(int volunteerId)
        {
            return await context.VolunteerCallsDb
                .Where(vc => vc.VolunteerId == volunteerId &&
                             vc.VolunteerStatus == "finished")
                .Include(vc => vc.Calls)
                .Include(vc => vc.Volunteer)
                .ToListAsync();
        }

        public async Task UpdateVolunteerStatus(int callId, int volunteerId, string status)
        {
            if (string.IsNullOrEmpty(status))
                throw new ArgumentException("status cannot be null or empty", nameof(status));

            var call = await GetVolunteerCall(callId, volunteerId);
            if (call != null)
            {
                call.VolunteerStatus = status;
                call.ResponseTime = DateTime.UtcNow;
                await context.SaveAsync();
            }
        }

        public async Task<int> GetGoingVolunteersCount(int callId)
        {
            return await context.VolunteerCallsDb
                .CountAsync(vc => vc.CallsId == callId && vc.VolunteerStatus == "going");
        }

        public async Task<bool> HasArrivedVolunteer(int callId)
        {
            return await context.VolunteerCallsDb
                .AnyAsync(vc => vc.CallsId == callId && vc.VolunteerStatus == "arrived");
        }

        public async Task<VolunteerCalls> GetVolunteerCall(int callId, int volunteerId)
        {
            return await context.VolunteerCallsDb
                .Include(vc => vc.Calls)
                .Include(vc => vc.Volunteer)
                .FirstOrDefaultAsync(vc => vc.CallsId == callId && vc.VolunteerId == volunteerId);
        }

        public async Task<List<Calls>> GetCallsForVolunteerByStatus(int volunteerId, string status)
        {
            return await context.VolunteerCallsDb
                .Include(vc => vc.Calls)
                .Where(vc => vc.VolunteerId == volunteerId && vc.VolunteerStatus == status)
                .Select(vc => vc.Calls)
                .ToListAsync();
        }

        public async Task<List<VolunteerCalls>> GetAllCallsForVolunteer(int volunteerId)
        {
            var result = await context.VolunteerCallsDb
                .Where(vc => vc.VolunteerId == volunteerId)
                .Include(vc => vc.Calls)
                .Include(vc => vc.Volunteer)
                .ToListAsync();

            return result;
        }
       

        public async Task CompleteCallAndUpdateVolunteers(int callId, int finishingVolunteerId, string summary, bool sentToHospital, string? hospitalName)
        {
            // שליפת כל הקריאות של הקריאה עם going או arrived
            var allRelatedVolunteerCalls = await context.VolunteerCallsDb
                .Where(vc => vc.CallsId == callId &&
                             (vc.VolunteerStatus == "going" || vc.VolunteerStatus == "arrived"))
                .ToListAsync();

            if (!allRelatedVolunteerCalls.Any())
                throw new Exception("לא נמצאו מתנדבים מתאימים לקריאה");

            // בדיקת המתנדב שסוגר
            var finishingVolunteerCall = allRelatedVolunteerCalls
                .FirstOrDefault(vc => vc.VolunteerId == finishingVolunteerId);

            if (finishingVolunteerCall == null)
                throw new Exception("המתנדב לא משויך לקריאה זו");

            if (finishingVolunteerCall.VolunteerStatus != "arrived")
                throw new UnauthorizedAccessException("רק מתנדב שהגיע יכול לסגור את הקריאה");

            // עדכון כל המתנדבים ל־finished
            foreach (var vc in allRelatedVolunteerCalls)
            {
                vc.VolunteerStatus = "finished";
                vc.ResponseTime = DateTime.UtcNow;
            }

            // עדכון הקריאה עצמה
            var call = await context.CallsDb.FirstOrDefaultAsync(c => c.Id == callId);
            if (call == null)
                throw new Exception("קריאה לא נמצאה");

            call.Status = "Closed";
            call.Summary = summary;
            call.SentToHospital = sentToHospital;
            call.HospitalName = hospitalName;

            await context.SaveAsync();
        }

    }
}
