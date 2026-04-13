namespace Sotay.Server.Api.Models.Stats;

public sealed record StatsDashboardDto(
    int TotalVisits,
    int Today,
    int SearchCount,
    int ChatbotCount,
    IReadOnlyList<StatsDailyPointDto> Daily);

public sealed record StatsDailyPointDto(
    string Date,
    int Visits);
