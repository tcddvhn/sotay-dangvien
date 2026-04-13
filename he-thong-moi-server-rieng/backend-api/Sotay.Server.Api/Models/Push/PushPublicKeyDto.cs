namespace Sotay.Server.Api.Models.Push;

public sealed record PushPublicKeyDto(
    bool Enabled,
    string? PublicKey,
    string? DefaultClickUrl);
