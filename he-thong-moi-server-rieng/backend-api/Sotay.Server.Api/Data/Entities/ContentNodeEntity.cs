namespace Sotay.Server.Api.Data.Entities;

public sealed class ContentNodeEntity
{
    public Guid Id { get; set; }

    public string? LegacyId { get; set; }

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

    public DateTime CreatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? UpdatedBy { get; set; }

    public ContentNodeEntity? Parent { get; set; }

    public List<ContentNodeEntity> Children { get; set; } = [];
}
