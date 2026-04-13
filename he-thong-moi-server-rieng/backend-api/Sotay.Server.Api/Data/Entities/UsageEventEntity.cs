namespace Sotay.Server.Api.Data.Entities;

public sealed class UsageEventEntity
{
    public Guid Id { get; set; }

    public string ActionType { get; set; } = string.Empty;

    public string? Detail { get; set; }

    public string? SessionKey { get; set; }

    public string? SourcePage { get; set; }

    public string? ClientIpHash { get; set; }

    public string? UserAgent { get; set; }

    public DateTime CreatedAt { get; set; }
}
