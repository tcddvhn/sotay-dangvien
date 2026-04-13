namespace Sotay.Server.Api.Models.Push;

public sealed record PushSubscriptionResult(
    Guid Id,
    string Endpoint,
    string? BrowserName,
    string? DeviceLabel,
    string? UserKey,
    bool IsActive);
