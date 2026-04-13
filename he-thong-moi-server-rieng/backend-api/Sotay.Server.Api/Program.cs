using Microsoft.EntityFrameworkCore;
using Sotay.Server.Api.Configuration;
using Sotay.Server.Api.Data;
using Sotay.Server.Api.Services;
using Sotay.Server.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<DatabaseOptions>(builder.Configuration.GetSection(DatabaseOptions.SectionName));
builder.Services.Configure<ChatbotOptions>(builder.Configuration.GetSection(ChatbotOptions.SectionName));
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection(AuthOptions.SectionName));

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

var databaseConnectionString = builder.Configuration
    .GetSection(DatabaseOptions.SectionName)
    .GetValue<string>(nameof(DatabaseOptions.ConnectionString));

if (!string.IsNullOrWhiteSpace(databaseConnectionString))
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(databaseConnectionString));

    builder.Services.AddScoped<IContentService, SqlContentService>();
    builder.Services.AddScoped<IDirectoryService, SqlDirectoryService>();
}
else
{
    builder.Services.AddSingleton<IContentService, MockContentService>();
    builder.Services.AddSingleton<IDirectoryService, MockDirectoryService>();
}

builder.Services.AddSingleton<IAdminAuthService, MockAdminAuthService>();
builder.Services.AddSingleton<IChatbotService, MockChatbotService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendOnly");
app.UseAuthorization();
app.MapControllers();

app.Run();
