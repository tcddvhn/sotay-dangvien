using Sotay.Server.Api.Models.Content;

namespace Sotay.Server.Api.Services.Interfaces;

public interface IContentService
{
    Task<IReadOnlyList<ContentNodeDto>> GetTreeAsync(CancellationToken cancellationToken);
}
