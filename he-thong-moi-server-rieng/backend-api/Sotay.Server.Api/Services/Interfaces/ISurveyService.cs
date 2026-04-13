using Sotay.Server.Api.Models.Survey;

namespace Sotay.Server.Api.Services.Interfaces;

public interface ISurveyService
{
    Task<SurveySubmitResult> SubmitAsync(SurveySubmitRequest request, CancellationToken cancellationToken);
}
