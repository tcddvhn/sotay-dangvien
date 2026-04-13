namespace Sotay.Server.Api.Models.Content;

public sealed record ContentNodeSaveRequest(
    Guid? Id,
    Guid? ParentId,
    string Title,
    string? Tag,
    string? SummaryHtml,
    string? DetailHtml,
    string? FileUrl,
    string? FileName,
    string? PdfRefsJson,
    int? Level,
    int SortOrder,
    bool IsActive,
    string? UpdatedBy);
