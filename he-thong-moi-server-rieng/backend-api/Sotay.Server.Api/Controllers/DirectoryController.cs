using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Models.Directory;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Route("api/directory")]
public sealed class DirectoryController(IDirectoryService directoryService) : ControllerBase
{
    [HttpGet("tree")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<DirectoryUnitDto>>>> GetTree(CancellationToken cancellationToken)
    {
        var data = await directoryService.GetTreeAsync(cancellationToken);
        return Ok(new ApiEnvelope<IReadOnlyList<DirectoryUnitDto>>(true, data));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiEnvelope<DirectoryUnitDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var data = await directoryService.GetByIdAsync(id, cancellationToken);
        if (data is null)
        {
            return NotFound(new ApiEnvelope<DirectoryUnitDto>(false, null, "Không tìm thấy đơn vị."));
        }

        return Ok(new ApiEnvelope<DirectoryUnitDto>(true, data));
    }

    [HttpPost("save")]
    public async Task<ActionResult<ApiEnvelope<DirectoryUnitDto>>> Save(
        [FromBody] DirectoryUnitSaveRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new ApiEnvelope<DirectoryUnitDto>(false, null, "Tên đơn vị không được để trống."));
        }

        var data = await directoryService.SaveAsync(request, cancellationToken);
        return Ok(new ApiEnvelope<DirectoryUnitDto>(true, data, "Lưu đơn vị thành công."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiEnvelope<object>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await directoryService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return BadRequest(new ApiEnvelope<object>(false, null, "Không thể xóa đơn vị này. Có thể đơn vị không tồn tại hoặc còn đơn vị con."));
        }

        return Ok(new ApiEnvelope<object>(true, null, "Xóa đơn vị thành công."));
    }

    [HttpPost("tree/sync")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<DirectoryUnitDto>>>> SyncTree(
        [FromBody] DirectoryTreeSyncRequest request,
        CancellationToken cancellationToken)
    {
        var tree = request.Tree ?? Array.Empty<DirectoryTreeItem>();
        var data = await directoryService.SyncTreeAsync(request with { Tree = tree }, cancellationToken);
        return Ok(new ApiEnvelope<IReadOnlyList<DirectoryUnitDto>>(true, data, "Đồng bộ cây danh bạ thành công."));
    }
}
