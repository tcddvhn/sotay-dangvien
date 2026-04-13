namespace Sotay.Server.Api.Models.Chatbot;

public sealed record ChatRequest(string Message, string? ConversationId = null, string? Context = null);
