namespace Sotay.Server.Api.Data.Entities;

public sealed class PushSubscriptionEntity
{
    public Guid Id { get; set; }

    public string EndpointUrl { get; set; } = string.Empty;

    public string P256dh { get; set; } = string.Empty;

    public string AuthSecret { get; set; } = string.Empty;

    public string? BrowserName { get; set; }

    public string? DeviceLabel { get; set; }

    public string? UserKey { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
