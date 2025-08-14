using Microsoft.EntityFrameworkCore;
using Reposetory.Entities;
using Repository.Entities;
using Repository.Interfacese;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Repositories
{
    public class VolunteersRepository : IRepository<Volunteers>, IVolunteer
    {
        private readonly IContext context;
        public VolunteersRepository(IContext context)
        {
            this.context = context;
        }

        public async Task<Volunteers> AddItem(Volunteers item)
        {
            await this.context.VolunteersDb.AddAsync(item);
            await this.context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var volunteer = await GetById(id);
            this.context.VolunteersDb.Remove(volunteer);
            await this.context.SaveAsync();
        }

        public async Task<List<Volunteers>> GetAll()
        {
            return await this.context.VolunteersDb.ToListAsync();
        }

        public async Task<Volunteers> GetById(int id)
        {
            return await context.VolunteersDb.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task UpdateItem(int id, Volunteers item)
        {
            var Volunteer = await GetById(id);
            Volunteer.FullName = item.FullName;
            Volunteer.PhoneNumber = item.PhoneNumber;
            Volunteer.Specialization = item.Specialization;

            await context.SaveAsync();
        }

        public async Task<List<Volunteers>> GetVolunteersNotAssignedToCall(int callId)
        {
            var allWithLocation = await context.VolunteersDb
                .Where(v => v.LocationX.HasValue && v.LocationY.HasValue)
                .ToListAsync();

            var assignedIds = await context.VolunteerCallsDb
                .Where(vc => vc.CallsId == callId)
                .Select(vc => vc.VolunteerId)
                .ToListAsync();

            return allWithLocation
                .Where(v => !assignedIds.Contains(v.Id))
                .ToList();
        }
    }
}


