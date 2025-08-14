using AutoMapper;
using Common.Dto;
using Microsoft.Extensions.DependencyInjection;
using Repository.Entities;
using Repository.Repositories;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Service.Interfaces;

namespace Service.Services
{
    public static class ExtentionService
    {
      
        public static IServiceCollection AddServices(this IServiceCollection services) {

            services.AddReposetory();
            services.AddScoped<IService<CallsDto>, CallService>();
            services.AddScoped<IService<VolunteersDto>, VolunteerService>();
            services.AddScoped<IService<VolunteerCallsDto>, VolunteersCallService>();
          
            services.AddScoped<IService<UserDto>, UserService>();
            services.AddScoped<IVolunteerLogic, VolunteerLogic>();
          
            services.AddScoped<IVolunteersCallLogic, VolunteersCallService>();
            services.AddScoped<ICallService, CallService>();



            services.AddAutoMapper(typeof(MyMapper));
            return services;
        }
    }
}
