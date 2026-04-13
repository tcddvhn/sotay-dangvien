using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Sotay.Server.Api.Configuration;
using Sotay.Server.Api.Data;
using Sotay.Server.Api.Data.Entities;

namespace Sotay.Server.Api.Services;

public sealed class SampleDataSeedHostedService(
    IServiceProvider serviceProvider,
    IOptions<SampleDataSeedOptions> sampleDataSeedOptions) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!sampleDataSeedOptions.Value.Enabled)
        {
            return;
        }

        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var hasContent = await dbContext.ContentNodes.AnyAsync(stoppingToken);
        if (!hasContent)
        {
            dbContext.ContentNodes.AddRange(BuildSampleContentNodes());
        }

        var hasDirectory = await dbContext.DirectoryUnits.AnyAsync(stoppingToken);
        if (!hasDirectory)
        {
            dbContext.DirectoryUnits.AddRange(BuildSampleDirectoryUnits());
        }

        if (!hasContent || !hasDirectory)
        {
            await dbContext.SaveChangesAsync(stoppingToken);
        }
    }

    private static IReadOnlyList<ContentNodeEntity> BuildSampleContentNodes()
    {
        var rootId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1");
        var questionId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2");
        var formId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3");

        return
        [
            new ContentNodeEntity
            {
                Id = rootId,
                ParentId = null,
                Title = "PHAN 1",
                Tag = "Quy dinh",
                SummaryHtml = "<p>Noi dung mau cho he thong moi.</p>",
                DetailHtml = "<p>Day la nut goc de kiem tra luong tai du lieu tu SQL Server.</p>",
                FileUrl = "",
                FileName = "",
                PdfRefsJson = "[]",
                ForceAccordion = false,
                Level = 0,
                SortOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "sample-seed",
                UpdatedBy = "sample-seed"
            },
            new ContentNodeEntity
            {
                Id = questionId,
                ParentId = rootId,
                Title = "Huong dan nghiep vu mau",
                Tag = "Hoi dap",
                SummaryHtml = "<p>Tom tat mau cho muc hoi dap.</p>",
                DetailHtml = "<p>Noi dung chi tiet mau de kiem tra hien thi tren frontend moi.</p>",
                FileUrl = "",
                FileName = "",
                PdfRefsJson = "[{\"doc\":\"hd02\",\"page\":\"1\"}]",
                ForceAccordion = false,
                Level = 1,
                SortOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "sample-seed",
                UpdatedBy = "sample-seed"
            },
            new ContentNodeEntity
            {
                Id = formId,
                ParentId = rootId,
                Title = "Bieu mau mau",
                Tag = "Bieu mau",
                SummaryHtml = "<p>Tom tat mau cho bieu mau.</p>",
                DetailHtml = "<p>Co the thay bang du lieu that sau khi migrate.</p>",
                FileUrl = "https://example.invalid/bieu-mau-mau.docx",
                FileName = "bieu-mau-mau.docx",
                PdfRefsJson = "[]",
                ForceAccordion = false,
                Level = 1,
                SortOrder = 2,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "sample-seed",
                UpdatedBy = "sample-seed"
            }
        ];
    }

    private static IReadOnlyList<DirectoryUnitEntity> BuildSampleDirectoryUnits()
    {
        var level1Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1");
        var level2Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2");
        var level3Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3");

        return
        [
            new DirectoryUnitEntity
            {
                Id = level1Id,
                ParentId = null,
                Name = "Don vi cap 1 mau",
                UnitCode = "DV001",
                Level = 1,
                Phone = "024-0000000",
                Address = "Ha Noi",
                Location = "Tang 1",
                SortOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "sample-seed",
                UpdatedBy = "sample-seed"
            },
            new DirectoryUnitEntity
            {
                Id = level2Id,
                ParentId = level1Id,
                Name = "Don vi cap 2 mau",
                UnitCode = "DV001-01",
                Level = 2,
                Phone = "024-1111111",
                Address = "Ha Noi",
                Location = "Tang 2",
                SortOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "sample-seed",
                UpdatedBy = "sample-seed"
            },
            new DirectoryUnitEntity
            {
                Id = level3Id,
                ParentId = level2Id,
                Name = "Don vi cap 3 mau",
                UnitCode = "DV001-01-01",
                Level = 3,
                Phone = "024-2222222",
                Address = "Ha Noi",
                Location = "Tang 3",
                SortOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "sample-seed",
                UpdatedBy = "sample-seed"
            }
        ];
    }
}
