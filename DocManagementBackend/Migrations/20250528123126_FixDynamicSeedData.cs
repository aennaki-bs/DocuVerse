using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class FixDynamicSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 5, 28, 11, 55, 57, 0, DateTimeKind.Utc), new DateTime(2025, 5, 28, 11, 55, 57, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 5, 28, 11, 55, 57, 0, DateTimeKind.Utc), new DateTime(2025, 5, 28, 11, 55, 57, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 5, 28, 11, 55, 57, 0, DateTimeKind.Utc), new DateTime(2025, 5, 28, 11, 55, 57, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(6786), new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(7057) });

            migrationBuilder.UpdateData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(7303), new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(7303) });

            migrationBuilder.UpdateData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(7305), new DateTime(2025, 5, 28, 11, 55, 56, 371, DateTimeKind.Utc).AddTicks(7306) });
        }
    }
}
