using Sotay.Server.Api.Models.Directory;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockDirectoryService : IDirectoryService
{
    private static readonly object Sync = new();

    private static readonly List<MockDirectoryState> Store =
    [
        new()
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222221"),
            ParentId = null,
            Name = "Đơn vị cấp 1 mẫu",
            UnitCode = "DV001",
            Level = 1,
            Phone = "024-0000000",
            Address = "Hà Nội",
            Location = "Tòa nhà mẫu",
            SortOrder = 1,
            IsActive = true
        },
        new()
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            ParentId = Guid.Parse("22222222-2222-2222-2222-222222222221"),
            Name = "Đơn vị cấp 2 mẫu",
            UnitCode = "DV001-01",
            Level = 2,
            Phone = "024-1111111",
            Address = "Hà Nội",
            Location = "Phòng mẫu",
            SortOrder = 1,
            IsActive = true
        }
    ];

    public Task<IReadOnlyList<DirectoryUnitDto>> GetTreeAsync(CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            return Task.FromResult<IReadOnlyList<DirectoryUnitDto>>(BuildTree(parentId: null));
        }
    }

    public Task<DirectoryUnitDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var item = Store.FirstOrDefault(x => x.Id == id);
            return Task.FromResult(item is null ? null : MapSingle(item));
        }
    }

    public Task<DirectoryUnitDto> SaveAsync(DirectoryUnitSaveRequest request, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var id = request.Id ?? Guid.NewGuid();
            var parent = request.ParentId.HasValue ? Store.FirstOrDefault(x => x.Id == request.ParentId.Value) : null;
            var level = parent is not null ? parent.Level + 1 : request.Level ?? 1;

            var entity = Store.FirstOrDefault(x => x.Id == id);
            if (entity is null)
            {
                entity = new MockDirectoryState
                {
                    Id = id
                };
                Store.Add(entity);
            }

            entity.ParentId = request.ParentId;
            entity.Name = request.Name;
            entity.UnitCode = request.UnitCode;
            entity.Level = level;
            entity.Phone = request.Phone;
            entity.Address = request.Address;
            entity.Location = request.Location;
            entity.SortOrder = request.SortOrder;
            entity.IsActive = request.IsActive;
            entity.UpdatedBy = request.UpdatedBy;
            entity.UpdatedAt = DateTime.UtcNow;

            return Task.FromResult(MapSingle(entity));
        }
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            if (Store.Any(x => x.ParentId == id))
            {
                return Task.FromResult(false);
            }

            var item = Store.FirstOrDefault(x => x.Id == id);
            if (item is null)
            {
                return Task.FromResult(false);
            }

            Store.Remove(item);
            return Task.FromResult(true);
        }
    }

    public Task<IReadOnlyList<DirectoryUnitDto>> SyncTreeAsync(DirectoryTreeSyncRequest request, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            Store.Clear();
            Flatten(request.Tree, request.UpdatedBy, Store);
            return Task.FromResult<IReadOnlyList<DirectoryUnitDto>>(BuildTree(parentId: null));
        }
    }

    private static IReadOnlyList<DirectoryUnitDto> BuildTree(Guid? parentId)
        => Store
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
                BuildTree(x.Id)))
            .ToList();

    private static DirectoryUnitDto MapSingle(MockDirectoryState item)
        => new(
            item.Id,
            item.Name,
            item.UnitCode,
            item.Level,
            item.ParentId,
            item.Phone,
            item.Address,
            item.Location,
            item.SortOrder,
            item.IsActive,
            BuildTree(item.Id));

    private static void Flatten(
        IEnumerable<DirectoryTreeItem> nodes,
        string? updatedBy,
        List<MockDirectoryState> output)
    {
        foreach (var node in nodes)
        {
            output.Add(new MockDirectoryState
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
                UpdatedBy = updatedBy,
                UpdatedAt = DateTime.UtcNow
            });

            Flatten(node.Children, updatedBy, output);
        }
    }

    private sealed class MockDirectoryState
    {
        public Guid Id { get; set; }

        public Guid? ParentId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? UnitCode { get; set; }

        public int Level { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? Location { get; set; }

        public int SortOrder { get; set; }

        public bool IsActive { get; set; }

        public string? UpdatedBy { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
