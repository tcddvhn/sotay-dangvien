using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Auth;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Route("api/admin/auth")]
public sealed class AdminAuthController(IAdminAuthService adminAuthService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<ApiEnvelope<AdminLoginResult>>> Login(
        [FromBody] AdminLoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await adminAuthService.LoginAsync(request, cancellationToken);

        if (!result.Authenticated)
        {
            return Unauthorized(new ApiEnvelope<AdminLoginResult>(false, result, result.Message));
        }

        return Ok(new ApiEnvelope<AdminLoginResult>(true, result, result.Message));
    }
}
