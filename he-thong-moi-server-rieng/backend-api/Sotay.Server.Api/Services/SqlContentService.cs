using Microsoft.EntityFrameworkCore;
using Sotay.Server.Api.Data;
using Sotay.Server.Api.Data.Entities;
using Sotay.Server.Api.Models.Content;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class SqlContentService(ApplicationDbContext dbContext) : IContentService
{
    public async Task<IReadOnlyList<ContentNodeDto>> GetTreeAsync(CancellationToken cancellationToken)
    {
        var nodes = await dbContext.ContentNodes
            .AsNoTracking()
            .OrderBy(x => x.Level)
            .ThenBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .ToListAsync(cancellationToken);

        return BuildTree(nodes, parentId: null);
    }

    public async Task<ContentNodeDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await dbContext.ContentNodes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return item is null ? null : MapSingle(item);
    }

    public async Task<ContentNodeDto> SaveAsync(ContentNodeSaveRequest request, CancellationToken cancellationToken)
    {
        var parent = request.ParentId.HasValue
            ? await dbContext.ContentNodes.FirstOrDefaultAsync(x => x.Id == request.ParentId.Value, cancellationToken)
            : null;

        var id = request.Id ?? Guid.NewGuid();
        var entity = await dbContext.ContentNodes.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        var isNew = entity is null;

        entity ??= new ContentNodeEntity
        {
            Id = id,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.UpdatedBy
        };

        entity.ParentId = request.ParentId;
        entity.Title = request.Title;
        entity.Tag = request.Tag;
        entity.SummaryHtml = request.SummaryHtml;
        entity.DetailHtml = request.DetailHtml;
        entity.FileUrl = request.FileUrl;
        entity.FileName = request.FileName;
        entity.PdfRefsJson = request.PdfRefsJson;
        entity.Level = parent is not null ? parent.Level + 1 : request.Level ?? 0;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = request.UpdatedBy;

        if (isNew)
        {
            dbContext.ContentNodes.Add(entity);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapSingle(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var hasChildren = await dbContext.ContentNodes.AnyAsync(x => x.ParentId == id, cancellationToken);
        if (hasChildren)
        {
            return false;
        }

        var entity = await dbContext.ContentNodes.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        dbContext.ContentNodes.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static IReadOnlyList<ContentNodeDto> BuildTree(
        IReadOnlyList<ContentNodeEntity> allNodes,
        Guid? parentId)
    {
        return allNodes
            .Where(x => x.ParentId == parentId)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .Select(x => new ContentNodeDto(
                x.Id,
                x.Title,
                x.Tag,
                x.SummaryHtml,
                x.DetailHtml,
                x.Level,
                x.SortOrder,
                x.IsActive,
                BuildTree(allNodes, x.Id)))
            .ToList();

    private static ContentNodeDto MapSingle(ContentNodeEntity entity)
        => new(
            entity.Id,
            entity.Title,
            entity.Tag,
            entity.SummaryHtml,
            entity.DetailHtml,
            entity.Level,
            entity.SortOrder,
            entity.IsActive,
            Array.Empty<ContentNodeDto>());
}
}
