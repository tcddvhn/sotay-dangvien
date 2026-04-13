namespace Sotay.Server.Api.Models.Push;

public sealed record PushSubscriptionRequest(
    string Endpoint,
    PushSubscriptionKeysRequest Keys,
    string? BrowserName,
    string? DeviceLabel,
    string? UserKey);

public sealed record PushSubscriptionKeysRequest(
    string P256dh,
    string Auth);
