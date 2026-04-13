namespace Sotay.Server.Api.Models.Auth;

public sealed record AdminLoginResult(
    bool Authenticated,
    string? AccessToken,
    DateTimeOffset? ExpiresAt,
    string? DisplayName,
    string? Role,
    string? Message);
