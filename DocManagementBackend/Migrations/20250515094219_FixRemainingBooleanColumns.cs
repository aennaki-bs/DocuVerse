using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class FixRemainingBooleanColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Fix DocumentExterne if it's stored as a string
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
                
            // Fix IsDeleted if it's stored as a string
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
