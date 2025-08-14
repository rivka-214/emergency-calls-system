using Common.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using Service.Services;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MyProject1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Volunteer")]
    public class VolunteersCallsController : ControllerBase
    {
        private readonly IService<VolunteerCallsDto> _service;
        private readonly IVolunteersCallLogic _volunteerCallService;

        public VolunteersCallsController(
            IService<VolunteerCallsDto> service,
            IVolunteersCallLogic volunteerCallService)
        {
            _service = service;
            _volunteerCallService = volunteerCallService;
        }

        [HttpGet]
        public async Task<ActionResult<List<VolunteerCallsDto>>> Get()
        {
            var calls = await _service.GetAllAsync();
            return Ok(calls);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VolunteerCallsDto>> Get(int id)
        {
            var call = await _service.GetByIdAsync(id);
            if (call == null)
                return NotFound(new { error = "קריאה לא נמצאה" });
            return Ok(call);
        }

        [HttpPost]
        public async Task<ActionResult<VolunteerCallsDto>> Post([FromBody] VolunteerCallsDto value)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // דוגמה לבדיקה פשוטה, למשל שוודא ש-VolunteerId קיים והוגדר
            if (value.VolunteerId <= 0)
                return BadRequest("מספר מתנדב לא תקין.");

            try
            {
                var created = await _service.AddItemAsync(value);
                return Ok(created);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] VolunteerCallsDto value)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

          

            try
            {
                var existing = await _service.GetByIdAsync(id);
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

        [HttpPut("{callId}/{volunteerId}/status")]
        public async Task<ActionResult> UpdateVolunteerStatus(int callId, int volunteerId, [FromBody] UpdateVolunteerStatusDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(request.Status))
                return BadRequest("סטטוס לא יכול להיות ריק.");

            try
            {
                var currentVolunteerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                await _volunteerCallService.UpdateVolunteerStatus(callId, volunteerId, request.Status, currentVolunteerId);
                return Ok(new { message = "סטטוס עודכן בהצלחה" });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{callId:int}/{volunteerId:int}/complete")]
        [Authorize(Roles = "Volunteer")]
        public async Task<IActionResult> CompleteCall(int callId, int volunteerId, [FromBody] CompleteCallDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // כאן אפשר להוסיף בדיקות תקינות לפי שדות ב-CompleteCallDto

            try
            {
                int currentVolunteerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                await _volunteerCallService.CompleteCallAsync(callId, volunteerId, currentVolunteerId, dto);
                return Ok(new { message = "הקריאה נסגרה בהצלחה" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var existing = await _service.GetByIdAsync(id);
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

        [HttpGet("active/{volunteerId}")]
        public async Task<ActionResult<List<VolunteerCallsDto>>> GetActiveCalls(int volunteerId)
        {
            try
            {
                var activeCalls = await _volunteerCallService.GetActiveCallsForVolunteer(volunteerId);
                return Ok(activeCalls);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        [HttpGet("notified/{volunteerId}")]
        public async Task<ActionResult<List<VolunteerCallsDto>>> GetnotifiedCalls(int volunteerId)
        {
            try
            {
                var activeCalls = await _volunteerCallService.GetNotifiedCallsForVolunteer(volunteerId);
                return Ok(activeCalls);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("history/{volunteerId}")]
        public async Task<ActionResult<List<VolunteerCallsDto>>> GetHistoryCalls(int volunteerId)
        {
            try
            {
                var historyCalls = await _volunteerCallService.GetHistoryCallsForVolunteer(volunteerId);
                return Ok(historyCalls);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

    
    //    אינפומציה על הקיראה
        [HttpGet("{callId}/info")]
        public async Task<ActionResult<CallVolunteersInfoDto>> GetCallVolunteersInfo(int callId)
        {
            try
            {
                var info = await _volunteerCallService.GetCallVolunteersInfo(callId);
                return Ok(info);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
//קבלת כל הקריאות למתנדב מסיום
        [HttpGet("by-volunteer/{volunteerId}")]
        public async Task<ActionResult<List<VolunteerCallsDto>>> GetCallsByVolunteer(int volunteerId)
        {
            try
            {
                var allCalls = await _service.GetAllAsync();
                var filtered = allCalls
                    .Where(vc => vc.VolunteerId == volunteerId)
                    .ToList();
                return Ok(filtered);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
     
    }
}