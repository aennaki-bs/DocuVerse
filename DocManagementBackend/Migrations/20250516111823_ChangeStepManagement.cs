using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class ChangeStepManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Approvators_Steps_StepId",
                table: "Approvators");

            migrationBuilder.DropForeignKey(
                name: "FK_ApprovatorsGroups_Steps_StepId",
                table: "ApprovatorsGroups");

            migrationBuilder.AddColumn<int>(
                name: "ApprovatorId",
                table: "Steps",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovatorsGroupId",
                table: "Steps",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "StepId",
                table: "ApprovatorsGroups",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "StepId",
                table: "Approvators",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "StepApprovalAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    ApprovatorId = table.Column<int>(type: "int", nullable: true),
                    ApprovatorsGroupId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StepApprovalAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StepApprovalAssignments_ApprovatorsGroups_ApprovatorsGroupId",
                        column: x => x.ApprovatorsGroupId,
                        principalTable: "ApprovatorsGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StepApprovalAssignments_Approvators_ApprovatorId",
                        column: x => x.ApprovatorId,
                        principalTable: "Approvators",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StepApprovalAssignments_Steps_StepId",
                        column: x => x.StepId,
                        principalTable: "Steps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Steps_ApprovatorId",
                table: "Steps",
                column: "ApprovatorId");

            migrationBuilder.CreateIndex(
                name: "IX_Steps_ApprovatorsGroupId",
                table: "Steps",
                column: "ApprovatorsGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWritings_ApprovatorId",
                table: "ApprovalWritings",
                column: "ApprovatorId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWritings_ApprovatorsGroupId",
                table: "ApprovalWritings",
                column: "ApprovatorsGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_StepApprovalAssignments_ApprovatorId",
                table: "StepApprovalAssignments",
                column: "ApprovatorId");

            migrationBuilder.CreateIndex(
                name: "IX_StepApprovalAssignments_ApprovatorsGroupId",
                table: "StepApprovalAssignments",
                column: "ApprovatorsGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_StepApprovalAssignments_StepId",
                table: "StepApprovalAssignments",
                column: "StepId");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalWritings_ApprovatorsGroups_ApprovatorsGroupId",
                table: "ApprovalWritings",
                column: "ApprovatorsGroupId",
                principalTable: "ApprovatorsGroups",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovalWritings_Approvators_ApprovatorId",
                table: "ApprovalWritings",
                column: "ApprovatorId",
                principalTable: "Approvators",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Approvators_Steps_StepId",
                table: "Approvators",
                column: "StepId",
                principalTable: "Steps",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovatorsGroups_Steps_StepId",
                table: "ApprovatorsGroups",
                column: "StepId",
                principalTable: "Steps",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Steps_ApprovatorsGroups_ApprovatorsGroupId",
                table: "Steps",
                column: "ApprovatorsGroupId",
                principalTable: "ApprovatorsGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Steps_Approvators_ApprovatorId",
                table: "Steps",
                column: "ApprovatorId",
                principalTable: "Approvators",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ApprovalWritings_ApprovatorsGroups_ApprovatorsGroupId",
                table: "ApprovalWritings");

            migrationBuilder.DropForeignKey(
                name: "FK_ApprovalWritings_Approvators_ApprovatorId",
                table: "ApprovalWritings");

            migrationBuilder.DropForeignKey(
                name: "FK_Approvators_Steps_StepId",
                table: "Approvators");

            migrationBuilder.DropForeignKey(
                name: "FK_ApprovatorsGroups_Steps_StepId",
                table: "ApprovatorsGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_Steps_ApprovatorsGroups_ApprovatorsGroupId",
                table: "Steps");

            migrationBuilder.DropForeignKey(
                name: "FK_Steps_Approvators_ApprovatorId",
                table: "Steps");

            migrationBuilder.DropTable(
                name: "StepApprovalAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Steps_ApprovatorId",
                table: "Steps");

            migrationBuilder.DropIndex(
                name: "IX_Steps_ApprovatorsGroupId",
                table: "Steps");

            migrationBuilder.DropIndex(
                name: "IX_ApprovalWritings_ApprovatorId",
                table: "ApprovalWritings");

            migrationBuilder.DropIndex(
                name: "IX_ApprovalWritings_ApprovatorsGroupId",
                table: "ApprovalWritings");

            migrationBuilder.DropColumn(
                name: "ApprovatorId",
                table: "Steps");

            migrationBuilder.DropColumn(
                name: "ApprovatorsGroupId",
                table: "Steps");

            migrationBuilder.AlterColumn<int>(
                name: "StepId",
                table: "ApprovatorsGroups",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "StepId",
                table: "Approvators",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Approvators_Steps_StepId",
                table: "Approvators",
                column: "StepId",
                principalTable: "Steps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ApprovatorsGroups_Steps_StepId",
                table: "ApprovatorsGroups",
                column: "StepId",
                principalTable: "Steps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
