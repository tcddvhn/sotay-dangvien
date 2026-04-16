using Sotay.Server.Api.Models.Auth;

namespace Sotay.Server.Api.Services.Interfaces;

public interface IAdminPermissionService
{
    Task<IReadOnlyList<AdminProfileDto>> GetAdminProfilesAsync(CancellationToken cancellationToken);

    Task<AdminProfileDto?> GetAdminProfileAsync(Guid id, CancellationToken cancellationToken);

    Task<AdminProfileDto?> GetCurrentAdminProfileAsync(CancellationToken cancellationToken);

    Task<AdminProfileDto> SaveAdminProfileAsync(AdminProfileSaveRequest request, CancellationToken cancellationToken);

    Task<IReadOnlyList<ContentPermissionDto>> GetContentPermissionsAsync(Guid adminUserId, CancellationToken cancellationToken);

    Task<ContentPermissionDto> SaveContentPermissionAsync(ContentPermissionSaveRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteContentPermissionAsync(Guid id, CancellationToken cancellationToken);
}
