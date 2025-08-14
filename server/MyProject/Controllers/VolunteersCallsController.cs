using Common.Dto;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace MyProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VolunteersCallsController : ControllerBase
    {
        private readonly IService<VolunteerCallsDto> service;
       public VolunteersCallsController(IService<VolunteerCallsDto> service)
        {
            this.service = service;
        }
        // GET: api/<VolunteersCallsController>
        [HttpGet]
        public List<VolunteerCallsDto> Get()
        {
            return service.GetAll();
        }

        // GET api/<VolunteerController>/5
        [HttpGet("{id}")]
        public VolunteerCallsDto Get(int id)
        {
            return service.GetById(id);

        }

        // POST api/<VolunteerController>
        [HttpPost]
        public VolunteerCallsDto Post([FromBody] VolunteerCallsDto value)
        {
            return service.AddItem(value);
        }

        // PUT api/<VolunteerController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] VolunteerCallsDto value)
        {
            service.UpdateItem(id, value);
        }

        // DELETE api/<VolunteerController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            service.DeleteItem(id);
        }
    }
}
