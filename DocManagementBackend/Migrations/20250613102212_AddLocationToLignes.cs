using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationToLignes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LocationCode",
                table: "Lignes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lignes_LocationCode",
                table: "Lignes",
                column: "LocationCode");

            migrationBuilder.AddForeignKey(
                name: "FK_Lignes_Locations_LocationCode",
                table: "Lignes",
                column: "LocationCode",
                principalTable: "Locations",
                principalColumn: "LocationCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lignes_Locations_LocationCode",
                table: "Lignes");

            migrationBuilder.DropIndex(
                name: "IX_Lignes_LocationCode",
                table: "Lignes");

            migrationBuilder.DropColumn(
                name: "LocationCode",
                table: "Lignes");
        }
    }
}
