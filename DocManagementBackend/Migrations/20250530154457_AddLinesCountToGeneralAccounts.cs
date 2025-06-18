using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddLinesCountToGeneralAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LinesCount",
                table: "GeneralAccounts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Data migration: Populate LinesCount for existing GeneralAccounts
            migrationBuilder.Sql(@"
                UPDATE GeneralAccounts 
                SET LinesCount = (
                    SELECT COUNT(*)
                    FROM LignesElementTypes let
                    INNER JOIN Lignes l ON l.LignesElementTypeId = let.Id
                    WHERE let.AccountCode = GeneralAccounts.Code
                        AND let.TypeElement = 'General Accounts'
                )
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LinesCount",
                table: "GeneralAccounts");
        }
    }
}
