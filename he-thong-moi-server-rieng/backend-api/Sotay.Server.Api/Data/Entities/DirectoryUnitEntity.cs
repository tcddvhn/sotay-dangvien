namespace Sotay.Server.Api.Data.Entities;

public sealed class DirectoryUnitEntity
{
    public Guid Id { get; set; }

    public string? LegacyId { get; set; }

    public Guid? ParentId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? UnitCode { get; set; }

    public int Level { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string? Location { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? UpdatedBy { get; set; }

    public DirectoryUnitEntity? Parent { get; set; }

    public List<DirectoryUnitEntity> Children { get; set; } = [];
}
