using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Sotay.Server.Api.Data.Entities;
using Sotay.Server.Api.Data.Identity;

namespace Sotay.Server.Api.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<AdminUserEntity, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<ContentNodeEntity> ContentNodes => Set<ContentNodeEntity>();

    public DbSet<DirectoryUnitEntity> DirectoryUnits => Set<DirectoryUnitEntity>();

    public DbSet<SurveyResponseEntity> SurveyResponses => Set<SurveyResponseEntity>();

    public DbSet<UsageEventEntity> UsageEvents => Set<UsageEventEntity>();

    public DbSet<NoticeEntity> Notices => Set<NoticeEntity>();

    public DbSet<PushSubscriptionEntity> PushSubscriptions => Set<PushSubscriptionEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AdminUserEntity>(entity =>
        {
            entity.ToTable("AdminUsers", "auth");
            entity.Property(x => x.DisplayName).HasMaxLength(255);
            entity.Property(x => x.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<IdentityRole<Guid>>(entity =>
        {
            entity.ToTable("AdminRoles", "auth");
        });

        modelBuilder.Entity<IdentityUserRole<Guid>>(entity =>
        {
            entity.ToTable("AdminUserRoles", "auth");
        });

        modelBuilder.Entity<IdentityUserClaim<Guid>>(entity =>
        {
            entity.ToTable("AdminUserClaims", "auth");
        });

        modelBuilder.Entity<IdentityUserLogin<Guid>>(entity =>
        {
            entity.ToTable("AdminUserLogins", "auth");
        });

        modelBuilder.Entity<IdentityRoleClaim<Guid>>(entity =>
        {
            entity.ToTable("AdminRoleClaims", "auth");
        });

        modelBuilder.Entity<IdentityUserToken<Guid>>(entity =>
        {
            entity.ToTable("AdminUserTokens", "auth");
        });

        modelBuilder.Entity<ContentNodeEntity>(entity =>
        {
            entity.ToTable("ContentNodes", "core");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(500).IsRequired();
            entity.Property(x => x.Tag).HasMaxLength(250);
            entity.Property(x => x.FileUrl).HasMaxLength(1000);
            entity.Property(x => x.FileName).HasMaxLength(255);
            entity.Property(x => x.CreatedBy).HasMaxLength(100);
            entity.Property(x => x.UpdatedBy).HasMaxLength(100);
            entity.Property(x => x.ForceAccordion).HasDefaultValue(false);
            entity.HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DirectoryUnitEntity>(entity =>
        {
            entity.ToTable("Units", "directory");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(500).IsRequired();
            entity.Property(x => x.UnitCode).HasMaxLength(100);
            entity.Property(x => x.Phone).HasMaxLength(100);
            entity.Property(x => x.Address).HasMaxLength(1000);
            entity.Property(x => x.Location).HasMaxLength(1000);
            entity.Property(x => x.CreatedBy).HasMaxLength(100);
            entity.Property(x => x.UpdatedBy).HasMaxLength(100);
            entity.HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SurveyResponseEntity>(entity =>
        {
            entity.ToTable("Responses", "survey");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ResponseType).HasMaxLength(50).IsRequired();
            entity.Property(x => x.RatingLabel).HasMaxLength(100);
            entity.Property(x => x.SourcePage).HasMaxLength(255);
            entity.Property(x => x.ClientIpHash).HasMaxLength(255);
            entity.Property(x => x.UserAgent).HasMaxLength(1000);
        });

        modelBuilder.Entity<UsageEventEntity>(entity =>
        {
            entity.ToTable("UsageEvents", "stats");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ActionType).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Detail).HasMaxLength(2000);
            entity.Property(x => x.SessionKey).HasMaxLength(200);
            entity.Property(x => x.SourcePage).HasMaxLength(255);
            entity.Property(x => x.ClientIpHash).HasMaxLength(255);
            entity.Property(x => x.UserAgent).HasMaxLength(1000);
        });

        modelBuilder.Entity<NoticeEntity>(entity =>
        {
            entity.ToTable("Notices", "notify");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(300).IsRequired();
            entity.Property(x => x.CreatedBy).HasMaxLength(100);
            entity.Property(x => x.UpdatedBy).HasMaxLength(100);
            entity.Property(x => x.IsPublic).HasDefaultValue(false);
            entity.Property(x => x.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<PushSubscriptionEntity>(entity =>
        {
            entity.ToTable("Subscriptions", "notify");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.EndpointUrl).HasMaxLength(2000).IsRequired();
            entity.Property(x => x.P256dh).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.AuthSecret).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.BrowserName).HasMaxLength(100);
            entity.Property(x => x.DeviceLabel).HasMaxLength(255);
            entity.Property(x => x.UserKey).HasMaxLength(100);
            entity.Property(x => x.IsActive).HasDefaultValue(true);
            entity.HasIndex(x => x.EndpointUrl).IsUnique();
        });
    }
}
