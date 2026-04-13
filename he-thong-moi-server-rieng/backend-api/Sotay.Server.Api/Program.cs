using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sotay.Server.Api.Configuration;
using Sotay.Server.Api.Data;
using Sotay.Server.Api.Data.Identity;
using Sotay.Server.Api.Services;
using Sotay.Server.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<DatabaseOptions>(builder.Configuration.GetSection(DatabaseOptions.SectionName));
builder.Services.Configure<ChatbotOptions>(builder.Configuration.GetSection(ChatbotOptions.SectionName));
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection(AuthOptions.SectionName));
builder.Services.Configure<AdminSeedOptions>(builder.Configuration.GetSection(AdminSeedOptions.SectionName));
builder.Services.Configure<SampleDataSeedOptions>(builder.Configuration.GetSection(SampleDataSeedOptions.SectionName));

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendOnly", policy =>
    {
        policy.WithOrigins(
                "https://sotaynghiepvu.dcs.vn",
                "https://localhost:5443",
                "http://localhost:5080")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

var databaseConnectionString = builder.Configuration
    .GetSection(DatabaseOptions.SectionName)
    .GetValue<string>(nameof(DatabaseOptions.ConnectionString));

var chatbotApiKey = builder.Configuration
    .GetSection(ChatbotOptions.SectionName)
    .GetValue<string>(nameof(ChatbotOptions.ApiKey));

if (!string.IsNullOrWhiteSpace(databaseConnectionString))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(databaseConnectionString));

    builder.Services
        .AddAuthentication(IdentityConstants.ApplicationScheme)
        .AddCookie(IdentityConstants.ApplicationScheme, options =>
        {
            options.Cookie.Name = builder.Configuration
                .GetSection(AuthOptions.SectionName)
                .GetValue<string>(nameof(AuthOptions.CookieName)) ?? "sotay_admin";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.SlidingExpiration = true;
        });

    builder.Services
        .AddIdentityCore<AdminUserEntity>(options =>
        {
            options.Password.RequiredLength = 10;
            options.Password.RequireDigit = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = false;
        })
        .AddRoles<IdentityRole<Guid>>()
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddSignInManager();

    builder.Services.AddScoped<IContentService, SqlContentService>();
    builder.Services.AddScoped<IDirectoryService, SqlDirectoryService>();
    builder.Services.AddScoped<IAdminAuthService, IdentityAdminAuthService>();
    builder.Services.AddHostedService<AdminSeedHostedService>();
    builder.Services.AddHostedService<SampleDataSeedHostedService>();
}
else
{
    builder.Services.AddAuthentication();
    builder.Services.AddSingleton<IContentService, MockContentService>();
    builder.Services.AddSingleton<IDirectoryService, MockDirectoryService>();
    builder.Services.AddSingleton<IAdminAuthService, MockAdminAuthService>();
}

if (!string.IsNullOrWhiteSpace(chatbotApiKey))
{
    builder.Services.AddHttpClient<IChatbotService, OpenAiChatbotService>((serviceProvider, client) =>
    {
        var options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<ChatbotOptions>>().Value;
        client.BaseAddress = new Uri(options.BaseUrl);
        client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", options.ApiKey);
    });
}
else
{
    builder.Services.AddSingleton<IChatbotService, MockChatbotService>();
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendOnly");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
