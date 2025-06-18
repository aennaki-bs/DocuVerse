using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class FixElementTypeEnumValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Fix the incorrect enum values in TypeElement column
            // Change 'General Accounts' to 'GeneralAccounts'
            migrationBuilder.Sql(@"
                UPDATE LignesElementTypes 
                SET TypeElement = 'GeneralAccounts' 
                WHERE TypeElement = 'General Accounts'
            ");
            
            // Remove any invalid enum values that don't exist in the ElementType enum
            // This includes 'Unite code' and any other invalid values
            migrationBuilder.Sql(@"
                DELETE FROM LignesElementTypes 
                WHERE TypeElement NOT IN ('Item', 'GeneralAccounts')
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert the changes (restore original incorrect values)
            migrationBuilder.Sql(@"
                UPDATE LignesElementTypes 
                SET TypeElement = 'General Accounts' 
                WHERE TypeElement = 'GeneralAccounts'
            ");
        }
    }
}
