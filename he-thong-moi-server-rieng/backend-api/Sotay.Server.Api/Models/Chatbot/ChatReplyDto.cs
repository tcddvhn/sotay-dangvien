namespace Sotay.Server.Api.Models.Chatbot;

public sealed record ChatReplyDto(
    string ConversationId,
    string Reply,
    string Provider,
    string Model,
    bool FallbackUsed,
    DateTimeOffset RespondedAt);
