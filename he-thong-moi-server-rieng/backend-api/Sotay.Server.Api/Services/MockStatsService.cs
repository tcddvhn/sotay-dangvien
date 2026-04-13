using Sotay.Server.Api.Models.Stats;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockStatsService : IStatsService
{
    private static readonly object Sync = new();

    private static readonly List<MockUsageEvent> Store =
    [
        new("visit", DateTime.UtcNow.AddDays(-6)),
        new("visit", DateTime.UtcNow.AddDays(-5)),
        new("visit", DateTime.UtcNow.AddDays(-4)),
        new("visit", DateTime.UtcNow.AddDays(-3)),
        new("visit", DateTime.UtcNow.AddDays(-2)),
        new("visit", DateTime.UtcNow.AddDays(-1)),
        new("visit", DateTime.UtcNow),
        new("search", DateTime.UtcNow),
        new("chatbot", DateTime.UtcNow)
    ];

    public Task<StatsDashboardDto> RecordAsync(StatsRecordRequest request, CancellationToken cancellationToken)
    {
        if (!string.Equals(request.ActionType, "none", StringComparison.OrdinalIgnoreCase))
        {
            lock (Sync)
            {
                Store.Add(new MockUsageEvent(NormalizeAction(request.ActionType), DateTime.UtcNow));
            }
        }

        return GetDashboardAsync(cancellationToken);
    }

    public Task<StatsDashboardDto> GetDashboardAsync(CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var today = DateTime.UtcNow.Date;
            var start = today.AddDays(-6);

            var totalVisits = Store.Count(x => x.ActionType == "visit");
            var todayVisits = Store.Count(x => x.ActionType == "visit" && x.CreatedAt.Date == today);
            var searchCount = Store.Count(x => x.ActionType == "search");
            var chatbotCount = Store.Count(x => x.ActionType == "chatbot");

            var daily = Enumerable.Range(0, 7)
                .Select(offset => start.AddDays(offset))
                .Select(date => new StatsDailyPointDto(
                    date.ToString("yyyy-MM-dd"),
                    Store.Count(x => x.ActionType == "visit" && x.CreatedAt.Date == date)))
                .ToList();

            return Task.FromResult(new StatsDashboardDto(totalVisits, todayVisits, searchCount, chatbotCount, daily));
        }
    }

    private static string NormalizeAction(string? actionType)
        => string.IsNullOrWhiteSpace(actionType)
            ? "unknown"
            : actionType.Trim().ToLowerInvariant();

    private sealed record MockUsageEvent(string ActionType, DateTime CreatedAt);
}
