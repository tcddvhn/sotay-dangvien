using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Sotay.Server.Api.Configuration;
using Sotay.Server.Api.Data.Identity;

namespace Sotay.Server.Api.Services;

public sealed class AdminSeedHostedService(
    IServiceProvider serviceProvider,
    IOptions<AdminSeedOptions> adminSeedOptions) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var options = adminSeedOptions.Value;
        if (!options.Enabled)
        {
            return;
        }

        using var scope = serviceProvider.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AdminUserEntity>>();

        if (!await roleManager.RoleExistsAsync(options.RoleName))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>(options.RoleName));
        }

        var user = await userManager.FindByNameAsync(options.UserName)
            ?? await userManager.FindByEmailAsync(options.Email);

        if (user is null)
        {
            user = new AdminUserEntity
            {
                UserName = options.UserName,
                Email = options.Email,
                DisplayName = options.DisplayName,
                EmailConfirmed = true,
                IsActive = true
            };

            var createResult = await userManager.CreateAsync(user, options.Password);
            if (!createResult.Succeeded)
            {
                return;
            }
        }

        if (!await userManager.IsInRoleAsync(user, options.RoleName))
        {
            await userManager.AddToRoleAsync(user, options.RoleName);
        }
    }
}
