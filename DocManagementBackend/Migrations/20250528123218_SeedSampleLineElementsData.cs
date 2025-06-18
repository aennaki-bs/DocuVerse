using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class SeedSampleLineElementsData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var now = new DateTime(2025, 5, 28, 12, 32, 18, DateTimeKind.Utc);

            // Seed Items
            migrationBuilder.InsertData(
                table: "Items",
                columns: new[] { "Code", "Description", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { "ITM001", "Office Supplies - Paper", now, now },
                    { "ITM002", "Office Supplies - Pens", now, now },
                    { "ITM003", "Computer Equipment - Laptop", now, now },
                    { "ITM004", "Computer Equipment - Monitor", now, now },
                    { "ITM005", "Furniture - Office Chair", now, now },
                    { "ITM006", "Furniture - Desk", now, now },
                    { "SRV001", "Consulting Services", now, now },
                    { "SRV002", "IT Support Services", now, now },
                    { "SRV003", "Training Services", now, now },
                    { "SRV004", "Maintenance Services", now, now }
                });

            // Seed UniteCodes
            migrationBuilder.InsertData(
                table: "UniteCodes",
                columns: new[] { "Code", "Description", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { "PCS", "Pieces", now, now },
                    { "BOX", "Box", now, now },
                    { "KG", "Kilogram", now, now },
                    { "M", "Meter", now, now },
                    { "M2", "Square Meter", now, now },
                    { "M3", "Cubic Meter", now, now },
                    { "L", "Liter", now, now },
                    { "HR", "Hour", now, now },
                    { "DAY", "Day", now, now },
                    { "MONTH", "Month", now, now },
                    { "SET", "Set", now, now },
                    { "PACK", "Package", now, now }
                });

            // Seed GeneralAccounts
            migrationBuilder.InsertData(
                table: "GeneralAccounts",
                columns: new[] { "Code", "Description", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { "6061", "Office Supplies", now, now },
                    { "6062", "Computer Equipment", now, now },
                    { "6063", "Furniture and Fixtures", now, now },
                    { "6064", "Consulting Expenses", now, now },
                    { "6065", "IT Services", now, now },
                    { "6066", "Training Expenses", now, now },
                    { "6067", "Maintenance and Repairs", now, now },
                    { "6068", "Professional Services", now, now },
                    { "6069", "Miscellaneous Expenses", now, now },
                    { "2111", "Office Equipment", now, now },
                    { "2112", "Computer Hardware", now, now },
                    { "2113", "Furniture", now, now }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove sample data
            migrationBuilder.DeleteData(
                table: "Items",
                keyColumn: "Code",
                keyValues: new object[] { "ITM001", "ITM002", "ITM003", "ITM004", "ITM005", "ITM006", "SRV001", "SRV002", "SRV003", "SRV004" });

            migrationBuilder.DeleteData(
                table: "UniteCodes",
                keyColumn: "Code",
                keyValues: new object[] { "PCS", "BOX", "KG", "M", "M2", "M3", "L", "HR", "DAY", "MONTH", "SET", "PACK" });

            migrationBuilder.DeleteData(
                table: "GeneralAccounts",
                keyColumn: "Code",
                keyValues: new object[] { "6061", "6062", "6063", "6064", "6065", "6066", "6067", "6068", "6069", "2111", "2112", "2113" });
        }
    }
}
