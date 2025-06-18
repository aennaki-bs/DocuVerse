using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocManagementBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddStepsApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RequiresApproval",
                table: "Steps",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "ApprovalWritings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<int>(type: "int", nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    ProcessedByUserId = table.Column<int>(type: "int", nullable: false),
                    ApprovatorId = table.Column<int>(type: "int", nullable: true),
                    ApprovatorsGroupId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalWritings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalWritings_Documents_DocumentId",
                        column: x => x.DocumentId,
                        principalTable: "Documents",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApprovalWritings_Steps_StepId",
                        column: x => x.StepId,
                        principalTable: "Steps",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApprovalWritings_Users_ProcessedByUserId",
                        column: x => x.ProcessedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Approvators",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Approvators", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Approvators_Steps_StepId",
                        column: x => x.StepId,
                        principalTable: "Steps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Approvators_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ApprovatorsGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovatorsGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovatorsGroups_Steps_StepId",
                        column: x => x.StepId,
                        principalTable: "Steps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApprovalResponses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApprovalWritingId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    ResponseDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovalResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovalResponses_ApprovalWritings_ApprovalWritingId",
                        column: x => x.ApprovalWritingId,
                        principalTable: "ApprovalWritings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApprovalResponses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ApprovatorsGroupRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    RuleType = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovatorsGroupRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovatorsGroupRules_ApprovatorsGroups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "ApprovatorsGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApprovatorsGroupUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApprovatorsGroupUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApprovatorsGroupUsers_ApprovatorsGroups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "ApprovatorsGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApprovatorsGroupUsers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalResponses_ApprovalWritingId",
                table: "ApprovalResponses",
                column: "ApprovalWritingId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalResponses_UserId",
                table: "ApprovalResponses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWritings_DocumentId",
                table: "ApprovalWritings",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWritings_ProcessedByUserId",
                table: "ApprovalWritings",
                column: "ProcessedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovalWritings_StepId",
                table: "ApprovalWritings",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_Approvators_StepId",
                table: "Approvators",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_Approvators_UserId",
                table: "Approvators",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovatorsGroupRules_GroupId",
                table: "ApprovatorsGroupRules",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovatorsGroups_StepId",
                table: "ApprovatorsGroups",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovatorsGroupUsers_GroupId",
                table: "ApprovatorsGroupUsers",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ApprovatorsGroupUsers_UserId",
                table: "ApprovatorsGroupUsers",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApprovalResponses");

            migrationBuilder.DropTable(
                name: "Approvators");

            migrationBuilder.DropTable(
                name: "ApprovatorsGroupRules");

            migrationBuilder.DropTable(
                name: "ApprovatorsGroupUsers");

            migrationBuilder.DropTable(
                name: "ApprovalWritings");

            migrationBuilder.DropTable(
                name: "ApprovatorsGroups");

            migrationBuilder.DropColumn(
                name: "RequiresApproval",
                table: "Steps");
        }
    }
}
