using Common.Dto;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VolunteerController : ControllerBase
    {
        private readonly IService<VolunteersDto> service;
        public VolunteerController(IService<VolunteersDto> service)
        {
            this.service = service;
        }   
        // GET: api/<VolunteerController>
        [HttpGet]
        public List<VolunteersDto> Get()
        {
            return service.GetAll();
        }

        // GET api/<VolunteerController>/5
        [HttpGet("{id}")]
        public VolunteersDto Get(int id)
        {
            return service.GetById(id); 

        }

        // POST api/<VolunteerController>
        [HttpPost]
        public VolunteersDto Post([FromBody] VolunteersDto value)
        {
            return service.AddItem(value);
        }

        // PUT api/<VolunteerController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] VolunteersDto value)
        {
            service.UpdateItem(id, value);
        }

        // DELETE api/<VolunteerController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
