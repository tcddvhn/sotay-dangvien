using Microsoft.AspNetCore.Identity;

namespace Sotay.Server.Api.Data.Identity;

public sealed class AdminUserEntity : IdentityUser<Guid>
{
    public string? DisplayName { get; set; }

    public string RoleName { get; set; } = "editor";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string? UpdatedBy { get; set; }

    public DateTime? LastLoginAt { get; set; }
}
