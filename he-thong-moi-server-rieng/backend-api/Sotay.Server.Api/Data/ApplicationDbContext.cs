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
    }
}
