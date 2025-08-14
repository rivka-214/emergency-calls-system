using Microsoft.AspNetCore.SignalR;

namespace Service.Services
{
    public class NotificationHub : Hub
    {
        // שליחת הודעה למתנדב מסוים לפי מזהה
        public async Task SendCallAssigned(string volunteerId, object callDetails)
        {
            await Clients.User(volunteerId).SendAsync("CallAssigned", callDetails);
        }

        // שליחת הודעה לכל המתנדבים באזור מסוים
        public async Task SendCallToArea(string area, string callDetails)
        {
            await Clients.Group(area).SendAsync("CallInArea", callDetails);
        }

        // המתנדב מצטרף לקבוצת אזור
        public async Task JoinArea(string area)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, area);
        }
        public async Task OnVolunteerConnected(string volunteerId)
        {
            // אפשר להוסיף לוגיקה לעדכון שהמתנדב מחובר
            Console.WriteLine($"Volunteer {volunteerId} connected via SignalR");
        }
    }
}