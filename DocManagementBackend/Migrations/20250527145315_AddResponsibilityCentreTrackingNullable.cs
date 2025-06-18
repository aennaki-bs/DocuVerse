using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddResponsibilityCentreTrackingNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ResponsibilityCentreId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ResponsibilityCentreId",
                table: "Documents",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ResponsibilityCentres",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResponsibilityCentres", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ResponsibilityCentres",
                columns: new[] { "Id", "Code", "CreatedAt", "Descr", "IsActive", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "ADMIN", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Administration Department", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "FINANCE", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Finance Department", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "HR", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Human Resources Department", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, "IT", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Information Technology Department", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, "SALES", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Sales Department", true, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_ResponsibilityCentreId",
                table: "Users",
                column: "ResponsibilityCentreId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ResponsibilityCentreId",
                table: "Documents",
                column: "ResponsibilityCentreId");

            migrationBuilder.CreateIndex(
                name: "IX_ResponsibilityCentres_Code",
                table: "ResponsibilityCentres",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_ResponsibilityCentres_ResponsibilityCentreId",
                table: "Documents",
                column: "ResponsibilityCentreId",
                principalTable: "ResponsibilityCentres",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_ResponsibilityCentres_ResponsibilityCentreId",
                table: "Users",
                column: "ResponsibilityCentreId",
                principalTable: "ResponsibilityCentres",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_ResponsibilityCentres_ResponsibilityCentreId",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_ResponsibilityCentres_ResponsibilityCentreId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "ResponsibilityCentres");

            migrationBuilder.DropIndex(
                name: "IX_Users_ResponsibilityCentreId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ResponsibilityCentreId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "ResponsibilityCentreId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ResponsibilityCentreId",
                table: "Documents");
        }
    }
}
