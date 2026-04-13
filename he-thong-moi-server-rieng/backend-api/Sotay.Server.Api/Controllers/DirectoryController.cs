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
}
