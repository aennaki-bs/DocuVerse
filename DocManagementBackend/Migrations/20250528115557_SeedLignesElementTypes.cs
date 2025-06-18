using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class SeedLignesElementTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "LignesElementTypes",
                columns: new[] { "Id", "CreatedAt", "Description", "TableName", "TypeElement", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(6786), "Product or service items", "Item", "Item", new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(7057) },
                    { 2, new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(7303), "Unit of measurement codes", "UniteCode", "Unite code", new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(7303) },
                    { 3, new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(7305), "General accounting codes", "GeneralAccounts", "General Accounts", new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(7306) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
