using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentTypeToCircuit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DocumentTypeId",
                table: "Circuits",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Circuits_DocumentTypeId",
                table: "Circuits",
                column: "DocumentTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Circuits_DocumentTypes_DocumentTypeId",
                table: "Circuits",
                column: "DocumentTypeId",
                principalTable: "DocumentTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Circuits_DocumentTypes_DocumentTypeId",
                table: "Circuits");

            migrationBuilder.DropIndex(
                name: "IX_Circuits_DocumentTypeId",
                table: "Circuits");

            migrationBuilder.DropColumn(
                name: "DocumentTypeId",
                table: "Circuits");
        }
    }
}
