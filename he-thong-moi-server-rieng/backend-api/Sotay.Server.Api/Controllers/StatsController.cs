using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Models.Stats;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Route("api/stats")]
public sealed class StatsController(IStatsService statsService) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiEnvelope<StatsDashboardDto>>> GetDashboard(CancellationToken cancellationToken)
    {
        var data = await statsService.GetDashboardAsync(cancellationToken);
        return Ok(new ApiEnvelope<StatsDashboardDto>(true, data));
    }

    [HttpPost("record")]
    public async Task<ActionResult<ApiEnvelope<StatsDashboardDto>>> Record(
        [FromBody] StatsRecordRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ActionType))
        {
            return BadRequest(new ApiEnvelope<StatsDashboardDto>(false, null, "Loai su kien thong ke khong duoc de trong."));
        }

        var normalizedRequest = request with
        {
            ClientIpHash = HashClientIp(HttpContext.Connection.RemoteIpAddress?.ToString()),
            UserAgent = Request.Headers.UserAgent.ToString()
        };

        var data = await statsService.RecordAsync(normalizedRequest, cancellationToken);
        return Ok(new ApiEnvelope<StatsDashboardDto>(true, data));
    }

    private static string? HashClientIp(string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress))
        {
            return null;
        }

        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(ipAddress.Trim()));
        return Convert.ToHexString(bytes);
    }
}
