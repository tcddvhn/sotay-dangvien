namespace Sotay.Server.Api.Models.Stats;

public sealed record StatsRecordRequest(
    string ActionType,
    string? Detail,
    string? SessionKey,
    string? SourcePage,
    string? ClientIpHash,
    string? UserAgent);
