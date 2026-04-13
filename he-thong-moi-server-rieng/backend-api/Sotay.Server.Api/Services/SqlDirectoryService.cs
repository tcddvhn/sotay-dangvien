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

    public async Task<DirectoryUnitDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await dbContext.DirectoryUnits
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return item is null ? null : MapSingle(item);
    }

    public async Task<DirectoryUnitDto> SaveAsync(DirectoryUnitSaveRequest request, CancellationToken cancellationToken)
    {
        var parent = request.ParentId.HasValue
            ? await dbContext.DirectoryUnits.FirstOrDefaultAsync(x => x.Id == request.ParentId.Value, cancellationToken)
            : null;

        var id = request.Id ?? Guid.NewGuid();
        var entity = await dbContext.DirectoryUnits.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        var isNew = entity is null;

        entity ??= new DirectoryUnitEntity
        {
            Id = id,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = request.UpdatedBy
        };

        entity.ParentId = request.ParentId;
        entity.Name = request.Name;
        entity.UnitCode = request.UnitCode;
        entity.Level = parent is not null ? parent.Level + 1 : request.Level ?? 1;
        entity.Phone = request.Phone;
        entity.Address = request.Address;
        entity.Location = request.Location;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = request.UpdatedBy;

        if (isNew)
        {
            dbContext.DirectoryUnits.Add(entity);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapSingle(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var hasChildren = await dbContext.DirectoryUnits.AnyAsync(x => x.ParentId == id, cancellationToken);
        if (hasChildren)
        {
            return false;
        }

        var entity = await dbContext.DirectoryUnits.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        dbContext.DirectoryUnits.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<DirectoryUnitDto>> SyncTreeAsync(DirectoryTreeSyncRequest request, CancellationToken cancellationToken)
    {
        var existing = await dbContext.DirectoryUnits.ToListAsync(cancellationToken);
        dbContext.DirectoryUnits.RemoveRange(existing);

        var flattened = new List<DirectoryUnitEntity>();
        Flatten(request.Tree, request.UpdatedBy, flattened);
        dbContext.DirectoryUnits.AddRange(flattened);

        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetTreeAsync(cancellationToken);
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

    private static DirectoryUnitDto MapSingle(DirectoryUnitEntity entity)
        => new(
            entity.Id,
            entity.Name,
            entity.UnitCode,
            entity.Level,
            entity.ParentId,
            entity.Phone,
            entity.Address,
            entity.Location,
            entity.SortOrder,
            entity.IsActive,
            Array.Empty<DirectoryUnitDto>());

    private static void Flatten(
        IEnumerable<DirectoryTreeItem> nodes,
        string? updatedBy,
        List<DirectoryUnitEntity> output)
    {
        foreach (var node in nodes)
        {
            output.Add(new DirectoryUnitEntity
            {
                Id = node.Id,
                ParentId = node.ParentId,
                Name = node.Name,
                UnitCode = node.UnitCode,
                Level = node.Level,
                Phone = node.Phone,
                Address = node.Address,
                Location = node.Location,
                SortOrder = node.SortOrder,
                IsActive = node.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = updatedBy,
                UpdatedBy = updatedBy
            });

            Flatten(node.Children, updatedBy, output);
        }
    }
}
}
