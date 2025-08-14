using Common.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Service.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;


// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly IService<UserDto> service;
        private readonly IConfiguration config;
        // GET: api/<LoginController>

        public LoginController(IService<UserDto> service, IConfiguration config)
        {
            this.service = service;
            this.config = config;
        }
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<LoginController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<LoginController>
        [HttpPost]
        public UserDto Post([FromBody] UserDto value)
        {
            // הצפנה של הסיסמה לפני השמירה
            value.password = BCrypt.Net.BCrypt.HashPassword(value.password);

            return service.AddItem(value);
        }


        [HttpPost("/login")]
   
        public IActionResult Login([FromBody] UserLogin value)
        {
            var user = Authenticate(value);
            if (user == null)
            {
                return Unauthorized("Invalid credentials");
            }

            var token = Generate(user);
            return Ok(token);
        }

        private string Generate(UserDto user)
        {

            var securitykey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
            var credentials = new SigningCredentials(securitykey, SecurityAlgorithms.HmacSha256);
            var claims = new[] {
            new Claim(ClaimTypes.NameIdentifier,user.password),
            new Claim(ClaimTypes.Email,user.Gmail),
            //new Claim(ClaimTypes.Name,user.Name),
          //  new Claim(ClaimTypes.Role,user.Role),
            //new Claim(ClaimTypes.GivenName,user.Name)
            };
            var token = new JwtSecurityToken(config["Jwt:Issuer"], config["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: credentials);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        //    private UserDto Authenticate(UserDto value)
        //{
        //    // חיפוש המשתמש במערכת לפי המייל
        //    UserDto user = service.GetAll().FirstOrDefault(x => x.Gmail == value.Gmail);

        //    // אם המשתמש נמצא, בודקים אם הסיסמה תואמת
        //    if (user != null && BCrypt.Net.BCrypt.Verify(value.password, user.password))  // השוואת סיסמאות מוצפנות
        //    {
        //        return user;
        //    }

        //    return null;
        //}
        private UserDto Authenticate(UserLogin value)
        {
            UserDto user = service.GetAll().FirstOrDefault(x => x.password == value.password && x.Gmail == value.Gmail);
            if (user != null)
                return user;
            return null;
        }



    }
}
