using AutoMapper;
using Common.Dto;
using Microsoft.EntityFrameworkCore;
using Reposetory.Entities;
using Repository.Entities;
using Repository.Interfacese;
using Repository.Repositories;
using Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Net.WebSockets;
using System.Collections.Concurrent;
using System.Threading;
using Microsoft.AspNetCore.SignalR; // הוסף למעלה
using Service.Services; // עבור NotificationHub

namespace Service.Services
{
    public class VolunteerLogic : IVolunteerLogic
    {
        private readonly IRepository<Volunteers> volunteerRepo;
        private readonly IVolunteer IvolunteerRepo;

        private readonly IRepository<Calls> callsRepo;
        private readonly IMapper mapper;

        private readonly ConcurrentDictionary<int, WebSocket> volunteerSockets = new();
        private readonly IHubContext<NotificationHub> _hubContext; // חדש

        public VolunteerLogic(
            IVolunteer volunteer,
            IRepository<Volunteers> volunteerRepo,
            IRepository<Calls> callsRepo,
            IMapper mapper,
            IHubContext<NotificationHub> hubContext // חדש
        )
        {
            IvolunteerRepo = volunteer;
            this.volunteerRepo = volunteerRepo;
            this.callsRepo = callsRepo;
            this.mapper = mapper;
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext)); // חדש
        }

        public async Task<VolunteersDto> RegisterVolunteerWithLocation(VolunteersDto dto)
        {
            var entity = mapper.Map<Volunteers>(dto);

            // אם לא נשלחו קואורדינטות תקינות - נחשב לפי כתובת
            if (entity.LocationX == null || entity.LocationX == 0 || entity.LocationY == null || entity.LocationY == 0)
            {
                var address = $"{entity.Address}, {entity.City}";
                var (lat, lng) = await GetCoordinatesFromAddress(address);
                entity.LocationX = lat;
                entity.LocationY = lng;
            }

            await volunteerRepo.AddItem(entity);
            return mapper.Map<VolunteersDto>(entity);
        }

        // קבלת 20 המתנדבים 
        public async Task<List<VolunteersDto>> GetNearbyVolunteers(double locationX, double locationY)
        {
            var volunteers = (await volunteerRepo.GetAll())
                .Where(v => v.LocationX.HasValue && v.LocationY.HasValue)
                .ToList();

            var volunteersWithDistance = volunteers
                .Select(v => new
                {
                    Volunteer = v,
                    Distance = Distance(v.LocationX!.Value, v.LocationY!.Value, locationX, locationY)
                })
                .OrderBy(x => x.Distance)
                .Take(20)
                .Select(x => x.Volunteer)
                .ToList();

            return mapper.Map<List<VolunteersDto>>(volunteersWithDistance);
        }

        // החזרת 20 הקריאות הקרובות למיקום מסויים עם סטטוס פתוח
        public async Task<List<CallsDto>> GetNearbyOpenCalls(double locationX, double locationY)
        {
            var calls = (await callsRepo.GetAll())
                .Where(c => c.Status == "Open")
                .ToList();

            var callsWithDistance = calls
                .Select(c => new
                {
                    Call = c,
                    Distance = Distance(c.LocationX, c.LocationY, locationX, locationY)
                })
                .OrderBy(x => x.Distance)
                .Take(20)
                .Select(x => x.Call)
                .ToList();

            return mapper.Map<List<CallsDto>>(callsWithDistance);
        }

        public async Task<List<CallsDto>> GetCallsByStatus(string status)
        {
            var calls = (await callsRepo.GetAll())
                .Where(c => c.Status.Equals(status, StringComparison.OrdinalIgnoreCase))
                .ToList();

            return mapper.Map<List<CallsDto>>(calls);
        }

        public async Task<List<VolunteersDto>> GetNearbyVolunteersNotAssigned(int callId, double locationX, double locationY, int count = 10)
        {
            var unassignedVolunteers = await IvolunteerRepo.GetVolunteersNotAssignedToCall(callId);

            var sorted = unassignedVolunteers
                .Where(v => v.LocationX.HasValue && v.LocationY.HasValue) // Ensure non-null values
                .Select(v => new
                {
                    Volunteer = v,
                    Distance = Distance(
                        locationX, locationY,
                        v.LocationX.Value, v.LocationY.Value) // Use .Value to access double
                })
                .OrderBy(x => x.Distance)
                .Take(count)
                .Select(x => x.Volunteer)
                .ToList();

            // שליחת הודעה לכל מתנדב שמוקצה
            foreach (var volunteer in sorted)
            {
                var callDetails = new
                {
                    CallId = callId,
                    LocationX = locationX,
                    LocationY = locationY
                    // תוכל להוסיף כאן פרטים נוספים אם תרצה
                };

                await _hubContext.Clients.User(volunteer.Id.ToString())
                    .SendAsync("CallAssigned", callDetails);
            }

            return mapper.Map<List<VolunteersDto>>(sorted);
        }

        // נוסחת Haversine לחישוב מרחק גאוגרפי מדויק בין שתי נקודות
        private double Distance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371e3; // רדיוס כדור הארץ במטרים
            double φ1 = lat1 * Math.PI / 180;
            double φ2 = lat2 * Math.PI / 180;
            double Δφ = (lat2 - lat1) * Math.PI / 180;
            double Δλ = (lon2 - lon1) * Math.PI / 180;

            double a = Math.Sin(Δφ / 2) * Math.Sin(Δφ / 2) +
                       Math.Cos(φ1) * Math.Cos(φ2) *
                       Math.Sin(Δλ / 2) * Math.Sin(Δλ / 2);
            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            double d = R * c; // מרחק במטרים
            return d;
        }

        private async Task<(double lat, double lng)> GetCoordinatesFromAddress(string address)
        {
            var client = new HttpClient();
            var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(address)}&format=json&limit=1";

            client.DefaultRequestHeaders.Add("User-Agent", "VolunteerApp");

            Console.WriteLine($"🔍 Requesting coordinates for address: {address}");
            Console.WriteLine($"📡 Full URL: {url}");

            try
            {
                var response = await client.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"❌ Request failed with status: {response.StatusCode}");
                    return (0, 0);
                }

                var json = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"📄 Raw JSON response: {json}");

                var result = JsonSerializer.Deserialize<List<NominatimResult>>(json);

                if (result != null && result.Any())
                {
                    var location = result.First();
                    Console.WriteLine($"✅ Found location: lat={location.lat}, lon={location.lon}");

                    return (double.Parse(location.lat), double.Parse(location.lon));
                }
                else
                {
                    Console.WriteLine("⚠️ No matching location found for the address.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"🔥 Exception while retrieving coordinates: {ex.Message}");
            }

            return (0, 0); // fallback
        }

        public async Task NotifyVolunteerAssigned(int volunteerId, string message)
        {
            if (volunteerSockets.TryGetValue(volunteerId, out var ws) && ws.State == WebSocketState.Open)
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(message);
                await ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }

        private class NominatimResult
        {
            public string lat { get; set; }
            public string lon { get; set; }
        }
    }
}