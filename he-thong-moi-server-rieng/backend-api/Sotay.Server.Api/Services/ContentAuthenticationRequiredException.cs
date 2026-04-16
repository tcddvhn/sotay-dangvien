namespace Sotay.Server.Api.Services;

public sealed class ContentAuthenticationRequiredException(string message) : Exception(message);
