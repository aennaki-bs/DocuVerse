using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class FixIsCircuitCompletedDataType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Fix IsCircuitCompleted
            migrationBuilder.AddColumn<bool>(
                name: "IsCircuitCompleted_New",
                table: "Documents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(@"
                UPDATE Documents 
                SET IsCircuitCompleted_New = 
                    CASE 
                        WHEN IsCircuitCompleted = '1' OR IsCircuitCompleted = 'true' OR IsCircuitCompleted = 'True' THEN 1
                        ELSE 0
                    END
            ");

            migrationBuilder.DropColumn(
                name: "IsCircuitCompleted",
                table: "Documents");

            migrationBuilder.RenameColumn(
                name: "IsCircuitCompleted_New",
                table: "Documents",
                newName: "IsCircuitCompleted");
                
            // Fix DocumentExterne if it's also stored as a string
            migrationBuilder.AddColumn<bool>(
                name: "DocumentExterne_New",
                table: "Documents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(@"
                UPDATE Documents 
                SET DocumentExterne_New = 
                    CASE 
                        WHEN DocumentExterne = '1' OR DocumentExterne = 'true' OR DocumentExterne = 'True' THEN 1
                        ELSE 0
                    END
            ");

            migrationBuilder.DropColumn(
                name: "DocumentExterne",
                table: "Documents");

            migrationBuilder.RenameColumn(
                name: "DocumentExterne_New",
                table: "Documents",
                newName: "DocumentExterne");
                
            // Fix IsDeleted if it's also stored as a string
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted_New",
                table: "Documents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(@"
                UPDATE Documents 
                SET IsDeleted_New = 
                    CASE 
                        WHEN IsDeleted = '1' OR IsDeleted = 'true' OR IsDeleted = 'True' THEN 1
                        ELSE 0
                    END
            ");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Documents");

            migrationBuilder.RenameColumn(
                name: "IsDeleted_New",
                table: "Documents",
                newName: "IsDeleted");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert IsCircuitCompleted
            migrationBuilder.AddColumn<string>(
                name: "IsCircuitCompleted_Old",
                table: "Documents",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
                UPDATE Documents 
                SET IsCircuitCompleted_Old = 
                    CASE 
                        WHEN IsCircuitCompleted = 1 THEN 'true'
                        ELSE 'false'
                    END
            ");

            migrationBuilder.DropColumn(
                name: "IsCircuitCompleted",
                table: "Documents");

            migrationBuilder.RenameColumn(
                name: "IsCircuitCompleted_Old",
                table: "Documents",
                newName: "IsCircuitCompleted");
                
            // Revert DocumentExterne
            migrationBuilder.AddColumn<string>(
                name: "DocumentExterne_Old",
                table: "Documents",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
                UPDATE Documents 
                SET DocumentExterne_Old = 
                    CASE 
                        WHEN DocumentExterne = 1 THEN 'true'
                        ELSE 'false'
                    END
            ");

            migrationBuilder.DropColumn(
                name: "DocumentExterne",
                table: "Documents");

            migrationBuilder.RenameColumn(
                name: "DocumentExterne_Old",
                table: "Documents",
                newName: "DocumentExterne");
                
            // Revert IsDeleted
            migrationBuilder.AddColumn<string>(
                name: "IsDeleted_Old",
                table: "Documents",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
                UPDATE Documents 
                SET IsDeleted_Old = 
                    CASE 
                        WHEN IsDeleted = 1 THEN 'true'
                        ELSE 'false'
                    END
            ");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Documents");

            migrationBuilder.RenameColumn(
                name: "IsDeleted_Old",
                table: "Documents",
                newName: "IsDeleted");
        }
    }
}
