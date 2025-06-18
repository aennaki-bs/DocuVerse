using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class RefactorLineElementsWithDataMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Add new columns to LignesElementTypes
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "LignesElementTypes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ItemCode",
                table: "LignesElementTypes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountCode",
                table: "LignesElementTypes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            // Step 2: Update existing LignesElementTypes records with proper codes and references
            migrationBuilder.Sql(@"
                UPDATE LignesElementTypes 
                SET Code = CASE 
                    WHEN TypeElement = 'Item' THEN 'LEGACY_ITEM_TYPE'
                    WHEN TypeElement = 'General Accounts' THEN 'LEGACY_ACCOUNT_TYPE'
                    ELSE 'LEGACY_' + REPLACE(TypeElement, ' ', '_') + '_TYPE'
                END
                WHERE Code = ''
            ");

            // Step 3: Set any NULL LignesElementTypeId references in Lignes to NULL (clean up orphaned references)
            migrationBuilder.Sql(@"
                UPDATE Lignes 
                SET TypeId = NULL 
                WHERE TypeId IS NOT NULL 
                AND TypeId NOT IN (SELECT Id FROM LignesElementTypes)
            ");

            // Step 4: Create indexes for new columns
            migrationBuilder.CreateIndex(
                name: "IX_LignesElementTypes_AccountCode",
                table: "LignesElementTypes",
                column: "AccountCode");

            migrationBuilder.CreateIndex(
                name: "IX_LignesElementTypes_Code",
                table: "LignesElementTypes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LignesElementTypes_ItemCode",
                table: "LignesElementTypes",
                column: "ItemCode");

            // Step 5: Drop old constraints and indexes
            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_GeneralAccounts_GeneralAccountsCode",
                table: "Lignes");

            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_Items_ItemCode",
                table: "Lignes");

            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_LignesElementTypes_TypeId",
                table: "Lignes");

            migrationBuilder.DropIndex(
                name: "IX_LignesElementTypes_TypeElement",
                table: "LignesElementTypes");

            migrationBuilder.DropIndex(
                name: "IX_Lignes_GeneralAccountsCode",
                table: "Lignes");

            migrationBuilder.DropIndex(
                name: "IX_Lignes_ItemCode",
                table: "Lignes");

            // Step 6: Remove old direct reference columns from Lignes
            migrationBuilder.DropColumn(
                name: "GeneralAccountsCode",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "ItemCode",
                table: "Lignes");

            // Step 7: Rename TypeId to LignesElementTypeId
            migrationBuilder.RenameColumn(
                name: "TypeId",
                table: "Lignes",
                newName: "LignesElementTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_Lignes_TypeId",
                table: "Lignes",
                newName: "IX_Lignes_LignesElementTypeId");

            // Step 8: Add new foreign key relationships
            migrationBuilder.AddForeignKey(
                name: "FK_Lignes_LignesElementTypes_LignesElementTypeId",
                table: "Lignes",
                column: "LignesElementTypeId",
                principalTable: "LignesElementTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LignesElementTypes_GeneralAccounts_AccountCode",
                table: "LignesElementTypes",
                column: "AccountCode",
                principalTable: "GeneralAccounts",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LignesElementTypes_Items_ItemCode",
                table: "LignesElementTypes",
                column: "ItemCode",
                principalTable: "Items",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_LignesElementTypes_LignesElementTypeId",
                table: "Lignes");

            migrationBuilder.DropForeignKey(
                name: "FK_LignesElementTypes_GeneralAccounts_AccountCode",
                table: "LignesElementTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_LignesElementTypes_Items_ItemCode",
                table: "LignesElementTypes");

            migrationBuilder.DropIndex(
                name: "IX_LignesElementTypes_AccountCode",
                table: "LignesElementTypes");

            migrationBuilder.DropIndex(
                name: "IX_LignesElementTypes_Code",
                table: "LignesElementTypes");

            migrationBuilder.DropIndex(
                name: "IX_LignesElementTypes_ItemCode",
                table: "LignesElementTypes");

            migrationBuilder.DropColumn(
                name: "AccountCode",
                table: "LignesElementTypes");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "LignesElementTypes");

            migrationBuilder.DropColumn(
                name: "ItemCode",
                table: "LignesElementTypes");

            migrationBuilder.RenameColumn(
                name: "LignesElementTypeId",
                table: "Lignes",
                newName: "TypeId");

            migrationBuilder.RenameIndex(
                name: "IX_Lignes_LignesElementTypeId",
                table: "Lignes",
                newName: "IX_Lignes_TypeId");

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

            migrationBuilder.CreateIndex(
                name: "IX_LignesElementTypes_TypeElement",
                table: "LignesElementTypes",
                column: "TypeElement",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_GeneralAccountsCode",
                table: "Lignes",
                column: "GeneralAccountsCode");

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_ItemCode",
                table: "Lignes",
                column: "ItemCode");

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
        }
    }
}
