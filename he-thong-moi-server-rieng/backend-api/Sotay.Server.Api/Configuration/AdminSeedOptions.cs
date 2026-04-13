namespace Sotay.Server.Api.Configuration;

public sealed class AdminSeedOptions
{
    public const string SectionName = "AdminSeed";

    public bool Enabled { get; set; }

    public string UserName { get; set; } = "admin";

    public string Email { get; set; } = "admin@sotay.local";

    public string Password { get; set; } = "ChangeMe123!";

    public string DisplayName { get; set; } = "Quản trị viên hệ thống";

    public string RoleName { get; set; } = "SuperAdmin";
}
