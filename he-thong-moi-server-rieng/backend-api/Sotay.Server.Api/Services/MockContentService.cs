using Sotay.Server.Api.Models.Content;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockContentService : IContentService
{
    private static readonly object Sync = new();

    private static readonly List<MockContentState> Store =
    [
        new()
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            ParentId = null,
            Title = "PHẦN 1",
            Tag = "Quy định",
            SummaryHtml = "Dữ liệu mẫu để dựng API thay Firestore.",
            DetailHtml = "Nội dung này chỉ là placeholder. Khi chuyển hệ thống thật, dữ liệu sẽ đọc từ SQL Server.",
            ForceAccordion = false,
            Level = 0,
            SortOrder = 1,
            IsActive = true
        },
        new()
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111112"),
            ParentId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Title = "Mục con mẫu",
            Tag = "Hỏi đáp",
            SummaryHtml = "Tóm tắt mẫu.",
            DetailHtml = "Chi tiết mẫu.",
            ForceAccordion = false,
            Level = 1,
            SortOrder = 1,
            IsActive = true
        }
    ];

    public Task<IReadOnlyList<ContentNodeDto>> GetTreeAsync(CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            return Task.FromResult<IReadOnlyList<ContentNodeDto>>(BuildTree(parentId: null));
        }
    }

    public Task<ContentNodeDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var item = Store.FirstOrDefault(x => x.Id == id);
            return Task.FromResult(item is null ? null : MapSingle(item));
        }
    }

    public Task<ContentNodeDto> SaveAsync(ContentNodeSaveRequest request, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            var id = request.Id ?? Guid.NewGuid();
            var parent = request.ParentId.HasValue ? Store.FirstOrDefault(x => x.Id == request.ParentId.Value) : null;
            var level = parent is not null ? parent.Level + 1 : request.Level ?? 0;

            var entity = Store.FirstOrDefault(x => x.Id == id);
            if (entity is null)
            {
                entity = new MockContentState
                {
                    Id = id,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = request.UpdatedBy
                };
                Store.Add(entity);
            }

            entity.ParentId = request.ParentId;
            entity.Title = request.Title;
            entity.Tag = request.Tag;
            entity.SummaryHtml = request.SummaryHtml;
            entity.DetailHtml = request.DetailHtml;
            entity.FileUrl = request.FileUrl;
            entity.FileName = request.FileName;
            entity.PdfRefsJson = request.PdfRefsJson;
            entity.ForceAccordion = request.ForceAccordion;
            entity.Level = level;
            entity.SortOrder = request.SortOrder;
            entity.IsActive = request.IsActive;
            entity.UpdatedBy = request.UpdatedBy;
            entity.UpdatedAt = DateTime.UtcNow;

            return Task.FromResult(MapSingle(entity));
        }
    }

    public Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            if (Store.Any(x => x.ParentId == id))
            {
                return Task.FromResult(false);
            }

            var item = Store.FirstOrDefault(x => x.Id == id);
            if (item is null)
            {
                return Task.FromResult(false);
            }

            Store.Remove(item);
            return Task.FromResult(true);
        }
    }

    public Task<IReadOnlyList<ContentNodeDto>> SyncTreeAsync(ContentTreeSyncRequest request, CancellationToken cancellationToken)
    {
        lock (Sync)
        {
            Store.Clear();
            Flatten(request.Tree, request.UpdatedBy, Store);
            return Task.FromResult<IReadOnlyList<ContentNodeDto>>(BuildTree(parentId: null));
        }
    }

    private static IReadOnlyList<ContentNodeDto> BuildTree(Guid? parentId)
        => Store
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
                BuildTree(x.Id)))
            .ToList();

    private static ContentNodeDto MapSingle(MockContentState item)
        => new(
            item.Id,
            item.Title,
            item.Tag,
            item.SummaryHtml,
            item.DetailHtml,
            item.FileUrl,
            item.FileName,
            item.PdfRefsJson,
            item.ForceAccordion,
            item.Level,
            item.SortOrder,
            item.IsActive,
            item.CreatedAt,
            item.CreatedBy,
            item.UpdatedAt,
            item.UpdatedBy,
            BuildTree(item.Id));

    private static void Flatten(
        IEnumerable<ContentNodeTreeItem> nodes,
        string? updatedBy,
        List<MockContentState> output)
    {
        foreach (var node in nodes)
        {
            output.Add(new MockContentState
            {
                Id = node.Id,
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
                CreatedBy = updatedBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedBy = updatedBy,
                UpdatedAt = DateTime.UtcNow
            });

            Flatten(node.Children, updatedBy, output);
        }
    }

    private sealed class MockContentState
    {
        public Guid Id { get; set; }

        public Guid? ParentId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Tag { get; set; }

        public string? SummaryHtml { get; set; }

        public string? DetailHtml { get; set; }

        public string? FileUrl { get; set; }

        public string? FileName { get; set; }

        public string? PdfRefsJson { get; set; }

        public bool ForceAccordion { get; set; }

        public int Level { get; set; }

        public int SortOrder { get; set; }

        public bool IsActive { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? UpdatedBy { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}
