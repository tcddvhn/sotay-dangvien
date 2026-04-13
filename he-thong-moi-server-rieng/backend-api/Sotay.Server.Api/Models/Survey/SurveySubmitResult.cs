namespace Sotay.Server.Api.Models.Survey;

public sealed record SurveySubmitResult(
    Guid Id,
    string ResponseType,
    string? RatingLabel,
    string? Content,
    string? SourcePage,
    DateTime SubmittedAt);
