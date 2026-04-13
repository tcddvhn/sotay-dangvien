using Sotay.Server.Api.Models.Chatbot;

namespace Sotay.Server.Api.Services.Interfaces;

public interface IChatbotService
{
    Task<ChatReplyDto> AskAsync(ChatRequest request, CancellationToken cancellationToken);
}
