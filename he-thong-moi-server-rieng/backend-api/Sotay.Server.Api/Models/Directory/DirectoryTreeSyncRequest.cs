namespace Sotay.Server.Api.Models.Directory;

public sealed record DirectoryTreeSyncRequest(
    IReadOnlyList<DirectoryTreeItem> Tree,
    string? UpdatedBy);

public sealed record DirectoryTreeItem(
    Guid Id,
    Guid? ParentId,
    string Name,
    string? UnitCode,
    int Level,
    string? Phone,
    string? Address,
    string? Location,
    int SortOrder,
    bool IsActive,
    IReadOnlyList<DirectoryTreeItem> Children);
