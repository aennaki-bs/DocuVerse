using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class RenameUnitCodeAndAddERPFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Items_UniteCodes_Unite",
                table: "Items");

            migrationBuilder.DropTable(
                name: "UniteCodes");

            migrationBuilder.AddColumn<string>(
                name: "ERPLineCode",
                table: "Lignes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ERPDocumentCode",
                table: "Documents",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "UnitOfMeasures",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ItemsCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitOfMeasures", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "ItemUnitOfMeasures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UnitOfMeasureCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    QtyPerUnitOfMeasure = table.Column<decimal>(type: "decimal(18,6)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemUnitOfMeasures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ItemUnitOfMeasures_Items_ItemCode",
                        column: x => x.ItemCode,
                        principalTable: "Items",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItemUnitOfMeasures_UnitOfMeasures_UnitOfMeasureCode",
                        column: x => x.UnitOfMeasureCode,
                        principalTable: "UnitOfMeasures",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_ERPLineCode",
                table: "Lignes",
                column: "ERPLineCode",
                unique: true,
                filter: "[ERPLineCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ERPDocumentCode",
                table: "Documents",
                column: "ERPDocumentCode",
                unique: true,
                filter: "[ERPDocumentCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ItemUnitOfMeasures_ItemCode_UnitOfMeasureCode",
                table: "ItemUnitOfMeasures",
                columns: new[] { "ItemCode", "UnitOfMeasureCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemUnitOfMeasures_UnitOfMeasureCode",
                table: "ItemUnitOfMeasures",
                column: "UnitOfMeasureCode");

            migrationBuilder.CreateIndex(
                name: "IX_UnitOfMeasures_Code",
                table: "UnitOfMeasures",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Items_UnitOfMeasures_Unite",
                table: "Items",
                column: "Unite",
                principalTable: "UnitOfMeasures",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Items_UnitOfMeasures_Unite",
                table: "Items");

            migrationBuilder.DropTable(
                name: "ItemUnitOfMeasures");

            migrationBuilder.DropTable(
                name: "UnitOfMeasures");

            migrationBuilder.DropIndex(
                name: "IX_Lignes_ERPLineCode",
                table: "Lignes");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ERPDocumentCode",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "ERPLineCode",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "ERPDocumentCode",
                table: "Documents");

            migrationBuilder.CreateTable(
                name: "UniteCodes",
                columns: table => new
                {
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ItemsCount = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UniteCodes", x => x.Code);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UniteCodes_Code",
                table: "UniteCodes",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Items_UniteCodes_Unite",
                table: "Items",
                column: "Unite",
                principalTable: "UniteCodes",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
