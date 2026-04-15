using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sotay.Server.Api.Data;
using Sotay.Server.Api.Data.Entities;
using Sotay.Server.Api.Data.Identity;
using Sotay.Server.Api.Models.Auth;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class SqlAdminPermissionService(
    ApplicationDbContext dbContext,
    UserManager<AdminUserEntity> userManager) : IAdminPermissionService
{
    private const string SystemRootAdminUserName = "admin";

    public async Task<IReadOnlyList<AdminProfileDto>> GetAdminProfilesAsync(CancellationToken cancellationToken)
    {
        var users = await dbContext.Users
            .AsNoTracking()
            .OrderByDescending(x => x.RoleName == "super_admin")
            .ThenBy(x => x.DisplayName ?? x.UserName)
            .ToListAsync(cancellationToken);

        return users.Select(MapProfile).ToList();
    }

    public async Task<AdminProfileDto?> GetAdminProfileAsync(Guid id, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return user is null ? null : MapProfile(user);
    }

    public async Task<AdminProfileDto> SaveAdminProfileAsync(AdminProfileSaveRequest request, CancellationToken cancellationToken)
    {
        var normalizedUserName = NormalizeUserName(request.UserName);
        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLowerInvariant();
        var now = DateTime.UtcNow;
        var isRootAdmin = normalizedUserName == SystemRootAdminUserName;

        AdminUserEntity? user = null;
        if (request.Id.HasValue)
        {
            user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == request.Id.Value, cancellationToken);
        }

        user ??= await dbContext.Users.FirstOrDefaultAsync(x => x.UserName == normalizedUserName, cancellationToken);

        var isNew = user is null;
        user ??= new AdminUserEntity
        {
            Id = Guid.NewGuid(),
            UserName = normalizedUserName,
            NormalizedUserName = normalizedUserName.ToUpperInvariant(),
            EmailConfirmed = true,
            SecurityStamp = Guid.NewGuid().ToString("N"),
            CreatedAt = now,
            CreatedBy = request.UpdatedBy
        };

        user.UserName = normalizedUserName;
        user.NormalizedUserName = normalizedUserName.ToUpperInvariant();
        user.Email = normalizedEmail;
        user.NormalizedEmail = normalizedEmail?.ToUpperInvariant();
        user.DisplayName = string.IsNullOrWhiteSpace(request.DisplayName) ? normalizedUserName : request.DisplayName.Trim();
        user.RoleName = isRootAdmin ? "super_admin" : NormalizeRoleName(request.RoleName);
        user.IsActive = isRootAdmin || request.IsActive;
        user.UpdatedAt = now;
        user.UpdatedBy = request.UpdatedBy;

        if (isNew)
        {
            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException(string.Join("; ", createResult.Errors.Select(x => x.Description)));
            }
        }
        else
        {
            var updateResult = await userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                throw new InvalidOperationException(string.Join("; ", updateResult.Errors.Select(x => x.Description)));
            }
        }

        return MapProfile(user);
    }

    public async Task<IReadOnlyList<ContentPermissionDto>> GetContentPermissionsAsync(Guid adminUserId, CancellationToken cancellationToken)
    {
        var permissions = await dbContext.ContentPermissions
            .AsNoTracking()
            .Include(x => x.ContentNode)
            .Where(x => x.AdminUserId == adminUserId)
            .OrderBy(x => x.ContentNode!.Level)
            .ThenBy(x => x.ContentNode!.SortOrder)
            .ThenBy(x => x.ContentNode!.Title)
            .ToListAsync(cancellationToken);

        return permissions.Select(MapPermission).ToList();
    }

    public async Task<ContentPermissionDto> SaveContentPermissionAsync(ContentPermissionSaveRequest request, CancellationToken cancellationToken)
    {
        var adminUser = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == request.AdminUserId, cancellationToken)
            ?? throw new InvalidOperationException("Không tìm thấy tài khoản quản trị.");

        var contentNode = await dbContext.ContentNodes.FirstOrDefaultAsync(x => x.Id == request.ContentNodeId, cancellationToken)
            ?? throw new InvalidOperationException("Không tìm thấy node nội dung.");

        var now = DateTime.UtcNow;
        var entity = request.Id.HasValue
            ? await dbContext.ContentPermissions.FirstOrDefaultAsync(x => x.Id == request.Id.Value, cancellationToken)
            : await dbContext.ContentPermissions.FirstOrDefaultAsync(
                x => x.AdminUserId == request.AdminUserId && x.ContentNodeId == request.ContentNodeId,
                cancellationToken);

        var isNew = entity is null;
        entity ??= new ContentPermissionEntity
        {
            Id = Guid.NewGuid(),
            AdminUserId = adminUser.Id,
            ContentNodeId = contentNode.Id,
            CreatedAt = now,
            CreatedBy = request.UpdatedBy
        };

        entity.AdminUserId = adminUser.Id;
        entity.ContentNodeId = contentNode.Id;
        entity.MaxDepth = Math.Max(0, request.MaxDepth);
        entity.AllowRead = request.AllowRead;
        entity.AllowCreateChild = request.AllowCreateChild;
        entity.AllowEdit = request.AllowEdit;
        entity.AllowDelete = request.AllowDelete;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = now;
        entity.UpdatedBy = request.UpdatedBy;

        if (isNew)
        {
            dbContext.ContentPermissions.Add(entity);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        entity.ContentNode = contentNode;
        return MapPermission(entity);
    }

    public async Task<bool> DeleteContentPermissionAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await dbContext.ContentPermissions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        dbContext.ContentPermissions.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static AdminProfileDto MapProfile(AdminUserEntity entity)
        => new(
            entity.Id,
            entity.UserName ?? string.Empty,
            entity.Email,
            entity.DisplayName,
            entity.RoleName,
            entity.IsActive,
            entity.CreatedAt,
            entity.CreatedBy,
            entity.UpdatedAt,
            entity.UpdatedBy,
            entity.LastLoginAt);

    private static ContentPermissionDto MapPermission(ContentPermissionEntity entity)
        => new(
            entity.Id,
            entity.AdminUserId,
            entity.ContentNodeId,
            entity.ContentNode?.Title,
            entity.ContentNode?.Level ?? 0,
            entity.MaxDepth,
            entity.AllowRead,
            entity.AllowCreateChild,
            entity.AllowEdit,
            entity.AllowDelete,
            entity.IsActive,
            entity.CreatedAt,
            entity.CreatedBy,
            entity.UpdatedAt,
            entity.UpdatedBy);

    private static string NormalizeRoleName(string? roleName)
        => string.Equals(roleName, "super_admin", StringComparison.OrdinalIgnoreCase)
            ? "super_admin"
            : "editor";

    private static string NormalizeUserName(string userName)
        => userName.Trim().ToLowerInvariant();
}
