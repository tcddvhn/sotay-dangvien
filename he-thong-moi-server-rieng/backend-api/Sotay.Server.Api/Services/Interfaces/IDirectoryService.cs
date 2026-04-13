using Sotay.Server.Api.Models.Directory;

namespace Sotay.Server.Api.Services.Interfaces;

public interface IDirectoryService
{
    Task<IReadOnlyList<DirectoryUnitDto>> GetTreeAsync(CancellationToken cancellationToken);

    Task<DirectoryUnitDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<DirectoryUnitDto> SaveAsync(DirectoryUnitSaveRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
