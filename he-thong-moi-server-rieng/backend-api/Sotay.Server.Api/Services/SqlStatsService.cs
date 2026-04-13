using Microsoft.EntityFrameworkCore;
using Sotay.Server.Api.Data;
using Sotay.Server.Api.Data.Entities;
using Sotay.Server.Api.Models.Stats;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class SqlStatsService(ApplicationDbContext dbContext) : IStatsService
{
    public async Task<StatsDashboardDto> RecordAsync(StatsRecordRequest request, CancellationToken cancellationToken)
    {
        if (!string.Equals(request.ActionType, "none", StringComparison.OrdinalIgnoreCase))
        {
            dbContext.UsageEvents.Add(new UsageEventEntity
            {
                Id = Guid.NewGuid(),
                ActionType = NormalizeAction(request.ActionType),
                Detail = request.Detail,
                SessionKey = request.SessionKey,
                SourcePage = request.SourcePage,
                ClientIpHash = request.ClientIpHash,
                UserAgent = request.UserAgent,
                CreatedAt = DateTime.UtcNow
            });

            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return await GetDashboardAsync(cancellationToken);
    }

    public async Task<StatsDashboardDto> GetDashboardAsync(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var today = now.Date;
        var start = today.AddDays(-6);

        var visitCount = await dbContext.UsageEvents.CountAsync(
            x => x.ActionType == "visit",
            cancellationToken);

        var todayVisits = await dbContext.UsageEvents.CountAsync(
            x => x.ActionType == "visit" && x.CreatedAt >= today,
            cancellationToken);

        var searchCount = await dbContext.UsageEvents.CountAsync(
            x => x.ActionType == "search",
            cancellationToken);

        var chatbotCount = await dbContext.UsageEvents.CountAsync(
            x => x.ActionType == "chatbot",
            cancellationToken);

        var dailyVisitsRaw = await dbContext.UsageEvents
            .AsNoTracking()
            .Where(x => x.ActionType == "visit" && x.CreatedAt >= start)
            .ToListAsync(cancellationToken);

        var visitsByDay = dailyVisitsRaw
            .GroupBy(x => x.CreatedAt.Date)
            .ToDictionary(g => g.Key, g => g.Count());

        var daily = Enumerable.Range(0, 7)
            .Select(offset => start.AddDays(offset))
            .Select(date => new StatsDailyPointDto(
                date.ToString("yyyy-MM-dd"),
                visitsByDay.TryGetValue(date, out var count) ? count : 0))
            .ToList();

        return new StatsDashboardDto(visitCount, todayVisits, searchCount, chatbotCount, daily);
    }

    private static string NormalizeAction(string? actionType)
    {
        if (string.IsNullOrWhiteSpace(actionType))
        {
            return "unknown";
        }

        return actionType.Trim().ToLowerInvariant();
    }
}
