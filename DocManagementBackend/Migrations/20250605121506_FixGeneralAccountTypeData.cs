using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class FixGeneralAccountTypeData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Fix invalid GeneralAccountType values in the database
            // Replace invalid string values with valid enum values
            
            // Update "General Accounts" to "Expense" (most common for general accounts)
            migrationBuilder.Sql(@"
                UPDATE GeneralAccounts 
                SET Type = 'Expense' 
                WHERE Type = 'General Accounts'
            ");
            
            // Update any other invalid values to default to "Expense"
            migrationBuilder.Sql(@"
                UPDATE GeneralAccounts 
                SET Type = 'Expense' 
                WHERE Type NOT IN ('Revenue', 'Expense', 'Asset', 'Liability', 'Equity')
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert changes (restore original invalid values)
            migrationBuilder.Sql(@"
                UPDATE GeneralAccounts 
                SET Type = 'General Accounts' 
                WHERE Type = 'Expense'
            ");
        }
    }
}
