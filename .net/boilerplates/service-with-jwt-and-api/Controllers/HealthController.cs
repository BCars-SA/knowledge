using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
public class HealthController : ControllerBase
{
    protected readonly IConfiguration _configuration;

    public HealthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [ApiVersion("1.0")]
    [Route("health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [HttpGet]
    public IActionResult GetV2()
    {
        return Ok();
    }
}
