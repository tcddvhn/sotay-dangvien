using Microsoft.Extensions.Options;
using Sotay.Server.Api.Configuration;
using Sotay.Server.Api.Models.Push;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockPushService(IOptions<PushOptions> pushOptions) : IPushService
{
    private static readonly object Sync = new();

    private static readonly List<PushSubscriptionResult> Store = [];

    public Task<PushPublicKeyDto> GetPublicKeyAsync(CancellationToken cancellationToken)
    {
        var options = pushOptions.Value;
        return Task.FromResult(new PushPublicKeyDto(
            options.Enabled && !string.IsNullOrWhiteSpace(options.PublicKey),
            options.PublicKey,
            options.DefaultClickUrl));
    }

    public Task<PushSubscriptionResult> SaveSubscriptionAsync(PushSubscriptionRequest request, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var existing = Store.FirstOrDefault(x => string.Equals(x.Endpoint, request.Endpoint, StringComparison.Ordinal));
            if (existing is not null)
            {
                Store.Remove(existing);
            }

            var result = new PushSubscriptionResult(
                Guid.NewGuid(),
                request.Endpoint,
                request.BrowserName,
                request.DeviceLabel,
                request.UserKey,
                true);

            Store.Add(result);
            return Task.FromResult(result);
        }
    }

    public Task<bool> DeleteSubscriptionAsync(string endpoint, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var existing = Store.FirstOrDefault(x => string.Equals(x.Endpoint, endpoint, StringComparison.Ordinal));
            if (existing is null)
            {
                return Task.FromResult(false);
            }

            Store.Remove(existing);
            return Task.FromResult(true);
        }
    }

    public Task<PushSendResult> SendNoticeAsync(PushSendNoticeRequest request, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var active = Store.Count(x => x.IsActive);
            return Task.FromResult(new PushSendResult(active, active, 0));
        }
    }
}
