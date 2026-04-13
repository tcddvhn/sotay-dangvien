using Microsoft.AspNetCore.Identity;
using Sotay.Server.Api.Data.Identity;
using Sotay.Server.Api.Models.Auth;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class IdentityAdminAuthService(
    UserManager<AdminUserEntity> userManager,
    SignInManager<AdminUserEntity> signInManager) : IAdminAuthService
{
    public async Task<AdminLoginResult> LoginAsync(AdminLoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return new AdminLoginResult(
                false,
                null,
                null,
                null,
                null,
                "Thiếu tên đăng nhập hoặc mật khẩu.");
        }

        var normalizedInput = request.Username.Trim();
        var user = await userManager.FindByNameAsync(normalizedInput)
            ?? await userManager.FindByEmailAsync(normalizedInput);

        if (user is null)
        {
            return new AdminLoginResult(
                false,
                null,
                null,
                null,
                null,
                "Không tìm thấy tài khoản quản trị.");
        }

        if (!user.IsActive)
        {
            return new AdminLoginResult(
                false,
                null,
                null,
                user.DisplayName,
                null,
                "Tài khoản đã bị khóa hoặc ngừng hoạt động.");
        }

        var signInResult = await signInManager.PasswordSignInAsync(
            user,
            request.Password,
            isPersistent: false,
            lockoutOnFailure: true);

        if (!signInResult.Succeeded)
        {
            var message = signInResult.IsLockedOut
                ? "Tài khoản đang bị khóa tạm thời do đăng nhập sai nhiều lần."
                : "Thông tin đăng nhập chưa đúng.";

            return new AdminLoginResult(
                false,
                null,
                null,
                user.DisplayName,
                null,
                message);
        }

        var roles = await userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault();

        return new AdminLoginResult(
            true,
            null,
            DateTimeOffset.UtcNow.AddHours(1),
            user.DisplayName ?? user.UserName,
            primaryRole,
            "Đăng nhập thành công qua Identity.");
    }
}
