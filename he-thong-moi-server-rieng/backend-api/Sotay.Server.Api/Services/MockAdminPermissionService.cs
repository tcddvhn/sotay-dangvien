using Sotay.Server.Api.Models.Auth;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockAdminPermissionService : IAdminPermissionService
{
    private readonly List<AdminProfileDto> _profiles =
    [
        new(
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            "admin",
            "admin@sotay.com",
            "Quản trị hệ thống",
            "super_admin",
            true,
            DateTime.UtcNow.AddDays(-10),
            "system",
            DateTime.UtcNow,
            "system",
            DateTime.UtcNow.AddMinutes(-15))
    ];

    private readonly List<ContentPermissionDto> _permissions = [];

    public Task<IReadOnlyList<AdminProfileDto>> GetAdminProfilesAsync(CancellationToken cancellationToken)
        => Task.FromResult<IReadOnlyList<AdminProfileDto>>(_profiles.OrderByDescending(x => x.RoleName == "super_admin").ThenBy(x => x.DisplayName).ToList());

    public Task<AdminProfileDto?> GetAdminProfileAsync(Guid id, CancellationToken cancellationToken)
        => Task.FromResult(_profiles.FirstOrDefault(x => x.Id == id));

    public Task<AdminProfileDto?> GetCurrentAdminProfileAsync(CancellationToken cancellationToken)
        => Task.FromResult(_profiles.FirstOrDefault());

    public Task<AdminProfileDto> SaveAdminProfileAsync(AdminProfileSaveRequest request, CancellationToken cancellationToken)
    {
        var isRootAdmin = string.Equals(request.UserName, "admin", StringComparison.OrdinalIgnoreCase);
        var now = DateTime.UtcNow;
        var existingIndex = _profiles.FindIndex(x =>
            (request.Id.HasValue && x.Id == request.Id.Value) ||
            string.Equals(x.UserName, request.UserName, StringComparison.OrdinalIgnoreCase));

        var current = existingIndex >= 0 ? _profiles[existingIndex] : null;
        var dto = new AdminProfileDto(
            current?.Id ?? request.Id ?? Guid.NewGuid(),
            request.UserName.Trim().ToLowerInvariant(),
            request.Email?.Trim().ToLowerInvariant(),
            string.IsNullOrWhiteSpace(request.DisplayName) ? request.UserName.Trim().ToLowerInvariant() : request.DisplayName.Trim(),
            isRootAdmin ? "super_admin" : (string.Equals(request.RoleName, "super_admin", StringComparison.OrdinalIgnoreCase) ? "super_admin" : "editor"),
            isRootAdmin || request.IsActive,
            current?.CreatedAt ?? now,
            current?.CreatedBy ?? request.UpdatedBy,
            now,
            request.UpdatedBy,
            current?.LastLoginAt);

        if (existingIndex >= 0) _profiles[existingIndex] = dto;
        else _profiles.Add(dto);

        return Task.FromResult(dto);
    }

    public Task<IReadOnlyList<ContentPermissionDto>> GetContentPermissionsAsync(Guid adminUserId, CancellationToken cancellationToken)
        => Task.FromResult<IReadOnlyList<ContentPermissionDto>>(_permissions.Where(x => x.AdminUserId == adminUserId).OrderBy(x => x.ContentNodeLevel).ThenBy(x => x.ContentNodeTitle).ToList());

    public Task<ContentPermissionDto> SaveContentPermissionAsync(ContentPermissionSaveRequest request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var existingIndex = _permissions.FindIndex(x =>
            (request.Id.HasValue && x.Id == request.Id.Value) ||
            (x.AdminUserId == request.AdminUserId && x.ContentNodeId == request.ContentNodeId));

        var current = existingIndex >= 0 ? _permissions[existingIndex] : null;
        var dto = new ContentPermissionDto(
            current?.Id ?? request.Id ?? Guid.NewGuid(),
            request.AdminUserId,
            request.ContentNodeId,
            current?.ContentNodeTitle ?? "Node nội dung",
            current?.ContentNodeLevel ?? 0,
            Math.Max(0, request.MaxDepth),
            request.AllowRead,
            request.AllowCreateChild,
            request.AllowEdit,
            request.AllowDelete,
            request.IsActive,
            current?.CreatedAt ?? now,
            current?.CreatedBy ?? request.UpdatedBy,
            now,
            request.UpdatedBy);

        if (existingIndex >= 0) _permissions[existingIndex] = dto;
        else _permissions.Add(dto);

        return Task.FromResult(dto);
    }

    public Task<bool> DeleteContentPermissionAsync(Guid id, CancellationToken cancellationToken)
    {
        var removed = _permissions.RemoveAll(x => x.Id == id) > 0;
        return Task.FromResult(removed);
    }
}
