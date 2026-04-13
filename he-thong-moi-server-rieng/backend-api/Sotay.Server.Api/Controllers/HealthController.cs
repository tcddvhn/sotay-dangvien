using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Common;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<ApiEnvelope<object>> Get()
    {
        var payload = new
        {
            service = "Sotay.Server.Api",
            status = "ok",
            utcNow = DateTimeOffset.UtcNow
        };

        return Ok(new ApiEnvelope<object>(true, payload));
    }
}
