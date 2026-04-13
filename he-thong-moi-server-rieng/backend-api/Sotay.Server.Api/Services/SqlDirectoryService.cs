using Microsoft.EntityFrameworkCore;
using Sotay.Server.Api.Data;
using Sotay.Server.Api.Data.Entities;
using Sotay.Server.Api.Models.Directory;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class SqlDirectoryService(ApplicationDbContext dbContext) : IDirectoryService
{
    public async Task<IReadOnlyList<DirectoryUnitDto>> GetTreeAsync(CancellationToken cancellationToken)
    {
        var units = await dbContext.DirectoryUnits
            .AsNoTracking()
            .OrderBy(x => x.Level)
            .ThenBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return BuildTree(units, parentId: null);
    }

    private static IReadOnlyList<DirectoryUnitDto> BuildTree(
        IReadOnlyList<DirectoryUnitEntity> allUnits,
        Guid? parentId)
    {
        return allUnits
            .Where(x => x.ParentId == parentId)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .Select(x => new DirectoryUnitDto(
                x.Id,
                x.Name,
                x.UnitCode,
                x.Level,
                x.ParentId,
                x.Phone,
                x.Address,
                x.Location,
                x.SortOrder,
                x.IsActive,
                BuildTree(allUnits, x.Id)))
            .ToList();
    }
}
