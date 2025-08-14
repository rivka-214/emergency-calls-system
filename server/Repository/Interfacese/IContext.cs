// IContext.cs
using Microsoft.EntityFrameworkCore;
using Reposetory.Entities;
using Repository.Entities;
using System.Threading.Tasks;

namespace Repository.Interfacese
{
    public interface IContext
    {
        DbSet<Calls> CallsDb { get; set; }
        DbSet<Volunteers> VolunteersDb { get; set; }
        DbSet<VolunteerCalls> VolunteerCallsDb { get; set; }
        DbSet<User> UsersDb { get; set; }

        void Save();
        Task SaveAsync();
    }
}
