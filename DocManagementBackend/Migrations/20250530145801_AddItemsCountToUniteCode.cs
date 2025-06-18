using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddItemsCountToUniteCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ItemsCount",
                table: "UniteCodes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Populate ItemsCount for existing UniteCodes
            migrationBuilder.Sql(@"
                UPDATE uc 
                SET uc.ItemsCount = (
                    SELECT COUNT(*)
                    FROM Items i 
                    WHERE i.Unite = uc.Code
                )
                FROM UniteCodes uc
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ItemsCount",
                table: "UniteCodes");
        }
    }
}
