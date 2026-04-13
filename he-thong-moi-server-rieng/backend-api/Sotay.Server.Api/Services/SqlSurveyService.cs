using Sotay.Server.Api.Data;
using Sotay.Server.Api.Data.Entities;
using Sotay.Server.Api.Models.Survey;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class SqlSurveyService(ApplicationDbContext dbContext) : ISurveyService
{
    public async Task<SurveySubmitResult> SubmitAsync(SurveySubmitRequest request, CancellationToken cancellationToken)
    {
        var entity = new SurveyResponseEntity
        {
            Id = Guid.NewGuid(),
            ResponseType = request.ResponseType,
            RatingLabel = request.RatingLabel,
            Content = request.Content,
            SourcePage = request.SourcePage,
            ClientIpHash = request.ClientIpHash,
            UserAgent = request.UserAgent,
            SubmittedAt = DateTime.UtcNow
        };

        dbContext.SurveyResponses.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new SurveySubmitResult(
            entity.Id,
            entity.ResponseType,
            entity.RatingLabel,
            entity.Content,
            entity.SourcePage,
            entity.SubmittedAt);
    }
}
