using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sotay.Server.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLegacyIdsForImport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LegacyId",
                schema: "directory",
                table: "Units",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LegacyId",
                schema: "core",
                table: "ContentNodes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Units_LegacyId",
                schema: "directory",
                table: "Units",
                column: "LegacyId",
                unique: true,
                filter: "[LegacyId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ContentNodes_LegacyId",
                schema: "core",
                table: "ContentNodes",
                column: "LegacyId",
                unique: true,
                filter: "[LegacyId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Units_LegacyId",
                schema: "directory",
                table: "Units");

            migrationBuilder.DropIndex(
                name: "IX_ContentNodes_LegacyId",
                schema: "core",
                table: "ContentNodes");

            migrationBuilder.DropColumn(
                name: "LegacyId",
                schema: "directory",
                table: "Units");

            migrationBuilder.DropColumn(
                name: "LegacyId",
                schema: "core",
                table: "ContentNodes");
        }
    }
}
