namespace Sotay.Server.Api.Models.Content;

public sealed record ContentNodeDto(
    Guid Id,
    string Title,
    string? Tag,
    string? Summary,
    string? Detail,
    int Level,
    int SortOrder,
    bool IsActive,
    IReadOnlyList<ContentNodeDto> Children);
