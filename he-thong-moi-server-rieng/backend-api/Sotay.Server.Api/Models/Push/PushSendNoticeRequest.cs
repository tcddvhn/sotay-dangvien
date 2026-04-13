namespace Sotay.Server.Api.Models.Push;

public sealed record PushSendNoticeRequest(
    string Title,
    string Content,
    string? ClickUrl);
