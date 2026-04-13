using Sotay.Server.Api.Models.Content;

namespace Sotay.Server.Api.Services.Interfaces;

public interface IContentService
{
    Task<IReadOnlyList<ContentNodeDto>> GetTreeAsync(CancellationToken cancellationToken);

    Task<ContentNodeDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<ContentNodeDto> SaveAsync(ContentNodeSaveRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
