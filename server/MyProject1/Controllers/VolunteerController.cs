using Common.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Service.Interfaces;
using Service.Services;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MyProject1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VolunteerController : ControllerBase
    {
        private readonly IService<VolunteersDto> _service;
        private readonly IVolunteerLogic _serviceLogic;
        private readonly IConfiguration _config;
        private readonly IVolunteersCallLogic _volunteerCallService; // Add this field

        public VolunteerController(
            IService<VolunteersDto> service,
            IVolunteerLogic logic,
            IConfiguration config,
            IVolunteersCallLogic volunteerCallService) // Add this parameter
        {
            _service = service;
            _serviceLogic = logic;
            _config = config;
            _volunteerCallService = volunteerCallService; // Initialize the field
        }

        [HttpGet]
        public async Task<List<VolunteersDto>> Get() => await _service.GetAllAsync();

        [HttpGet("{id}")]
        public async Task<VolunteersDto> Get(int id) => await _service.GetByIdAsync(id);



        [HttpPost]
        public async Task<IActionResult> Post([FromBody] VolunteersDto value)
        {
            // בדיקה אם ה-Model תקין
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // בדיקה אם כבר קיים מתנדב עם אותו gmail
            var allVolunteers = await _service.GetAllAsync();
            if (allVolunteers.Any(v => v.Gmail == value.Gmail))
            {
                return BadRequest("כתובת המייל כבר רשומה במערכת.");
            }

            // אפשר להוסיף בדיקות נוספות כאן, למשל:
            // בדיקה שאורך הסיסמה לפחות 6 תווים
            if (string.IsNullOrWhiteSpace(value.Password) || value.Password.Length < 6)
                return BadRequest("הסיסמה חייבת להכיל לפחות 6 תווים.");

            var createdVolunteer = await _serviceLogic.RegisterVolunteerWithLocation(value);

            // המשך יצירת הטוקן כמו בקוד הקיים
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new Claim(ClaimTypes.Email, createdVolunteer.Gmail),
        new Claim(ClaimTypes.NameIdentifier, createdVolunteer.Id.ToString()),
        new Claim(ClaimTypes.Role, "Volunteer")
    };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            string jwtToken = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = jwtToken,
                role = "Volunteer"
            });
        }

      
        [Authorize(Roles = "Volunteer")]
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] VolunteersDto value)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userVolunteerIdClaim = User.FindFirst("volunteerId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userVolunteerIdClaim == null)
                return Unauthorized(new { error = "לא נמצאה הרשאה למתנדב" });

            if (!int.TryParse(userVolunteerIdClaim.Value, out int userVolunteerId))
                return Unauthorized(new { error = "המזהה אינו חוקי" });

            if (userVolunteerId != id)
                return Unauthorized(new { error = "אין הרשאה לעדכן מתנדב אחר" });

            if (string.IsNullOrWhiteSpace(value.Gmail) || !new EmailAddressAttribute().IsValid(value.Gmail))
                return BadRequest("כתובת המייל אינה תקינה.");

            await _service.UpdateItemAsync(id, value);
            return NoContent();
        }


        [HttpGet("exists")]
        public async Task<IActionResult> CheckVolunteerExists([FromQuery] string gmail)
        {
            var volunteers = await _service.GetAllAsync();
            var exists = volunteers.Any(v => v.Gmail == gmail);
            return Ok(new { exists });
        }
        [Authorize]
        [HttpGet("{volunteerId}/calls")]
        public async Task<ActionResult<List<CallsDto>>> GetCallsForVolunteer(int volunteerId)
        {
            // קבלת volunteerId מה-claims של המשתמש המחובר (למשל ClaimType "volunteerId")
            var userVolunteerIdClaim = User.FindFirst("volunteerId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userVolunteerIdClaim == null)
                return Unauthorized(new { error = "לא נמצאה הרשאה למתנדב" });

            if (!int.TryParse(userVolunteerIdClaim.Value, out int userVolunteerId))
                return Unauthorized(new { error = "המזהה אינו חוקי" });

            if (userVolunteerId != volunteerId)
                return Unauthorized(new { error = "אין הרשאה לצפות בקריאות של מתנדב אחר" });

            var calls = await _volunteerCallService.GetAllCallsForVolunteer(volunteerId);
            if (calls == null || !calls.Any())
                return NotFound(new { error = "לא נמצאו קריאות למתנדב זה" });

            return Ok(calls);
        }

        [Authorize]
        [HttpGet("{volunteerId}/calls/by-status/{status}")]
        public async Task<ActionResult<List<CallsDto>>> GetCallsForVolunteerByStatus(int volunteerId, string status)
        {
            var userVolunteerIdClaim = User.FindFirst("volunteerId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userVolunteerIdClaim == null)
                return Unauthorized(new { error = "לא נמצאה הרשאה למתנדב" });

            if (!int.TryParse(userVolunteerIdClaim.Value, out int userVolunteerId))
                return Unauthorized(new { error = "המזהה אינו חוקי" });

            if (userVolunteerId != volunteerId)
                return Unauthorized(new { error = "אין הרשאה לצפות בקריאות של מתנדב אחר" });

            var calls = await _volunteerCallService.GetCallsForVolunteerByStatus(volunteerId, status);
            if (calls == null || !calls.Any())
                return NotFound(new { error = "לא נמצאו קריאות לסטטוס זה" });

            return Ok(calls);
        }

    }
}
