using Microsoft.AspNetCore.Identity;

namespace Sotay.Server.Api.Data.Identity;

public sealed class AdminUserEntity : IdentityUser<Guid>
{
    public string? DisplayName { get; set; }

    public bool IsActive { get; set; } = true;
}
