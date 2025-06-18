using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDefaultResponsibilityCentres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ResponsibilityCentres",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ResponsibilityCentres",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "ResponsibilityCentres",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ResponsibilityCentres",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "ResponsibilityCentres",
                keyColumn: "Id",
                keyValue: 5);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
