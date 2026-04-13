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
    }
}
