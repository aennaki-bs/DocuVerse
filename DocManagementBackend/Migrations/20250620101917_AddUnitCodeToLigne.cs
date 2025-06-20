using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddUnitCodeToLigne : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UnitCode",
                table: "Lignes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_UnitCode",
                table: "Lignes",
                column: "UnitCode");

            migrationBuilder.AddForeignKey(
                name: "FK_Lignes_UnitOfMeasures_UnitCode",
                table: "Lignes",
                column: "UnitCode",
                principalTable: "UnitOfMeasures",
                principalColumn: "Code");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_UnitOfMeasures_UnitCode",
                table: "Lignes");

            migrationBuilder.DropIndex(
                name: "IX_Lignes_UnitCode",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "UnitCode",
                table: "Lignes");
        }
    }
}
