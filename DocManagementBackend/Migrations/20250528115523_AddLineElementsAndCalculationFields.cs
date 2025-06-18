using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddLineElementsAndCalculationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "Lignes",
                type: "decimal(18,4)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPercentage",
                table: "Lignes",
                type: "decimal(5,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "GeneralAccountsCode",
                table: "Lignes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemCode",
                table: "Lignes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PriceHT",
                table: "Lignes",
                type: "decimal(18,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Quantity",
                table: "Lignes",
                type: "decimal(18,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "TypeId",
                table: "Lignes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UniteCodeCode",
                table: "Lignes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "VatPercentage",
                table: "Lignes",
                type: "decimal(5,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "GeneralAccounts",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneralAccounts", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "LignesElementTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeElement = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TableName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LignesElementTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UniteCodes",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UniteCodes", x => x.Code);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_GeneralAccountsCode",
                table: "Lignes",
                column: "GeneralAccountsCode");

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_ItemCode",
                table: "Lignes",
                column: "ItemCode");

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_TypeId",
                table: "Lignes",
                column: "TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_UniteCodeCode",
                table: "Lignes",
                column: "UniteCodeCode");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralAccounts_Code",
                table: "GeneralAccounts",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Items_Code",
                table: "Items",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LignesElementTypes_TypeElement",
                table: "LignesElementTypes",
                column: "TypeElement",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UniteCodes_Code",
                table: "UniteCodes",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Lignes_GeneralAccounts_GeneralAccountsCode",
                table: "Lignes",
                column: "GeneralAccountsCode",
                principalTable: "GeneralAccounts",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Lignes_Items_ItemCode",
                table: "Lignes",
                column: "ItemCode",
                principalTable: "Items",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Lignes_LignesElementTypes_TypeId",
                table: "Lignes",
                column: "TypeId",
                principalTable: "LignesElementTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Lignes_UniteCodes_UniteCodeCode",
                table: "Lignes",
                column: "UniteCodeCode",
                principalTable: "UniteCodes",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_GeneralAccounts_GeneralAccountsCode",
                table: "Lignes");

            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_Items_ItemCode",
                table: "Lignes");

            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_LignesElementTypes_TypeId",
                table: "Lignes");

            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_UniteCodes_UniteCodeCode",
                table: "Lignes");

            migrationBuilder.DropTable(
                name: "GeneralAccounts");

            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.DropTable(
                name: "LignesElementTypes");

            migrationBuilder.DropTable(
                name: "UniteCodes");

            migrationBuilder.DropIndex(
                name: "IX_Lignes_GeneralAccountsCode",
                table: "Lignes");

            migrationBuilder.DropIndex(
                name: "IX_Lignes_ItemCode",
                table: "Lignes");

            migrationBuilder.DropIndex(
                name: "IX_Lignes_TypeId",
                table: "Lignes");

            migrationBuilder.DropIndex(
                name: "IX_Lignes_UniteCodeCode",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "DiscountPercentage",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "GeneralAccountsCode",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "ItemCode",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "PriceHT",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "TypeId",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "UniteCodeCode",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "VatPercentage",
                table: "Lignes");
        }
    }
}
