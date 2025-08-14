using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Dto
{
    public class CallsDto
    {
        public int Id { get; set; } // מפתח ראשי

        [Required(ErrorMessage = "יש להזין קואורדינטת X")]
        public double LocationX { get; set; } // קואורדינטה X

        [Required(ErrorMessage = "יש להזין קואורדינטת Y")]
        public double LocationY { get; set; } // קואורדינטה Y

        public byte[]? ArrImage { get; set; } // תמונה

        public DateTime? Date { get; set; }

        public IFormFile? FileImage { get; set; } // קובץ תמונה

        [StringLength(500, ErrorMessage = "התיאור יכול להכיל עד 500 תווים")]
        public string? Description { get; set; } // תיאור

        [Range(1, 5, ErrorMessage = "רמת הדחיפות צריכה להיות בין 1 ל-5")]
        public int? UrgencyLevel { get; set; } // רמת דחיפות

        public string? Status { get; set; } // סטטוס הקריאה

        public string? Summary { get; set; } = string.Empty;

        public bool? SentToHospital { get; set; }

        public string? HospitalName { get; set; }

        public int? UserId { get; set; }
    }
}