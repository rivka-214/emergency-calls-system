using Microsoft.AspNetCore.SignalR;

namespace Service.Services
{
    public class NotificationHub : Hub
    {
        // ����� ����� ������ ����� ��� ����
        public async Task SendCallAssigned(string volunteerId, object callDetails)
        {
            await Clients.User(volunteerId).SendAsync("CallAssigned", callDetails);
        }

        // ����� ����� ��� �������� ����� �����
        public async Task SendCallToArea(string area, string callDetails)
        {
            await Clients.Group(area).SendAsync("CallInArea", callDetails);
        }

        // ������ ����� ������ ����
        public async Task JoinArea(string area)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, area);
        }
        public async Task OnVolunteerConnected(string volunteerId)
        {
            // ���� ������ ������ ������ ������� �����
            Console.WriteLine($"Volunteer {volunteerId} connected via SignalR");
        }
    }
}