using Sotay.Server.Api.Models.Auth;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockAdminAuthService : IAdminAuthService
{
    public Task<AdminLoginResult> LoginAsync(AdminLoginRequest request, CancellationToken cancellationToken)
    {
        var isAccepted = request.Username.Equals("admin", StringComparison.OrdinalIgnoreCase)
            && request.Password == "ChangeMe123!";

        if (!isAccepted)
        {
            return Task.FromResult(new AdminLoginResult(
                false,
                null,
                null,
                null,
                null,
                "Thông tin đăng nhập chưa đúng. Đây mới là service mock, sẽ thay bằng ASP.NET Core Identity."));
        }

        return Task.FromResult(new AdminLoginResult(
            true,
            "mock-access-token",
            DateTimeOffset.UtcNow.AddHours(1),
            "Quản trị viên mẫu",
            "SuperAdmin",
            "Đăng nhập mock thành công."));
    }

    public Task LogoutAsync(CancellationToken cancellationToken)
        => Task.CompletedTask;
}
