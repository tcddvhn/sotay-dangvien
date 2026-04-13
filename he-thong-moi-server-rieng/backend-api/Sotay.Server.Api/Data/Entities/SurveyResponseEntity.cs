namespace Sotay.Server.Api.Data.Entities;

public sealed class SurveyResponseEntity
{
    public Guid Id { get; set; }

    public string ResponseType { get; set; } = string.Empty;

    public string? RatingLabel { get; set; }

    public string? Content { get; set; }

    public string? SourcePage { get; set; }

    public string? ClientIpHash { get; set; }

    public string? UserAgent { get; set; }

    public DateTime SubmittedAt { get; set; }
}
