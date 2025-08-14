using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using Common.Dto;

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IService<UserDto> service;

        public UserController(IService<UserDto> service)
        {
            this.service = service;
        }

        [HttpGet]
        public List<UserDto> Get()
        {
            return service.GetAll();
        }

        [HttpGet("{id}")]
        public UserDto Get(int id)
        {
            return service.GetById(id);
        }

        [HttpPost]
        public UserDto Post([FromBody] UserDto user)
        {
            return service.AddItem(user);
        }

        [HttpPut("{id}")]
        public void Put(int id, [FromBody] UserDto value)
        {
            service.UpdateItem(id, value);
        }

        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            service.DeleteItem(id);
        }
    }
}
