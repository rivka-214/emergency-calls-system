using Common.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Service.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Linq;
using System.Threading.Tasks;

namespace MyProject1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginControllerVolunteer : ControllerBase
    {
        private readonly IService<VolunteersDto> service;
        private readonly IConfiguration config;

        public LoginControllerVolunteer(IService<VolunteersDto> service, IConfiguration config)
        {
            this.service = service;
            this.config = config;
        }

        [HttpPost("/VolunteerLogin")]
        public async Task<IActionResult> Login([FromBody] VolunteerLogin value)
        {
            if (string.IsNullOrEmpty(value.Gmail) || string.IsNullOrEmpty(value.Password))
            {
                return BadRequest("מייל וסיסמה הם שדות חובה.");
            }

            var volunteer = await Authenticate(value);
            if (volunteer == null)
                return Unauthorized("שם משתמש או סיסמה שגויים.");

            var token = Generate(volunteer);
            return Ok(new
            {
                token,
                role = "Volunteer"
            });
        }

        [HttpPost("refresh-token")]
        public IActionResult RefreshToken()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;

            if (identity == null || !identity.IsAuthenticated)
                return Unauthorized("User is not authenticated");

            var claims = identity.Claims;
            var userId = claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            var gmail = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var role = claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;

            if (userId == null || gmail == null || role == null)
                return BadRequest("Missing claims");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var newClaims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Email, gmail),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: newClaims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            string newJwt = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new { token = newJwt });
        }

        private string Generate(VolunteersDto volunteer)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, volunteer.Id.ToString()),
                new Claim(ClaimTypes.Email, volunteer.Gmail),
                new Claim(ClaimTypes.Role, "Volunteer")
            };

            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<VolunteersDto?> Authenticate(VolunteerLogin value)
        {
            var volunteers = await service.GetAllAsync();
            // כאן רצוי להשתמש בהצפנת סיסמאות / Hash בפועל
            return volunteers.FirstOrDefault(x => x.Gmail == value.Gmail && x.Password == value.Password);
        }
    }
}
