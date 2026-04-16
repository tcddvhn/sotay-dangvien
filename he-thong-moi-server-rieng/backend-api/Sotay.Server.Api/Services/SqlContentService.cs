using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Sotay.Server.Api.Data;
using Sotay.Server.Api.Data.Entities;
using Sotay.Server.Api.Data.Identity;
using Sotay.Server.Api.Models.Content;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class SqlContentService(
    ApplicationDbContext dbContext,
    IHttpContextAccessor httpContextAccessor) : IContentService
{
    public async Task<IReadOnlyList<ContentNodeDto>> GetTreeAsync(CancellationToken cancellationToken)
    {
        var nodes = await dbContext.ContentNodes
            .AsNoTracking()
            .OrderBy(x => x.Level)
            .ThenBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .ToListAsync(cancellationToken);

        return BuildTree(nodes, parentId: null);
    }

    public async Task<ContentNodeDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await dbContext.ContentNodes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return item is null ? null : MapSingle(item);
    }

    public async Task<ContentNodeDto> SaveAsync(ContentNodeSaveRequest request, CancellationToken cancellationToken)
    {
        var currentAdmin = await RequireCurrentAdminAsync(cancellationToken);
        var id = request.Id ?? Guid.NewGuid();
        var entity = await dbContext.ContentNodes.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        var isNew = entity is null;

        if (!isNew)
        {
            await EnsureCanEditNodeAsync(currentAdmin, id, cancellationToken);
        }

        ContentNodeEntity? parent = null;
        if (isNew && request.ParentId.HasValue)
        {
            parent = await dbContext.ContentNodes.FirstOrDefaultAsync(x => x.Id == request.ParentId.Value, cancellationToken)
                ?? throw new InvalidOperationException("Khong tim thay node cha de tao muc con.");
            await EnsureCanCreateChildAsync(currentAdmin, parent.Id, cancellationToken);
        }

        if (isNew && !request.ParentId.HasValue)
        {
            EnsureRootCreationAllowed(currentAdmin);
        }

        entity ??= new ContentNodeEntity
        {
            Id = id,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentAdmin.UserName
        };

        entity.ParentId = isNew ? request.ParentId : entity.ParentId;
        entity.Title = request.Title;
        entity.Tag = request.Tag;
        entity.SummaryHtml = request.SummaryHtml;
        entity.DetailHtml = request.DetailHtml;
        entity.FileUrl = request.FileUrl;
        entity.FileName = request.FileName;
        entity.PdfRefsJson = request.PdfRefsJson;
        entity.ForceAccordion = request.ForceAccordion;
        entity.Level = isNew
            ? (parent is not null ? parent.Level + 1 : request.Level ?? 0)
            : entity.Level;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedBy = currentAdmin.UserName;

        if (entity.Level is < 0 or > 5)
        {
            throw new InvalidOperationException("Level noi dung khong hop le.");
        }

        if (isNew)
        {
            dbContext.ContentNodes.Add(entity);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return MapSingle(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var currentAdmin = await RequireCurrentAdminAsync(cancellationToken);
        await EnsureCanDeleteNodeAsync(currentAdmin, id, cancellationToken);

        var hasChildren = await dbContext.ContentNodes.AnyAsync(x => x.ParentId == id, cancellationToken);
        if (hasChildren)
        {
            return false;
        }

        var entity = await dbContext.ContentNodes.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        dbContext.ContentNodes.Remove(entity);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<ContentNodeDto>> SyncTreeAsync(ContentTreeSyncRequest request, CancellationToken cancellationToken)
    {
        var currentAdmin = await RequireCurrentAdminAsync(cancellationToken);
        EnsureTreeSyncAllowed(currentAdmin);

        var existing = await dbContext.ContentNodes.ToListAsync(cancellationToken);
        dbContext.ContentNodes.RemoveRange(existing);

        var flattened = new List<ContentNodeEntity>();
        Flatten(request.Tree, currentAdmin.UserName, flattened);
        dbContext.ContentNodes.AddRange(flattened);

        await dbContext.SaveChangesAsync(cancellationToken);
        return await GetTreeAsync(cancellationToken);
    }

    private async Task<AdminUserEntity> RequireCurrentAdminAsync(CancellationToken cancellationToken)
    {
        var principal = httpContextAccessor.HttpContext?.User;
        if (principal?.Identity?.IsAuthenticated != true)
        {
            throw new ContentAuthenticationRequiredException("Yeu cau dang nhap quan tri truoc khi thay doi noi dung.");
        }

        var userIdRaw = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdRaw, out var userId))
        {
            throw new ContentAuthenticationRequiredException("Khong xac dinh duoc tai khoan quan tri hien tai.");
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            throw new ContentAuthenticationRequiredException("Tai khoan quan tri hien tai khong hop le hoac da bi khoa.");
        }

        return user;
    }

    private static bool IsSuperAdmin(AdminUserEntity admin)
        => string.Equals(admin.RoleName, "super_admin", StringComparison.OrdinalIgnoreCase);

    private static void EnsureRootCreationAllowed(AdminUserEntity admin)
    {
        if (!IsSuperAdmin(admin))
        {
            throw new ContentPermissionDeniedException("Chi super admin duoc tao muc level 0.");
        }
    }

    private static void EnsureTreeSyncAllowed(AdminUserEntity admin)
    {
        if (!IsSuperAdmin(admin))
        {
            throw new ContentPermissionDeniedException("Chi super admin duoc dong bo lai toan bo cay noi dung.");
        }
    }

    private async Task EnsureCanEditNodeAsync(AdminUserEntity admin, Guid nodeId, CancellationToken cancellationToken)
    {
        if (IsSuperAdmin(admin))
        {
            return;
        }

        var node = await dbContext.ContentNodes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == nodeId, cancellationToken)
            ?? throw new InvalidOperationException("Khong tim thay node noi dung can sua.");

        if (node.Level is < 1 or > 5)
        {
            throw new ContentPermissionDeniedException("Tai khoan hien tai khong duoc sua node nay.");
        }

        var allowed = await HasPermissionAsync(
            admin.Id,
            nodeId,
            permission => permission.AllowEdit,
            cancellationToken);

        if (!allowed)
        {
            throw new ContentPermissionDeniedException("Tai khoan hien tai khong co quyen sua noi dung nay.");
        }
    }

    private async Task EnsureCanDeleteNodeAsync(AdminUserEntity admin, Guid nodeId, CancellationToken cancellationToken)
    {
        if (IsSuperAdmin(admin))
        {
            return;
        }

        var node = await dbContext.ContentNodes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == nodeId, cancellationToken)
            ?? throw new InvalidOperationException("Khong tim thay node noi dung can xoa.");

        if (node.Level is < 1 or > 5)
        {
            throw new ContentPermissionDeniedException("Tai khoan hien tai khong duoc xoa node nay.");
        }

        var allowed = await HasPermissionAsync(
            admin.Id,
            nodeId,
            permission => permission.AllowDelete,
            cancellationToken);

        if (!allowed)
        {
            throw new ContentPermissionDeniedException("Tai khoan hien tai khong co quyen xoa noi dung nay.");
        }
    }

    private async Task EnsureCanCreateChildAsync(AdminUserEntity admin, Guid parentNodeId, CancellationToken cancellationToken)
    {
        if (IsSuperAdmin(admin))
        {
            return;
        }

        var parent = await dbContext.ContentNodes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == parentNodeId, cancellationToken)
            ?? throw new InvalidOperationException("Khong tim thay node cha de tao muc con.");

        var childLevel = parent.Level + 1;
        if (childLevel is < 1 or > 5)
        {
            throw new ContentPermissionDeniedException("Khong the tao muc con ngoai pham vi level 1 den 5.");
        }

        var allowed = await HasPermissionAsync(
            admin.Id,
            parentNodeId,
            permission => permission.AllowCreateChild,
            cancellationToken);

        if (!allowed)
        {
            throw new ContentPermissionDeniedException("Tai khoan hien tai khong co quyen them muc con cho noi dung nay.");
        }
    }

    private async Task<bool> HasPermissionAsync(
        Guid adminUserId,
        Guid nodeId,
        Func<ContentPermissionEntity, bool> actionSelector,
        CancellationToken cancellationToken)
    {
        var ancestorDistances = await GetAncestorDistanceMapAsync(nodeId, cancellationToken);
        if (ancestorDistances.Count == 0)
        {
            return false;
        }

        var ancestorIds = ancestorDistances.Keys.ToList();
        var permissions = await dbContext.ContentPermissions
            .AsNoTracking()
            .Where(x => x.AdminUserId == adminUserId && x.IsActive && ancestorIds.Contains(x.ContentNodeId))
            .ToListAsync(cancellationToken);

        return permissions.Any(permission =>
        {
            if (!actionSelector(permission))
            {
                return false;
            }

            if (!ancestorDistances.TryGetValue(permission.ContentNodeId, out var distance))
            {
                return false;
            }

            return distance <= permission.MaxDepth;
        });
    }

    private async Task<Dictionary<Guid, int>> GetAncestorDistanceMapAsync(Guid nodeId, CancellationToken cancellationToken)
    {
        var result = new Dictionary<Guid, int>();
        Guid? currentId = nodeId;
        var distance = 0;

        while (currentId.HasValue)
        {
            var currentNode = await dbContext.ContentNodes
                .AsNoTracking()
                .Where(x => x.Id == currentId.Value)
                .Select(x => new { x.Id, x.ParentId })
                .FirstOrDefaultAsync(cancellationToken);

            if (currentNode is null)
            {
                break;
            }

            result[currentNode.Id] = distance;
            currentId = currentNode.ParentId;
            distance += 1;
        }

        return result;
    }

    private static IReadOnlyList<ContentNodeDto> BuildTree(
        IReadOnlyList<ContentNodeEntity> allNodes,
        Guid? parentId)
    {
        return allNodes
            .Where(x => x.ParentId == parentId)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Title)
            .Select(x => new ContentNodeDto(
                x.Id,
                x.Title,
                x.Tag,
                x.SummaryHtml,
                x.DetailHtml,
                x.FileUrl,
                x.FileName,
                x.PdfRefsJson,
                x.ForceAccordion,
                x.Level,
                x.SortOrder,
                x.IsActive,
                x.CreatedAt,
                x.CreatedBy,
                x.UpdatedAt,
                x.UpdatedBy,
                BuildTree(allNodes, x.Id)))
            .ToList();
    }

    private static ContentNodeDto MapSingle(ContentNodeEntity entity)
        => new(
            entity.Id,
            entity.Title,
            entity.Tag,
            entity.SummaryHtml,
            entity.DetailHtml,
            entity.FileUrl,
            entity.FileName,
            entity.PdfRefsJson,
            entity.ForceAccordion,
            entity.Level,
            entity.SortOrder,
            entity.IsActive,
            entity.CreatedAt,
            entity.CreatedBy,
            entity.UpdatedAt,
            entity.UpdatedBy,
            Array.Empty<ContentNodeDto>());

    private static void Flatten(
        IEnumerable<ContentNodeTreeItem> nodes,
        string? updatedBy,
        List<ContentNodeEntity> output)
    {
        foreach (var node in nodes)
        {
            output.Add(new ContentNodeEntity
            {
                Id = node.Id,
                LegacyId = node.LegacyId,
                ParentId = node.ParentId,
                Title = node.Title,
                Tag = node.Tag,
                SummaryHtml = node.SummaryHtml,
                DetailHtml = node.DetailHtml,
                FileUrl = node.FileUrl,
                FileName = node.FileName,
                PdfRefsJson = node.PdfRefsJson,
                ForceAccordion = node.ForceAccordion,
                Level = node.Level,
                SortOrder = node.SortOrder,
                IsActive = node.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = updatedBy,
                UpdatedBy = updatedBy
            });

            Flatten(node.Children, updatedBy, output);
        }
    }
}
