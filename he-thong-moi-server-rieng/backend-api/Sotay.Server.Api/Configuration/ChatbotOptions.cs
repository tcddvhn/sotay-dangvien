namespace Sotay.Server.Api.Configuration;

public sealed class ChatbotOptions
{
    public const string SectionName = "Chatbot";

    public string Provider { get; set; } = "OpenAI";

    public string BaseUrl { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public int TimeoutSeconds { get; set; } = 30;

    public string ApiKey { get; set; } = string.Empty;
}
