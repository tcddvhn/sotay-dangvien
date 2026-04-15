using Sotay.Server.Api.Data.Identity;

namespace Sotay.Server.Api.Data.Entities;

public sealed class ContentPermissionEntity
{
    public Guid Id { get; set; }

    public Guid AdminUserId { get; set; }

    public Guid ContentNodeId { get; set; }

    public int MaxDepth { get; set; }

    public bool AllowRead { get; set; }

    public bool AllowCreateChild { get; set; }

    public bool AllowEdit { get; set; }

    public bool AllowDelete { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string? UpdatedBy { get; set; }

    public AdminUserEntity? AdminUser { get; set; }

    public ContentNodeEntity? ContentNode { get; set; }
}
