using Sotay.Server.Api.Models.Content;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockContentService : IContentService
{
    private static readonly IReadOnlyList<ContentNodeDto> Seed =
    [
        new(
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            "PHẦN 1",
            "Quy định",
            "Dữ liệu mẫu để dựng API thay Firestore.",
            "Nội dung này chỉ là placeholder. Khi chuyển hệ thống thật, dữ liệu sẽ đọc từ SQL Server.",
            0,
            1,
            true,
            [
                new(
                    Guid.Parse("11111111-1111-1111-1111-111111111112"),
                    "Mục con mẫu",
                    "Hỏi đáp",
                    "Tóm tắt mẫu.",
                    "Chi tiết mẫu.",
                    1,
                    1,
                    true,
                    Array.Empty<ContentNodeDto>())
            ])
    ];

    public Task<IReadOnlyList<ContentNodeDto>> GetTreeAsync(CancellationToken cancellationToken)
        => Task.FromResult(Seed);
}
