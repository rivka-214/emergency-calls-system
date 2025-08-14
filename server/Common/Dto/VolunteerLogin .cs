using System.ComponentModel.DataAnnotations;

public class VolunteerLogin
{
    [Required(ErrorMessage = "יש להזין כתובת אימייל")]
    [EmailAddress(ErrorMessage = "כתובת אימייל לא תקינה")]
    public string Gmail { get; set; } // מייל

    [Required(ErrorMessage = "יש להזין סיסמה")]
    [MinLength(6, ErrorMessage = "הסיסמה חייבת להכיל לפחות 6 תווים")]
    public string Password { get; set; } // סיסמא
}