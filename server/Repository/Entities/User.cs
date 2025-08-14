using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Entities
{
    public class User
    {
        public int Id { get; set; }
        public int UserId { get; set; } // מזהה משתמש נוסף
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Gmail { get; set; }
        public string password { get; set; }
        public string? Role { get; set; }
    }
}
