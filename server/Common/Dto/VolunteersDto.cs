using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.ComponentModel.DataAnnotations;

namespace Common.Dto
{
    public class VolunteersDto
    {
        public int Id { get; set; } // מפתח ראשי

        [Required(ErrorMessage = "שדה שם מלא הוא חובה")]
        public string FullName { get; set; } // שם מלא

        [Required(ErrorMessage = "שדה סיסמה הוא חובה")]
        [MinLength(6, ErrorMessage = "הסיסמה חייבת להכיל לפחות 6 תווים")]
        public string Password { get; set; } // סיסמא

        [Required(ErrorMessage = "שדה מייל הוא חובה")]
        [EmailAddress(ErrorMessage = "מייל אינו תקין")]
        public string Gmail { get; set; } // מייל

        [Required(ErrorMessage = "שדה טלפון הוא חובה")]
        [Phone(ErrorMessage = "מספר טלפון אינו תקין")]
        public string PhoneNumber { get; set; } // מספר טלפון

        [Required(ErrorMessage = "שדה התמחות הוא חובה")]
        public string Specialization { get; set; } // תפקיד (חובש, מגיש עזרה ראשונה וכו')

        [Required(ErrorMessage = "שדה כתובת הוא חובה")]
        public string Address { get; set; }

        [Required(ErrorMessage = "שדה עיר הוא חובה")]
        public string City { get; set; }

        public double? LocationX { get; set; }
        public double? LocationY { get; set; }
    }
}

