using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; 
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Dto
{
    public class UserDto
    {
        public int Id { get; set; } // מפתח ראשי

        public int UserId { get; set; } // מזהה משתמש נוסף

        [Required(ErrorMessage = "יש להזין שם פרטי")]
        [StringLength(50, ErrorMessage = "שם פרטי יכול להכיל עד 50 תווים")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "יש להזין שם משפחה")]
        [StringLength(50, ErrorMessage = "שם משפחה יכול להכיל עד 50 תווים")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "יש להזין מספר טלפון")]
        [Phone(ErrorMessage = "מספר הטלפון אינו תקין")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "יש להזין כתובת אימייל")]
        [EmailAddress(ErrorMessage = "כתובת האימייל אינה תקינה")]
        public string Gmail { get; set; }

        [Required(ErrorMessage = "יש להזין סיסמה")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "הסיסמה צריכה להיות בין 6 ל-100 תווים")]
        public string password { get; set; }

        public string? Role { get; set; }
    }
}
