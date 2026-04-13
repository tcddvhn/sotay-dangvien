using Sotay.Server.Api.Models.Directory;

namespace Sotay.Server.Api.Services.Interfaces;

public interface IDirectoryService
{
    Task<IReadOnlyList<DirectoryUnitDto>> GetTreeAsync(CancellationToken cancellationToken);
}
