using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Sotay.Server.Api.Configuration;
using Sotay.Server.Api.Models.Chatbot;
using Sotay.Server.Api.Services.Interfaces;

namespace Sotay.Server.Api.Services;

public sealed class OpenAiChatbotService(
    HttpClient httpClient,
    IOptions<ChatbotOptions> chatbotOptions) : IChatbotService
{
    private readonly ChatbotOptions _options = chatbotOptions.Value;

    public async Task<ChatReplyDto> AskAsync(ChatRequest request, CancellationToken cancellationToken)
    {
        var conversationId = string.IsNullOrWhiteSpace(request.ConversationId)
            ? Guid.NewGuid().ToString("N")
            : request.ConversationId!;

        var payload = new
        {
            model = _options.Model,
            input = new object[]
            {
                new
                {
                    role = "system",
                    content = new object[]
                    {
                        new
                        {
                            type = "input_text",
                            text = _options.SystemPrompt
                        }
                    }
                },
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new
                        {
                            type = "input_text",
                            text = request.Message
                        }
                    }
                }
            }
        };

        using var response = await httpClient.PostAsJsonAsync(
            _options.EndpointPath,
            payload,
            cancellationToken);

        var raw = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"AI provider error {response.StatusCode}: {raw}");
        }

        var reply = ExtractReplyText(raw);
        if (string.IsNullOrWhiteSpace(reply))
        {
            reply = "Hệ thống đã nhận phản hồi từ AI nhưng chưa trích xuất được nội dung trả lời.";
        }

        return new ChatReplyDto(
            conversationId,
            reply,
            _options.Provider,
            _options.Model,
            false,
            DateTimeOffset.UtcNow);
    }

    private static string? ExtractReplyText(string rawJson)
    {
        using var document = JsonDocument.Parse(rawJson);
        var root = document.RootElement;

        if (root.TryGetProperty("output_text", out var outputTextElement)
            && outputTextElement.ValueKind == JsonValueKind.String)
        {
            return outputTextElement.GetString();
        }

        if (root.TryGetProperty("output", out var outputElement)
            && outputElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in outputElement.EnumerateArray())
            {
                if (!item.TryGetProperty("content", out var contentElement)
                    || contentElement.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var content in contentElement.EnumerateArray())
                {
                    if (content.TryGetProperty("text", out var textElement)
                        && textElement.ValueKind == JsonValueKind.String)
                    {
                        return textElement.GetString();
                    }
                }
            }
        }

        return null;
    }
}
