using Sotay.Server.Api.Models.Notice;

namespace Sotay.Server.Api.Services.Interfaces;

public interface INoticeService
{
    Task<IReadOnlyList<NoticeDto>> GetLatestAsync(int take, CancellationToken cancellationToken);

    Task<NoticeDto> SaveAsync(NoticeSaveRequest request, CancellationToken cancellationToken);
}
