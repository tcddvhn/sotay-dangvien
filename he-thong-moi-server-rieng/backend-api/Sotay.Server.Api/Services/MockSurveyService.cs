using Sotay.Server.Api.Models.Survey;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockSurveyService : ISurveyService
{
    private static readonly object Sync = new();

    private static readonly List<SurveySubmitResult> Store = [];

    public Task<SurveySubmitResult> SubmitAsync(SurveySubmitRequest request, CancellationToken cancellationToken)
    {
        var result = new SurveySubmitResult(
            Guid.NewGuid(),
            request.ResponseType,
            request.RatingLabel,
            request.Content,
            request.SourcePage,
            DateTime.UtcNow);

        lock (Sync)
        {
            Store.Add(result);
        }

        return Task.FromResult(result);
    }
}
