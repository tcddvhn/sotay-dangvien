using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sotay.Server.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminProfilesAndContentPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "auth",
                table: "AdminUsers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "auth",
                table: "AdminUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginAt",
                schema: "auth",
                table: "AdminUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoleName",
                schema: "auth",
                table: "AdminUsers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "editor");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                schema: "auth",
                table: "AdminUsers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                schema: "auth",
                table: "AdminUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ContentPermissions",
                schema: "auth",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AdminUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContentNodeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaxDepth = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    AllowRead = table.Column<bool>(type: "bit", nullable: false),
                    AllowCreateChild = table.Column<bool>(type: "bit", nullable: false),
                    AllowEdit = table.Column<bool>(type: "bit", nullable: false),
                    AllowDelete = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContentPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContentPermissions_AdminUsers_AdminUserId",
                        column: x => x.AdminUserId,
                        principalSchema: "auth",
                        principalTable: "AdminUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContentPermissions_ContentNodes_ContentNodeId",
                        column: x => x.ContentNodeId,
                        principalSchema: "core",
                        principalTable: "ContentNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContentPermissions_AdminUserId_ContentNodeId",
                schema: "auth",
                table: "ContentPermissions",
                columns: new[] { "AdminUserId", "ContentNodeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContentPermissions_ContentNodeId",
                schema: "auth",
                table: "ContentPermissions",
                column: "ContentNodeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContentPermissions",
                schema: "auth");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "auth",
                table: "AdminUsers");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "auth",
                table: "AdminUsers");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                schema: "auth",
                table: "AdminUsers");

            migrationBuilder.DropColumn(
                name: "RoleName",
                schema: "auth",
                table: "AdminUsers");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                schema: "auth",
                table: "AdminUsers");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                schema: "auth",
                table: "AdminUsers");
        }
    }
}
