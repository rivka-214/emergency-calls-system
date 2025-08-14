using Common.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Service.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.ComponentModel.DataAnnotations; // להוספת בדיקות תקינות
using System.Threading.Tasks;
using System.Linq;

namespace MyProject1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly IService<UserDto> service;
        private readonly IConfiguration config;

        public LoginController(IService<UserDto> service, IConfiguration config)
        {
            this.service = service;
            this.config = config;
        }

        // רישום משתמש חדש עם בדיקות תקינות
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UserDto value)
        {
            // בדיקת תקינות אוטומטית לפי Data Annotations (יש להוסיף אותן ל-UserDto)
            if (!TryValidateModel(value))
            {
                return BadRequest(ModelState);
            }

            // בדיקה אם משתמש עם המייל כבר קיים (אפשר לשפר עם שירות יעודי)
            var users = await service.GetAllAsync();
            if (users.Any(u => u.Gmail == value.Gmail))
                return BadRequest("כתובת המייל כבר רשומה במערכת.");

            var createdUser = await service.AddItemAsync(value);
            return Ok(createdUser);
        }

        // התחברות משתמש
        [HttpPost("/login")]
        public async Task<IActionResult> Login([FromBody] UserLogin value)
        {
            if (string.IsNullOrEmpty(value.Gmail) || string.IsNullOrEmpty(value.password))
            {
                return BadRequest("מייל וסיסמה הינם שדות חובה.");
            }

            var user = await Authenticate(value);
            if (user == null)
                return Unauthorized("שם משתמש או סיסמה שגויים.");

            var token = Generate(user);
            return Ok(new
            {
                token,
                role = user.Role ?? "User"
            });
        }

        // יצירת טוקן JWT
        private string Generate(UserDto user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Gmail),
                new Claim(ClaimTypes.Role, user.Role ?? "User")
            };

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddYears(10),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // אימות משתמש
        private async Task<UserDto?> Authenticate(UserLogin value)
        {
            var users = await service.GetAllAsync();
            // חשוב: הסיסמה חייבת להיות מאובטחת! כאן זה במפורש, בפועל השתמשו בהצפנה או Hash
            return users.FirstOrDefault(x => x.password == value.password && x.Gmail == value.Gmail);
        }
    }
}
