using Sotay.Server.Api.Models.Notice;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockNoticeService : INoticeService
{
    private static readonly object Sync = new();

    private static readonly List<NoticeState> Store =
    [
        new()
        {
            Id = Guid.Parse("dddddddd-dddd-dddd-dddd-ddddddddddd1"),
            Title = "Thong bao mau",
            Content = "Day la thong bao mau de test frontend moi.",
            IsPublic = true,
            PublishedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        }
    ];

    public Task<IReadOnlyList<NoticeDto>> GetLatestAsync(int take, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var items = Store
                .Where(x => x.IsActive)
                .OrderByDescending(x => x.PublishedAt)
                .ThenByDescending(x => x.CreatedAt)
                .Take(Math.Clamp(take, 1, 20))
                .Select(Map)
                .ToList();

            return Task.FromResult<IReadOnlyList<NoticeDto>>(items);
        }
    }

    public Task<NoticeDto> SaveAsync(NoticeSaveRequest request, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var item = request.Id.HasValue
                ? Store.FirstOrDefault(x => x.Id == request.Id.Value)
                : null;

            if (item is null)
            {
                item = new NoticeState
                {
                    Id = request.Id ?? Guid.NewGuid(),
                    CreatedAt = DateTime.UtcNow
                };
                Store.Add(item);
            }

            item.Title = request.Title.Trim();
            item.Content = request.Content.Trim();
            item.IsPublic = request.IsPublic;
            item.PublishedAt = request.PublishedAt ?? DateTime.UtcNow;
            item.IsActive = request.IsActive;

            return Task.FromResult(Map(item));
        }
    }

    private static NoticeDto Map(NoticeState item)
        => new(
            item.Id,
            item.Title,
            item.Content,
            item.IsPublic,
            item.PublishedAt,
            item.CreatedAt,
            item.IsActive);

    private sealed class NoticeState
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public bool IsPublic { get; set; }

        public DateTime PublishedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        public bool IsActive { get; set; }
    }
}
