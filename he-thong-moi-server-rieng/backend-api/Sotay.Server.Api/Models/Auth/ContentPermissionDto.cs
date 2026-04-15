namespace Sotay.Server.Api.Models.Auth;

public sealed record ContentPermissionDto(
    Guid Id,
    Guid AdminUserId,
    Guid ContentNodeId,
    string? ContentNodeTitle,
    int ContentNodeLevel,
    int MaxDepth,
    bool AllowRead,
    bool AllowCreateChild,
    bool AllowEdit,
    bool AllowDelete,
    bool IsActive,
    DateTime CreatedAt,
    string? CreatedBy,
    DateTime UpdatedAt,
    string? UpdatedBy);
