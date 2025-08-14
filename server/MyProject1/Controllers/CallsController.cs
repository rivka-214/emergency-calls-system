using Common.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using Service.Services;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MyProject1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CallsController : ControllerBase
    {
        private readonly ICallService _callService;
        private readonly IService<CallsDto> _service;
        private readonly IVolunteersCallLogic _volunteerCallService;

        public CallsController(ICallService callService, IService<CallsDto> service, IVolunteersCallLogic volunteerCallService)
        {
            _callService = callService;
            _service = service;
            _volunteerCallService = volunteerCallService;
        }

        [HttpGet]
        public async Task<ActionResult<List<CallsDto>>> Get()
        {
            try
            {
                var calls = await _callService.GetAllAsync();
                return Ok(calls);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CallsDto>> Get(int id)
        {
            try
            {
                var call = await _callService.GetByIdAsync(id);
                if (call == null)
                    return NotFound(new { error = "קריאה לא נמצאה" });
                return Ok(call);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<CallsDto>> Post([FromForm] CallsDto call)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var savedCall = await _callService.AddCallAsync(call, Request.Form.Files.FirstOrDefault());
                return Ok(savedCall);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] CallsDto value)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var existing = await _callService.GetByIdAsync(id);
                if (existing == null)
                    return NotFound(new { error = "קריאה לא נמצאה" });

                await _service.UpdateItemAsync(id, value);
                return NoContent();
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var existing = await _callService.GetByIdAsync(id);
                if (existing == null)
                    return NotFound(new { error = "קריאה לא נמצאה" });

                await _service.DeleteItemAsync(id);
                return NoContent();
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("status/{id}")]
        public async Task<ActionResult<string>> GetCallStatus(int id)
        {
            try
            {
                var status = await _callService.GetCallStatusWithVolunteersInfo(id);
                return Ok(new { status });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{callId}/assign-nearby")]
        public async Task<ActionResult> AssignNearbyVolunteers(int callId, [FromQuery] double locationX, [FromQuery] double locationY)
        {
            try
            {
                await _callService.AssignNearbyVolunteersToCall(callId, locationX, locationY);
                return Ok(new { message = "מתנדבים הוקצו בהצלחה" });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("by-user")]
        [Authorize]
        public async Task<ActionResult<List<CallsDto>>> GetCallsByUser()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"UserId from token: {userIdStr}");

            if (!int.TryParse(userIdStr, out int userId))
            {
                Console.WriteLine("Invalid UserId in token");
                return Unauthorized();
            }

            var calls = await _callService.GetCallsByUserId(userId);
            Console.WriteLine($"Found {calls.Count} calls for user.");

            return Ok(calls);
        }

        [HttpGet("{callId}/volunteers")]
        public async Task<ActionResult<List<VolunteersDto>>> GetTop20VolunteersForCall(int callId)
        {
            var volunteers = await _volunteerCallService.GetTop20VolunteersForCall(callId);
            if (!volunteers.Any())
                return NotFound(new { error = "לא נמצאו מתנדבים לקריאה זו" });
            return Ok(volunteers);
        }
    }
}
