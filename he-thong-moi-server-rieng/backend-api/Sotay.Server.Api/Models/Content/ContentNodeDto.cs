namespace Sotay.Server.Api.Models.Content;

public sealed record ContentNodeDto(
    Guid Id,
    string Title,
    string? Tag,
    string? Summary,
    string? Detail,
    string? FileUrl,
    string? FileName,
    string? PdfRefsJson,
    bool ForceAccordion,
    int Level,
    int SortOrder,
    bool IsActive,
    IReadOnlyList<ContentNodeDto> Children);
