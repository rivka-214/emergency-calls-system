using Microsoft.EntityFrameworkCore;
using Reposetory.Entities;
using Repository.Interfacese;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Repository.Repositories
{
    public class CallsRepository : ICallsRepository
    {
        private readonly IContext context;

        public CallsRepository(IContext context)
        {
            this.context = context;
        }

        public async Task<Calls> AddItem(Calls item)
        {
            await this.context.CallsDb.AddAsync(item);
            await this.context.SaveAsync();
            return item;
        }

        public async Task DeleteItem(int id)
        {
            var call = await GetById(id);
            this.context.CallsDb.Remove(call);
            await this.context.SaveAsync();
        }

        public async Task<List<Calls>> GetAll()
        {
            return await this.context.CallsDb.ToListAsync();
        }

        public async Task<Calls> GetById(int id)
        {
            return await context.CallsDb.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task UpdateItem(int id, Calls item)
        {
            var call = await GetById(id);

            if (call == null)
                throw new Exception($"לא נמצאה קריאה עם מזהה {id}");

            call.Status = item.Status;
            call.Summary = item.Summary;
            call.SentToHospital = item.SentToHospital;
            call.HospitalName = item.HospitalName;

            await context.SaveAsync();
        }

        public async Task<List<Calls>> GetCallsByUserId(int userId)
        {
            return await context.CallsDb
                                .Where(c => c.UserId == userId)
                                .ToListAsync();
        }
    }
}