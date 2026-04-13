namespace Sotay.Server.Api.Configuration;

public sealed class ChatbotOptions
{
    public const string SectionName = "Chatbot";

    public string Provider { get; set; } = "OpenAI";

    public string BaseUrl { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public int TimeoutSeconds { get; set; } = 30;

    public string ApiKey { get; set; } = string.Empty;

    public string EndpointPath { get; set; } = "/responses";

    public string SystemPrompt { get; set; } = "Ban la tro ly AI cua So tay nghiep vu. Chi tra loi trong pham vi nghiep vu va huong dan su dung he thong.";
}
