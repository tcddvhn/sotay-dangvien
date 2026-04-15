namespace Sotay.Server.Api.Models.Auth;

public sealed record AdminProfileDto(
    Guid Id,
    string UserName,
    string? Email,
    string? DisplayName,
    string RoleName,
    bool IsActive,
    DateTime CreatedAt,
    string? CreatedBy,
    DateTime UpdatedAt,
    string? UpdatedBy,
    DateTime? LastLoginAt);
