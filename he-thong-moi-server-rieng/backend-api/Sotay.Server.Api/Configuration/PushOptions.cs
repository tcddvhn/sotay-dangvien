namespace Sotay.Server.Api.Configuration;

public sealed class PushOptions
{
    public const string SectionName = "Push";

    public bool Enabled { get; set; }

    public string? Subject { get; set; }

    public string? PublicKey { get; set; }

    public string? PrivateKey { get; set; }

    public string? DefaultClickUrl { get; set; }
}
