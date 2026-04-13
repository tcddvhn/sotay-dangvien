using Sotay.Server.Api.Models.Chatbot;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class MockChatbotService : IChatbotService
{
    public Task<ChatReplyDto> AskAsync(ChatRequest request, CancellationToken cancellationToken)
    {
        var conversationId = string.IsNullOrWhiteSpace(request.ConversationId)
            ? Guid.NewGuid().ToString("N")
            : request.ConversationId;

        var reply = "Đây là phản hồi mẫu từ backend chatbot mới. Bước tiếp theo là thay service này bằng gateway gọi API AI thật từ server riêng.";

        return Task.FromResult(new ChatReplyDto(
            conversationId,
            reply,
            "MockProvider",
            "mock-model",
            false,
            DateTimeOffset.UtcNow));
    }
}
