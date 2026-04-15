namespace Sotay.Server.Api.Models.Auth;

public sealed record AdminProfileSaveRequest(
    Guid? Id,
    string UserName,
    string? Email,
    string? DisplayName,
    string RoleName,
    bool IsActive,
    string? UpdatedBy);
