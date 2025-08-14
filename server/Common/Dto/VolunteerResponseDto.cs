using System;

namespace Common.Dto
{
   

    public class UpdateVolunteerStatusDto
    {
        public string Status { get; set; } // "going", "cant", "arrived", "finished"
       
    }

    public class CallVolunteersInfoDto
    {
        public int CallId { get; set; }
        public int GoingVolunteersCount { get; set; }
        public bool HasArrivedVolunteer { get; set; }
        public string StatusMessage { get; set; }
    }
}
