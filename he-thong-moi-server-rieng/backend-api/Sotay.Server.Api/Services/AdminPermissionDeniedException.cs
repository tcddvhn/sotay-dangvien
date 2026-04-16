namespace Sotay.Server.Api.Services;

public sealed class AdminPermissionDeniedException(string message) : Exception(message);
