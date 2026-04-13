using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Models.Survey;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Route("api/survey")]
public sealed class SurveyController(ISurveyService surveyService) : ControllerBase
{
    [HttpPost("submit")]
    public async Task<ActionResult<ApiEnvelope<SurveySubmitResult>>> Submit(
        [FromBody] SurveySubmitRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ResponseType))
        {
            return BadRequest(new ApiEnvelope<SurveySubmitResult>(false, null, "Loai phan hoi khong duoc de trong."));
        }

        if (string.IsNullOrWhiteSpace(request.RatingLabel) && string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new ApiEnvelope<SurveySubmitResult>(false, null, "Noi dung danh gia hoac gop y khong duoc de trong."));
        }

        var normalizedRequest = request with
        {
            ClientIpHash = HashClientIp(HttpContext.Connection.RemoteIpAddress?.ToString()),
            UserAgent = Request.Headers.UserAgent.ToString()
        };

        var data = await surveyService.SubmitAsync(normalizedRequest, cancellationToken);
        return Ok(new ApiEnvelope<SurveySubmitResult>(true, data, "Ghi nhan phan hoi thanh cong."));
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
