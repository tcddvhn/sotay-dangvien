namespace Sotay.Server.Api.Models.Common;

public sealed record ApiEnvelope<T>(bool Success, T? Data, string? Message = null);
