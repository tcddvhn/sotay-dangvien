using Sotay.Server.Api.Models.Stats;

namespace Sotay.Server.Api.Services.Interfaces;

public interface IStatsService
{
    Task<StatsDashboardDto> RecordAsync(StatsRecordRequest request, CancellationToken cancellationToken);

    Task<StatsDashboardDto> GetDashboardAsync(CancellationToken cancellationToken);
}
