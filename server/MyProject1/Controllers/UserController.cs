using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Common.Dto;
using Service.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MyProject1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserServicecs _service;
        private readonly IConfiguration _config;
       
        public UserController(IUserServicecs service, IConfiguration config)
        {
            _service = service;
            _config = config;
        }

        [HttpGet]
        public async Task<List<UserDto>> Get()
        {
            return await _service.GetAllAsync();
        }

        [HttpGet("{id}")]
        public async Task<UserDto> Get(int id)
        {
            return await _service.GetByIdAsync(id);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UserDto user)
        {
            if (await _service.GmailExistsAsync(user.Gmail))
            {
                return BadRequest("משתמש עם האימייל הזה כבר קיים.");
            }

            if (string.IsNullOrEmpty(user.Role))
                user.Role = "User";

            var createdUser = await _service.AddItemAsync(user);

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, createdUser.Gmail),
                new Claim(ClaimTypes.NameIdentifier, createdUser.Id.ToString()),
                new Claim(ClaimTypes.Role, createdUser.Role ?? "User")
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMonths(1),
                signingCredentials: credentials
            );

            string jwtToken = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = jwtToken,
                role = createdUser.Role
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] UserDto value)
        {
            await _service.UpdateItemAsync(id, value);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteItemAsync(id);
            return NoContent();
        }

        [HttpGet("exists")]
        public async Task<IActionResult> Exists([FromQuery] string gmail)
        {
            var users = await _service.GetAllAsync();
            bool exists = users.Any(u => u.Gmail.Equals(gmail, StringComparison.OrdinalIgnoreCase));
            return Ok(new { exists });
        }
    }
}
