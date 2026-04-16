namespace Sotay.Server.Api.Services;

public sealed class AdminPermissionAuthenticationRequiredException(string message) : Exception(message);
