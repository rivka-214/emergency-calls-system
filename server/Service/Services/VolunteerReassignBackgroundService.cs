using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Service.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Service.Services
{
    public class VolunteerReassignBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _interval = TimeSpan.FromMinutes(0.5); // כל 1 דקות

        public VolunteerReassignBackgroundService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var volunteerCallLogic = scope.ServiceProvider.GetRequiredService<IVolunteersCallLogic>();

                    try
                    {
                        await volunteerCallLogic.CheckAndReassignVolunteers();
                    }
                    catch (Exception ex)
                    {
                        // לוג שגיאה אם תרצי
                        Console.WriteLine($"שגיאה בזמן reassignment: {ex.Message}");
                    }
                }

                await Task.Delay(_interval, stoppingToken);
            }
        }
    }
}
