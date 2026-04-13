using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Models.Notice;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Route("api/notices")]
public sealed class NoticesController(INoticeService noticeService) : ControllerBase
{
    [HttpGet("latest")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyList<NoticeDto>>>> GetLatest(
        [FromQuery] int take = 5,
        CancellationToken cancellationToken = default)
    {
        var data = await noticeService.GetLatestAsync(take, cancellationToken);
        return Ok(new ApiEnvelope<IReadOnlyList<NoticeDto>>(true, data));
    }

    [HttpPost("save")]
    public async Task<ActionResult<ApiEnvelope<NoticeDto>>> Save(
        [FromBody] NoticeSaveRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new ApiEnvelope<NoticeDto>(false, null, "Tieu de thong bao khong duoc de trong."));
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new ApiEnvelope<NoticeDto>(false, null, "Noi dung thong bao khong duoc de trong."));
        }

        var data = await noticeService.SaveAsync(request, cancellationToken);
        return Ok(new ApiEnvelope<NoticeDto>(true, data, "Luu thong bao thanh cong."));
    }
}
