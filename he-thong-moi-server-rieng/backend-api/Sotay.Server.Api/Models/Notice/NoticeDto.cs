namespace Sotay.Server.Api.Models.Notice;

public sealed record NoticeDto(
    Guid Id,
    string Title,
    string Content,
    bool IsPublic,
    DateTime PublishedAt,
    DateTime CreatedAt,
    bool IsActive);
