using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Repository.Entities;

namespace Reposetory.Entities
{
    public class Calls
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public double LocationX { get; set; }
        [Required]
        public double LocationY { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public int? UrgencyLevel { get; set; }
        public string? Status { get; set; }
        public int numVolanteer { get; set; }
        public string? Summary { get; set; }
        public bool? SentToHospital { get; set; }
        public string? HospitalName { get; set; }
        public DateTime? Date { get; set; }

        public int? UserId { get; set; } // מזהה משתמש נוסף
        public User? User { get; set; }

        public List<VolunteerCalls> VolunteerCalls { get; set; } = new List<VolunteerCalls>();
    }
}