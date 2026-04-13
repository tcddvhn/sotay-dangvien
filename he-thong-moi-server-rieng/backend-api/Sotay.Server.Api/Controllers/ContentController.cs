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
}
