using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLineElementsStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_UniteCodes_UniteCodeCode",
                table: "Lignes");

            migrationBuilder.DropIndex(
                name: "IX_Lignes_UniteCodeCode",
                table: "Lignes");

            migrationBuilder.DeleteData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "UniteCodeCode",
                table: "Lignes");

            migrationBuilder.AddColumn<string>(
                name: "Unite",
                table: "Items",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "TableName", "TypeElement" },
                values: new object[] { "General accounting codes", "GeneralAccounts", "General Accounts" });

            migrationBuilder.CreateIndex(
                name: "IX_Items_Unite",
                table: "Items",
                column: "Unite");

            migrationBuilder.AddForeignKey(
                name: "FK_Items_UniteCodes_Unite",
                table: "Items",
                column: "Unite",
                principalTable: "UniteCodes",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Items_UniteCodes_Unite",
                table: "Items");

            migrationBuilder.DropIndex(
                name: "IX_Items_Unite",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Unite",
                table: "Items");

            migrationBuilder.AddColumn<string>(
                name: "UniteCodeCode",
                table: "Lignes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "LignesElementTypes",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "TableName", "TypeElement" },
                values: new object[] { "Unit of measurement codes", "UniteCode", "Unite code" });

            migrationBuilder.InsertData(
                table: "LignesElementTypes",
                columns: new[] { "Id", "CreatedAt", "Description", "TableName", "TypeElement", "UpdatedAt" },
                values: new object[] { 3, new DateTime(2025, 5, 28, 11, 55, 57, 0, DateTimeKind.Utc), "General accounting codes", "GeneralAccounts", "General Accounts", new DateTime(2025, 5, 28, 11, 55, 57, 0, DateTimeKind.Utc) });

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_UniteCodeCode",
                table: "Lignes",
                column: "UniteCodeCode");

            migrationBuilder.AddForeignKey(
                name: "FK_Lignes_UniteCodes_UniteCodeCode",
                table: "Lignes",
                column: "UniteCodeCode",
                principalTable: "UniteCodes",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
