using Microsoft.Extensions.DependencyInjection;
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
    public static class ExtentionReposetory
    {
        public static IServiceCollection AddReposetory(this IServiceCollection services)
        {
            services.AddScoped<IRepository<Calls>, CallsRepository>();
            services.AddScoped<IRepository<VolunteerCalls>, VolunteersCallsRepository>();
            services.AddScoped<IRepository<Volunteers>, VolunteersRepository>();
            services.AddScoped<IRepository<User>, UserRepository>();
            services.AddScoped<IRepository<Calls>, CallsRepository>(); // עבור VolunteersCallService ו-CallService
           services.AddScoped<IRepository<VolunteerCalls>, VolunteersCallsRepository>(); // עבור VolunteersCallService

            return services;
        }


    }
}
