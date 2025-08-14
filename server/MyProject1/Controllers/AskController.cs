
using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;

[ApiController]
[Route("api/[controller]")]
public class AskController : ControllerBase
{
    private readonly IAssistantService _assistantService;

    public AskController(IAssistantService assistantService)
    {
        _assistantService = assistantService;
    }

    [HttpPost("first-aid")]
    public async Task<IActionResult> GetFirstAid([FromBody] string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            return BadRequest("חסר תיאור");

        var instructions = await _assistantService.GetFirstAidInstructionsAsync(description);
        return Ok(new { instructions });
    }
   
}

