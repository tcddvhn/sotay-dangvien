using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Models.Content;
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
            return NotFound(new ApiEnvelope<ContentNodeDto>(false, null, "Không tìm thấy mục nội dung."));
        }

        return Ok(new ApiEnvelope<ContentNodeDto>(true, data));
    }

    [HttpPost("save")]
    public async Task<ActionResult<ApiEnvelope<ContentNodeDto>>> Save(
        [FromBody] ContentNodeSaveRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new ApiEnvelope<ContentNodeDto>(false, null, "Tiêu đề không được để trống."));
        }

        var data = await contentService.SaveAsync(request, cancellationToken);
        return Ok(new ApiEnvelope<ContentNodeDto>(true, data, "Lưu nội dung thành công."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiEnvelope<object>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await contentService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return BadRequest(new ApiEnvelope<object>(false, null, "Không thể xóa mục này. Có thể mục không tồn tại hoặc còn mục con."));
        }

        return Ok(new ApiEnvelope<object>(true, null, "Xóa nội dung thành công."));
    }
}
