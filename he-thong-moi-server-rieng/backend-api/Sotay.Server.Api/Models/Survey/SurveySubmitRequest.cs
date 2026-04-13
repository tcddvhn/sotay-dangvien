namespace Sotay.Server.Api.Models.Survey;

public sealed record SurveySubmitRequest(
    string ResponseType,
    string? RatingLabel,
    string? Content,
    string? SourcePage,
    string? ClientIpHash,
    string? UserAgent);
