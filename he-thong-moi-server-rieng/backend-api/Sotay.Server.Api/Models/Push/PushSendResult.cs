namespace Sotay.Server.Api.Models.Push;

public sealed record PushSendResult(
    int Attempted,
    int Delivered,
    int Removed);
