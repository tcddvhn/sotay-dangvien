using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Models.Content;
using Sotay.Server.Api.Services;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Route("api/content")]
public sealed class ContentController(IContentService contentService) : ControllerBase
{
    [HttpGet("tree")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<ContentNodeDto>>>> GetTree(CancellationToken cancellationToken)
    {
        var data = await contentService.GetTreeAsync(cancellationToken);
        return Ok(new ApiEnvelope<IReadOnlyList<ContentNodeDto>>(true, data));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiEnvelope<ContentNodeDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var data = await contentService.GetByIdAsync(id, cancellationToken);
        if (data is null)
        {
            return NotFound(new ApiEnvelope<ContentNodeDto>(false, null, "Khong tim thay muc noi dung."));
        }

        return Ok(new ApiEnvelope<ContentNodeDto>(true, data));
    }

    [HttpPost("save")]
    [Authorize]
    public async Task<ActionResult<ApiEnvelope<ContentNodeDto>>> Save(
        [FromBody] ContentNodeSaveRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new ApiEnvelope<ContentNodeDto>(false, null, "Tieu de khong duoc de trong."));
        }

        try
        {
            var data = await contentService.SaveAsync(request, cancellationToken);
            return Ok(new ApiEnvelope<ContentNodeDto>(true, data, "Luu noi dung thanh cong."));
        }
        catch (ContentAuthenticationRequiredException ex)
        {
            return Unauthorized(new ApiEnvelope<ContentNodeDto>(false, null, ex.Message));
        }
        catch (ContentPermissionDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiEnvelope<ContentNodeDto>(false, null, ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ApiEnvelope<ContentNodeDto>(false, null, ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ApiEnvelope<object>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await contentService.DeleteAsync(id, cancellationToken);
            if (!deleted)
            {
                return BadRequest(new ApiEnvelope<object>(false, null, "Khong the xoa muc nay. Co the muc khong ton tai hoac con muc con."));
            }

            return Ok(new ApiEnvelope<object>(true, null, "Xoa noi dung thanh cong."));
        }
        catch (ContentAuthenticationRequiredException ex)
        {
            return Unauthorized(new ApiEnvelope<object>(false, null, ex.Message));
        }
        catch (ContentPermissionDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiEnvelope<object>(false, null, ex.Message));
        }
    }

    [HttpPost("tree/sync")]
    [Authorize]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<ContentNodeDto>>>> SyncTree(
        [FromBody] ContentTreeSyncRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var tree = request.Tree ?? Array.Empty<ContentNodeTreeItem>();
            var data = await contentService.SyncTreeAsync(request with { Tree = tree }, cancellationToken);
            return Ok(new ApiEnvelope<IReadOnlyList<ContentNodeDto>>(true, data, "Dong bo cay noi dung thanh cong."));
        }
        catch (ContentAuthenticationRequiredException ex)
        {
            return Unauthorized(new ApiEnvelope<IReadOnlyList<ContentNodeDto>>(false, null, ex.Message));
        }
        catch (ContentPermissionDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiEnvelope<IReadOnlyList<ContentNodeDto>>(false, null, ex.Message));
        }
    }
}
