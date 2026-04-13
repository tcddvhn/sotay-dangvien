using Sotay.Server.Api.Models.Auth;

namespace Sotay.Server.Api.Services.Interfaces;

public interface IAdminAuthService
{
    Task<AdminLoginResult> LoginAsync(AdminLoginRequest request, CancellationToken cancellationToken);
}
