using Sotay.Server.Api.Models.Push;

namespace Sotay.Server.Api.Services.Interfaces;

public interface IPushService
{
    Task<PushPublicKeyDto> GetPublicKeyAsync(CancellationToken cancellationToken);

    Task<PushSubscriptionResult> SaveSubscriptionAsync(PushSubscriptionRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteSubscriptionAsync(string endpoint, CancellationToken cancellationToken);

    Task<PushSendResult> SendNoticeAsync(PushSendNoticeRequest request, CancellationToken cancellationToken);
}
