using System;

namespace Common.Dto
{
    public class VolunteerCallsDto
    {
        public int CallsId { get; set; }
        public int VolunteerId { get; set; }
        public string? VolunteerStatus { get; set; } // "notified", "going", "cant", "arrived", "finished"
        public DateTime? ResponseTime { get; set; }
        public CallsDto? Call { get; set; } // פרטי הקריאה
        public VolunteersDto? Volunteer { get; set; } // פרטי המתנדב
        public int GoingVolunteersCount { get; set; } // מספר מתנדבים ב-going
    }
}