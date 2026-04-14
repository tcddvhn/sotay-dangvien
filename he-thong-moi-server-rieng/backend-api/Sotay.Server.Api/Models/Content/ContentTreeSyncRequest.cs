namespace Sotay.Server.Api.Models.Content;

public sealed record ContentTreeSyncRequest(
    IReadOnlyList<ContentNodeTreeItem> Tree,
    string? UpdatedBy);

public sealed record ContentNodeTreeItem(
    Guid Id,
    Guid? ParentId,
    string Title,
    string? Tag,
    string? SummaryHtml,
    string? DetailHtml,
    string? FileUrl,
    string? FileName,
    string? PdfRefsJson,
    bool ForceAccordion,
    int Level,
    int SortOrder,
    bool IsActive,
    IReadOnlyList<ContentNodeTreeItem> Children)
{
    public string? LegacyId { get; init; }
}
