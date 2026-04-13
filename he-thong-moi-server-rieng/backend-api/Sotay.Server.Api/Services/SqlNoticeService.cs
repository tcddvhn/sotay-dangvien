using Microsoft.EntityFrameworkCore;
using Sotay.Server.Api.Data;
using Sotay.Server.Api.Data.Entities;
using Sotay.Server.Api.Models.Notice;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class SqlNoticeService(ApplicationDbContext dbContext) : INoticeService
{
    public async Task<IReadOnlyList<NoticeDto>> GetLatestAsync(int take, CancellationToken cancellationToken)
    {
        var size = Math.Clamp(take, 1, 20);
        var items = await dbContext.Notices
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderByDescending(x => x.PublishedAt)
            .ThenByDescending(x => x.CreatedAt)
            .Take(size)
            .ToListAsync(cancellationToken);

        return items.Select(Map).ToList();
    }

    public async Task<NoticeDto> SaveAsync(NoticeSaveRequest request, CancellationToken cancellationToken)
    {
        var entity = request.Id.HasValue
            ? await dbContext.Notices.FirstOrDefaultAsync(x => x.Id == request.Id.Value, cancellationToken)
            : null;

        var isNew = entity is null;
        entity ??= new NoticeEntity
        {
            Id = request.Id ?? Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.UpdatedBy
        };

        entity.Title = request.Title.Trim();
        entity.Content = request.Content.Trim();
        entity.IsPublic = request.IsPublic;
        entity.PublishedAt = request.PublishedAt ?? DateTime.UtcNow;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = request.UpdatedBy;

        if (isNew)
        {
            dbContext.Notices.Add(entity);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    private static NoticeDto Map(NoticeEntity entity)
        => new(
            entity.Id,
            entity.Title,
            entity.Content,
            entity.IsPublic,
            entity.PublishedAt,
            entity.CreatedAt,
            entity.IsActive);
}
