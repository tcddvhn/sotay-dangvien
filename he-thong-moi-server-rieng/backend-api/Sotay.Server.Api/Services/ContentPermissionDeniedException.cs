namespace Sotay.Server.Api.Services;

public sealed class ContentPermissionDeniedException(string message) : Exception(message);
