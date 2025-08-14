// Database.cs
using Microsoft.EntityFrameworkCore;
using Reposetory.Entities;
using Repository.Entities;
using Repository.Interfacese;
using System.Threading.Tasks;

namespace Mock
{
    public class Database : DbContext, IContext
    {
        public DbSet<Calls> CallsDb { get; set; }
        public DbSet<Volunteers> VolunteersDb { get; set; }
        public DbSet<VolunteerCalls> VolunteerCallsDb { get; set; }
        public DbSet<User> UsersDb { get; set; }

        public void Save()
        {
            SaveChanges();
        }

        public async Task SaveAsync()
        {
            await SaveChangesAsync();
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server= localhost\\SQLEXPRESS01;Database=CitizenShield5;Trusted_Connection=True;TrustServerCertificate=True;");
        }
    }
}
