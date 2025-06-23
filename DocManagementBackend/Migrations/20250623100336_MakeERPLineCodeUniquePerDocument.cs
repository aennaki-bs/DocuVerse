using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class MakeERPLineCodeUniquePerDocument : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the existing global unique constraint on ERPLineCode
            migrationBuilder.DropIndex(
                name: "IX_Lignes_ERPLineCode",
                table: "Lignes");

            // Create a new composite unique constraint on (DocumentId, ERPLineCode)
            // This allows same ERPLineCode in different documents but prevents duplicates within the same document
            migrationBuilder.CreateIndex(
                name: "IX_Lignes_DocumentId_ERPLineCode",
                table: "Lignes",
                columns: new[] { "DocumentId", "ERPLineCode" },
                unique: true,
                filter: "[ERPLineCode] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the composite unique constraint
            migrationBuilder.DropIndex(
                name: "IX_Lignes_DocumentId_ERPLineCode",
                table: "Lignes");

            // Restore the original global unique constraint on ERPLineCode
            migrationBuilder.CreateIndex(
                name: "IX_Lignes_ERPLineCode",
                table: "Lignes",
                column: "ERPLineCode",
                unique: true,
                filter: "[ERPLineCode] IS NOT NULL");
        }
    }
}
