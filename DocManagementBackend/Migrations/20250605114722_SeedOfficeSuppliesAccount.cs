using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class SeedOfficeSuppliesAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var now = DateTime.UtcNow;
            
            // Seed the OS101 general account that was referenced in tests
            migrationBuilder.InsertData(
                table: "GeneralAccounts",
                columns: new[] { "Code", "Description", "Type", "LinesCount", "CreatedAt", "UpdatedAt" },
                values: new object[] { "OS101", "Office Supplies - Basic", "Expense", 0, now, now });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "GeneralAccounts",
                keyColumn: "Code",
                keyValue: "OS101");
        }
    }
}
