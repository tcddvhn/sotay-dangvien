namespace Sotay.Server.Api.Models.Directory;

public sealed record DirectoryUnitDto(
    Guid Id,
    string Name,
    string? UnitCode,
    int Level,
    Guid? ParentId,
    string? Phone,
    string? Address,
    string? Location,
    int SortOrder,
    bool IsActive,
    IReadOnlyList<DirectoryUnitDto> Children);
