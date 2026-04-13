namespace Sotay.Server.Api.Models.Notice;

public sealed record NoticeSaveRequest(
    Guid? Id,
    string Title,
    string Content,
    bool IsPublic,
    DateTime? PublishedAt,
    string? UpdatedBy,
    bool IsActive);
