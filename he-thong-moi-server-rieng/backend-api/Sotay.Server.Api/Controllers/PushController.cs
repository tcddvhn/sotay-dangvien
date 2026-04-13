using Microsoft.AspNetCore.Mvc;
using Sotay.Server.Api.Models.Common;
using Sotay.Server.Api.Models.Push;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Controllers;

[ApiController]
[Route("api/push")]
public sealed class PushController(IPushService pushService) : ControllerBase
{
    [HttpGet("public-key")]
    public async Task<ActionResult<ApiEnvelope<PushPublicKeyDto>>> GetPublicKey(CancellationToken cancellationToken)
    {
        var data = await pushService.GetPublicKeyAsync(cancellationToken);
        return Ok(new ApiEnvelope<PushPublicKeyDto>(true, data));
    }

    [HttpPost("subscriptions/save")]
    public async Task<ActionResult<ApiEnvelope<PushSubscriptionResult>>> SaveSubscription(
        [FromBody] PushSubscriptionRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Endpoint) ||
            string.IsNullOrWhiteSpace(request.Keys?.P256dh) ||
            string.IsNullOrWhiteSpace(request.Keys?.Auth))
        {
            return BadRequest(new ApiEnvelope<PushSubscriptionResult>(false, null, "Thong tin subscription khong hop le."));
        }

        var data = await pushService.SaveSubscriptionAsync(request, cancellationToken);
        return Ok(new ApiEnvelope<PushSubscriptionResult>(true, data, "Luu dang ky thong bao day thanh cong."));
    }

    [HttpDelete("subscriptions")]
    public async Task<ActionResult<ApiEnvelope<object>>> DeleteSubscription(
        [FromBody] PushSubscriptionDeleteRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Endpoint))
        {
            return BadRequest(new ApiEnvelope<object>(false, null, "Endpoint khong hop le."));
        }

        var deleted = await pushService.DeleteSubscriptionAsync(request.Endpoint, cancellationToken);
        if (!deleted)
        {
            return NotFound(new ApiEnvelope<object>(false, null, "Khong tim thay subscription can xoa."));
        }

        return Ok(new ApiEnvelope<object>(true, null, "Da huy dang ky thong bao day."));
    }

    [HttpPost("send-notice")]
    public async Task<ActionResult<ApiEnvelope<PushSendResult>>> SendNotice(
        [FromBody] PushSendNoticeRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new ApiEnvelope<PushSendResult>(false, null, "Tieu de va noi dung thong bao khong duoc de trong."));
        }

        var data = await pushService.SendNoticeAsync(request, cancellationToken);
        return Ok(new ApiEnvelope<PushSendResult>(true, data, "Da gui thong bao day."));
    }
}
