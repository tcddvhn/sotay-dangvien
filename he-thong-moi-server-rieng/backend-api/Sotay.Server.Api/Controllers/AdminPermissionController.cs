using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Auth;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Route("api/admin/permissions")]
public sealed class AdminPermissionController(IAdminPermissionService adminPermissionService) : ControllerBase
{
    [HttpGet("users")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<AdminProfileDto>>>> GetAdminProfiles(CancellationToken cancellationToken)
    {
        var data = await adminPermissionService.GetAdminProfilesAsync(cancellationToken);
        return Ok(new ApiEnvelope<IReadOnlyList<AdminProfileDto>>(true, data));
    }

    [HttpGet("users/{id:guid}")]
    public async Task<ActionResult<ApiEnvelope<AdminProfileDto>>> GetAdminProfile(Guid id, CancellationToken cancellationToken)
    {
        var data = await adminPermissionService.GetAdminProfileAsync(id, cancellationToken);
        if (data is null)
        {
            return NotFound(new ApiEnvelope<AdminProfileDto>(false, null, "Không tìm thấy hồ sơ tài khoản quản trị."));
        }

        return Ok(new ApiEnvelope<AdminProfileDto>(true, data));
    }

    [HttpPost("users/save")]
    public async Task<ActionResult<ApiEnvelope<AdminProfileDto>>> SaveAdminProfile(
        [FromBody] AdminProfileSaveRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserName))
        {
            return BadRequest(new ApiEnvelope<AdminProfileDto>(false, null, "Username không được để trống."));
        }

        var data = await adminPermissionService.SaveAdminProfileAsync(request, cancellationToken);
        return Ok(new ApiEnvelope<AdminProfileDto>(true, data, "Lưu hồ sơ tài khoản thành công."));
    }

    [HttpGet("users/{adminUserId:guid}/content")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<ContentPermissionDto>>>> GetContentPermissions(
        Guid adminUserId,
        CancellationToken cancellationToken)
    {
        var data = await adminPermissionService.GetContentPermissionsAsync(adminUserId, cancellationToken);
        return Ok(new ApiEnvelope<IReadOnlyList<ContentPermissionDto>>(true, data));
    }

    [HttpPost("content/save")]
    public async Task<ActionResult<ApiEnvelope<ContentPermissionDto>>> SaveContentPermission(
        [FromBody] ContentPermissionSaveRequest request,
        CancellationToken cancellationToken)
    {
        var data = await adminPermissionService.SaveContentPermissionAsync(request, cancellationToken);
        return Ok(new ApiEnvelope<ContentPermissionDto>(true, data, "Lưu quyền nội dung thành công."));
    }

    [HttpDelete("content/{id:guid}")]
    public async Task<ActionResult<ApiEnvelope<object>>> DeleteContentPermission(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await adminPermissionService.DeleteContentPermissionAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new ApiEnvelope<object>(false, null, "Không tìm thấy quyền nội dung để xóa."));
        }

        return Ok(new ApiEnvelope<object>(true, null, "Xóa quyền nội dung thành công."));
    }
}
