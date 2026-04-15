namespace Sotay.Server.Api.Models.Auth;

public sealed record ContentPermissionSaveRequest(
    Guid? Id,
    Guid AdminUserId,
    Guid ContentNodeId,
    int MaxDepth,
    bool AllowRead,
    bool AllowCreateChild,
    bool AllowEdit,
    bool AllowDelete,
    bool IsActive,
    string? UpdatedBy);
