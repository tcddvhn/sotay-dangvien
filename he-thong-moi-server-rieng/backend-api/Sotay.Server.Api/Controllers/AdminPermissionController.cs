using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Auth;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Services;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/permissions")]
public sealed class AdminPermissionController(IAdminPermissionService adminPermissionService) : ControllerBase
{
    [HttpGet("users")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<AdminProfileDto>>>> GetAdminProfiles(CancellationToken cancellationToken)
    {
        try
        {
            var data = await adminPermissionService.GetAdminProfilesAsync(cancellationToken);
            return Ok(new ApiEnvelope<IReadOnlyList<AdminProfileDto>>(true, data));
        }
        catch (AdminPermissionAuthenticationRequiredException ex)
        {
            return Unauthorized(new ApiEnvelope<IReadOnlyList<AdminProfileDto>>(false, null, ex.Message));
        }
        catch (AdminPermissionDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiEnvelope<IReadOnlyList<AdminProfileDto>>(false, null, ex.Message));
        }
    }

    [HttpGet("users/{id:guid}")]
    public async Task<ActionResult<ApiEnvelope<AdminProfileDto>>> GetAdminProfile(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var data = await adminPermissionService.GetAdminProfileAsync(id, cancellationToken);
            if (data is null)
            {
                return NotFound(new ApiEnvelope<AdminProfileDto>(false, null, "Khong tim thay ho so tai khoan quan tri."));
            }

            return Ok(new ApiEnvelope<AdminProfileDto>(true, data));
        }
        catch (AdminPermissionAuthenticationRequiredException ex)
        {
            return Unauthorized(new ApiEnvelope<AdminProfileDto>(false, null, ex.Message));
        }
        catch (AdminPermissionDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiEnvelope<AdminProfileDto>(false, null, ex.Message));
        }
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiEnvelope<AdminProfileDto>>> GetCurrentAdminProfile(CancellationToken cancellationToken)
    {
        try
        {
            var data = await adminPermissionService.GetCurrentAdminProfileAsync(cancellationToken);
            if (data is null)
            {
                return NotFound(new ApiEnvelope<AdminProfileDto>(false, null, "Khong tim thay ho so tai khoan hien tai."));
            }

            return Ok(new ApiEnvelope<AdminProfileDto>(true, data));
        }
        catch (AdminPermissionAuthenticationRequiredException ex)
        {
            return Unauthorized(new ApiEnvelope<AdminProfileDto>(false, null, ex.Message));
        }
    }

    [HttpPost("users/save")]
    public async Task<ActionResult<ApiEnvelope<AdminProfileDto>>> SaveAdminProfile(
        [FromBody] AdminProfileSaveRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserName))
        {
            return BadRequest(new ApiEnvelope<AdminProfileDto>(false, null, "Username khong duoc de trong."));
        }

        try
        {
            var data = await adminPermissionService.SaveAdminProfileAsync(request, cancellationToken);
            return Ok(new ApiEnvelope<AdminProfileDto>(true, data, "Luu ho so tai khoan thanh cong."));
        }
        catch (AdminPermissionAuthenticationRequiredException ex)
        {
            return Unauthorized(new ApiEnvelope<AdminProfileDto>(false, null, ex.Message));
        }
        catch (AdminPermissionDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiEnvelope<AdminProfileDto>(false, null, ex.Message));
        }
    }

    [HttpGet("users/{adminUserId:guid}/content")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<ContentPermissionDto>>>> GetContentPermissions(
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        try
        {
            var data = await adminPermissionService.GetContentPermissionsAsync(adminUserId, cancellationToken);
            return Ok(new ApiEnvelope<IReadOnlyList<ContentPermissionDto>>(true, data));
        }
        catch (AdminPermissionAuthenticationRequiredException ex)
        {
            return Unauthorized(new ApiEnvelope<IReadOnlyList<ContentPermissionDto>>(false, null, ex.Message));
        }
        catch (AdminPermissionDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiEnvelope<IReadOnlyList<ContentPermissionDto>>(false, null, ex.Message));
        }
    }

    [HttpPost("content/save")]
    public async Task<ActionResult<ApiEnvelope<ContentPermissionDto>>> SaveContentPermission(
        [FromBody] ContentPermissionSaveRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var data = await adminPermissionService.SaveContentPermissionAsync(request, cancellationToken);
            return Ok(new ApiEnvelope<ContentPermissionDto>(true, data, "Luu quyen noi dung thanh cong."));
        }
        catch (AdminPermissionAuthenticationRequiredException ex)
        {
            return Unauthorized(new ApiEnvelope<ContentPermissionDto>(false, null, ex.Message));
        }
        catch (AdminPermissionDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiEnvelope<ContentPermissionDto>(false, null, ex.Message));
        }
    }

    [HttpDelete("content/{id:guid}")]
    public async Task<ActionResult<ApiEnvelope<object>>> DeleteContentPermission(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await adminPermissionService.DeleteContentPermissionAsync(id, cancellationToken);
            if (!deleted)
            {
                return NotFound(new ApiEnvelope<object>(false, null, "Khong tim thay quyen noi dung de xoa."));
            }

            return Ok(new ApiEnvelope<object>(true, null, "Xoa quyen noi dung thanh cong."));
        }
        catch (AdminPermissionAuthenticationRequiredException ex)
        {
            return Unauthorized(new ApiEnvelope<object>(false, null, ex.Message));
        }
        catch (AdminPermissionDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiEnvelope<object>(false, null, ex.Message));
        }
    }
}
