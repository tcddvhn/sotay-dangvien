using Sotay.Server.Api.Models.Directory;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockDirectoryService : IDirectoryService
{
    private static readonly IReadOnlyList<DirectoryUnitDto> Seed =
    [
        new(
            Guid.Parse("22222222-2222-2222-2222-222222222221"),
            "Đơn vị cấp 1 mẫu",
            "DV001",
            1,
            null,
            "024-0000000",
            "Hà Nội",
            "Tòa nhà mẫu",
            1,
            true,
            [
                new(
                    Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    "Đơn vị cấp 2 mẫu",
                    "DV001-01",
                    2,
                    Guid.Parse("22222222-2222-2222-2222-222222222221"),
                    "024-1111111",
                    "Hà Nội",
                    "Phòng mẫu",
                    1,
                    true,
                    Array.Empty<DirectoryUnitDto>())
            ])
    ];

    public Task<IReadOnlyList<DirectoryUnitDto>> GetTreeAsync(CancellationToken cancellationToken)
        => Task.FromResult(Seed);
}
