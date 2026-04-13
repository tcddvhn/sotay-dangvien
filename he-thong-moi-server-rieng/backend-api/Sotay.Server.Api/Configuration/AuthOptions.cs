namespace Sotay.Server.Api.Configuration;

public sealed class AuthOptions
{
    public const string SectionName = "Auth";

    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    public string CookieName { get; set; } = "sotay_admin";

    public int AccessTokenMinutes { get; set; } = 60;
}
