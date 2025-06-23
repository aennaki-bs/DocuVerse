using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Models;

namespace DocManagementBackend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public ApplicationDbContext() { }

        // Existing entities
        public DbSet<User> Users { get; set; }
        public DbSet<LogHistory> LogHistories { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<ResponsibilityCentre> ResponsibilityCentres { get; set; }
        public DbSet<Ligne> Lignes { get; set; }
        public DbSet<SousLigne> SousLignes { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<DocumentType> DocumentTypes { get; set; }
        public DbSet<SubType> SubTypes { get; set; }
        public DbSet<TypeCounter> TypeCounter { get; set; }
        public DbSet<Circuit> Circuits { get; set; }
        public DbSet<DocumentCircuitHistory> DocumentCircuitHistory { get; set; }
        public DbSet<DocumentStepHistory> DocumentStepHistory { get; set; }

        // Line element reference tables
        public DbSet<LignesElementType> LignesElementTypes { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<UnitOfMeasure> UnitOfMeasures { get; set; } // Renamed from UniteCodes
        public DbSet<ItemUnitOfMeasure> ItemUnitOfMeasures { get; set; } // New table
        public DbSet<GeneralAccounts> GeneralAccounts { get; set; }

        // New reference tables
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Vendor> Vendors { get; set; }
        public DbSet<Location> Locations { get; set; }
        
        // API Sync Configuration
        public DbSet<ApiSyncConfiguration> ApiSyncConfigurations { get; set; }

        // Workflow entities
        public DbSet<Status> Status { get; set; }
        public DbSet<Step> Steps { get; set; }
        public DbSet<Models.Action> Actions { get; set; }
        public DbSet<StepAction> StepActions { get; set; }
        public DbSet<ActionStatusEffect> ActionStatusEffects { get; set; }
        public DbSet<DocumentStatus> DocumentStatus { get; set; }

        // Approval entities
        public DbSet<Approvator> Approvators { get; set; }
        public DbSet<ApprovatorsGroup> ApprovatorsGroups { get; set; }
        public DbSet<ApprovatorsGroupUser> ApprovatorsGroupUsers { get; set; }
        public DbSet<ApprovatorsGroupRule> ApprovatorsGroupRules { get; set; }
        public DbSet<ApprovalWriting> ApprovalWritings { get; set; }
        public DbSet<ApprovalResponse> ApprovalResponses { get; set; }
        public DbSet<StepApprovalAssignment> StepApprovalAssignments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ResponsibilityCentre unique constraint on Code
            modelBuilder.Entity<ResponsibilityCentre>()
                .HasIndex(rc => rc.Code)
                .IsUnique();

            // User -> ResponsibilityCentre relationship
            modelBuilder.Entity<User>()
                .HasOne(u => u.ResponsibilityCentre)
                .WithMany(rc => rc.Users)
                .HasForeignKey(u => u.ResponsibilityCentreId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // Document -> ResponsibilityCentre relationship
            modelBuilder.Entity<Document>()
                .HasOne(d => d.ResponsibilityCentre)
                .WithMany(rc => rc.Documents)
                .HasForeignKey(d => d.ResponsibilityCentreId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // Document -> User relationships (CreatedBy and UpdatedBy)
            modelBuilder.Entity<Document>()
                .HasOne(d => d.CreatedBy)
                .WithMany()
                .HasForeignKey(d => d.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            modelBuilder.Entity<Document>()
                .HasOne(d => d.UpdatedBy)
                .WithMany()
                .HasForeignKey(d => d.UpdatedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // SubType relationship with Document
            modelBuilder.Entity<Document>()
                .HasOne(d => d.SubType)
                .WithMany(st => st.Documents)
                .HasForeignKey(d => d.SubTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // SubType relationship with DocumentType
            modelBuilder.Entity<SubType>()
                .HasOne(st => st.DocumentType)
                .WithMany()
                .HasForeignKey(st => st.DocumentTypeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Status relationships with Circuit
            modelBuilder.Entity<Status>()
                .HasOne(s => s.Circuit)
                .WithMany(c => c.Statuses)
                .HasForeignKey(s => s.CircuitId)
                .OnDelete(DeleteBehavior.Cascade);

            // Step relationships with Circuit and Status
            modelBuilder.Entity<Step>()
                .HasOne(s => s.Circuit)
                .WithMany(c => c.Steps)
                .HasForeignKey(s => s.CircuitId)
                .OnDelete(DeleteBehavior.Cascade);

            // Circuit -> DocumentType relationship
            modelBuilder.Entity<Circuit>()
                .HasOne(c => c.DocumentType)
                .WithMany(dt => dt.Circuits)
                .HasForeignKey(c => c.DocumentTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // FIX: Use NoAction for Status-related FKs to avoid multiple cascade paths
            modelBuilder.Entity<Step>()
                .HasOne(s => s.CurrentStatus)
                .WithMany()
                .HasForeignKey(s => s.CurrentStatusId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Step>()
                .HasOne(s => s.NextStatus)
                .WithMany()
                .HasForeignKey(s => s.NextStatusId)
                .OnDelete(DeleteBehavior.NoAction);

            // Configure the Step -> Approvator and Step -> ApprovatorsGroup relationships
            modelBuilder.Entity<Step>()
                .HasOne(s => s.Approvator)
                .WithMany()
                .HasForeignKey(s => s.ApprovatorId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
                
            modelBuilder.Entity<Step>()
                .HasOne(s => s.ApprovatorsGroup)
                .WithMany()
                .HasForeignKey(s => s.ApprovatorsGroupId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            // Document CurrentStatus relationship
            modelBuilder.Entity<Document>()
                .HasOne(d => d.CurrentStatus)
                .WithMany()
                .HasForeignKey(d => d.CurrentStatusId)
                .OnDelete(DeleteBehavior.NoAction);

            // DocumentCircuitHistory relationships
            modelBuilder.Entity<DocumentCircuitHistory>()
                .HasOne(d => d.Document)
                .WithMany()
                .HasForeignKey(d => d.DocumentId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<DocumentCircuitHistory>()
                .HasOne(d => d.Step)
                .WithMany()
                .HasForeignKey(d => d.StepId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<DocumentCircuitHistory>()
                .HasOne(d => d.ProcessedBy)
                .WithMany()
                .HasForeignKey(d => d.ProcessedByUserId)
                .OnDelete(DeleteBehavior.NoAction);

            // DocumentStepHistory relationships
            modelBuilder.Entity<DocumentStepHistory>()
                .HasOne(d => d.Document)
                .WithMany()
                .HasForeignKey(d => d.DocumentId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<DocumentStepHistory>()
                .HasOne(d => d.Step)
                .WithMany()
                .HasForeignKey(d => d.StepId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<DocumentStepHistory>()
                .HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // StepAction relationships
            modelBuilder.Entity<StepAction>()
                .HasOne(sa => sa.Step)
                .WithMany(s => s.StepActions)
                .HasForeignKey(sa => sa.StepId);

            modelBuilder.Entity<StepAction>()
                .HasOne(sa => sa.Action)
                .WithMany(a => a.StepActions)
                .HasForeignKey(sa => sa.ActionId);

            // ActionStatusEffect relationships
            modelBuilder.Entity<ActionStatusEffect>()
                .HasOne(ase => ase.Action)
                .WithMany()
                .HasForeignKey(ase => ase.ActionId);

            modelBuilder.Entity<ActionStatusEffect>()
                .HasOne(ase => ase.Status)
                .WithMany()
                .HasForeignKey(ase => ase.StatusId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ActionStatusEffect>()
                .HasOne(ase => ase.Step)
                .WithMany()
                .HasForeignKey(ase => ase.StepId)
                .OnDelete(DeleteBehavior.NoAction);

            // DocumentStatus relationships
            modelBuilder.Entity<DocumentStatus>()
                .HasOne(ds => ds.Document)
                .WithMany()
                .HasForeignKey(ds => ds.DocumentId);

            modelBuilder.Entity<DocumentStatus>()
                .HasOne(ds => ds.Status)
                .WithMany()
                .HasForeignKey(ds => ds.StatusId)
                .OnDelete(DeleteBehavior.NoAction);

            // Approval relationships
            modelBuilder.Entity<Approvator>()
                .HasOne(a => a.Step)
                .WithMany()
                .HasForeignKey(a => a.StepId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            modelBuilder.Entity<Approvator>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.NoAction);
    
            modelBuilder.Entity<ApprovatorsGroup>()
                .HasOne(g => g.Step)
                .WithMany()
                .HasForeignKey(g => g.StepId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
    
            modelBuilder.Entity<ApprovatorsGroupUser>()
                .HasOne(gu => gu.Group)
                .WithMany(g => g.ApprovatorsGroupUsers)
                .HasForeignKey(gu => gu.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
    
            modelBuilder.Entity<ApprovatorsGroupUser>()
                .HasOne(gu => gu.User)
                .WithMany()
                .HasForeignKey(gu => gu.UserId)
                .OnDelete(DeleteBehavior.NoAction);
    
            modelBuilder.Entity<ApprovatorsGroupRule>()
                .HasOne(r => r.Group)
                .WithMany()
                .HasForeignKey(r => r.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
    
            modelBuilder.Entity<StepApprovalAssignment>()
                .HasOne(sa => sa.Step)
                .WithMany()
                .HasForeignKey(sa => sa.StepId)
                .OnDelete(DeleteBehavior.Cascade);
    
            modelBuilder.Entity<StepApprovalAssignment>()
                .HasOne(sa => sa.Approvator)
                .WithMany()
                .HasForeignKey(sa => sa.ApprovatorId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
    
            modelBuilder.Entity<StepApprovalAssignment>()
                .HasOne(sa => sa.ApprovatorsGroup)
                .WithMany()
                .HasForeignKey(sa => sa.ApprovatorsGroupId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
    
            modelBuilder.Entity<ApprovalWriting>()
                .HasOne(aw => aw.Document)
                .WithMany()
                .HasForeignKey(aw => aw.DocumentId)
                .OnDelete(DeleteBehavior.NoAction);
    
            modelBuilder.Entity<ApprovalWriting>()
                .HasOne(aw => aw.Step)
                .WithMany()
                .HasForeignKey(aw => aw.StepId)
                .OnDelete(DeleteBehavior.NoAction);
    
            modelBuilder.Entity<ApprovalWriting>()
                .HasOne(aw => aw.ProcessedBy)
                .WithMany()
                .HasForeignKey(aw => aw.ProcessedByUserId)
                .OnDelete(DeleteBehavior.NoAction);
    
            modelBuilder.Entity<ApprovalResponse>()
                .HasOne(ar => ar.ApprovalWriting)
                .WithMany()
                .HasForeignKey(ar => ar.ApprovalWritingId)
                .OnDelete(DeleteBehavior.Cascade);
    
            modelBuilder.Entity<ApprovalResponse>()
                .HasOne(ar => ar.User)
                .WithMany()
                .HasForeignKey(ar => ar.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // Line element relationships
            // LignesElementType unique constraint on Code
            modelBuilder.Entity<LignesElementType>()
                .HasIndex(let => let.Code)
                .IsUnique();

            // Configure TypeElement as enum
            modelBuilder.Entity<LignesElementType>()
                .Property(e => e.TypeElement)
                .HasConversion<string>();

            // Backward compatibility: LignesElementType -> Item relationship (conditional)
            modelBuilder.Entity<LignesElementType>()
                .HasOne(let => let.Item)
                .WithMany(i => i.LignesElementTypes)
                .HasForeignKey(let => let.ItemCode)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // Backward compatibility: LignesElementType -> GeneralAccounts relationship (conditional)
            modelBuilder.Entity<LignesElementType>()
                .HasOne(let => let.GeneralAccount)
                .WithMany(ga => ga.LignesElementTypes)
                .HasForeignKey(let => let.AccountCode)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // Item unique constraint on Code
            modelBuilder.Entity<Item>()
                .HasIndex(i => i.Code)
                .IsUnique();

            // Item -> UnitOfMeasure relationship (renamed from UniteCode)
            modelBuilder.Entity<Item>()
                .HasOne(i => i.UniteCodeNavigation)
                .WithMany(uc => uc.Items)
                .HasForeignKey(i => i.Unite)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // UnitOfMeasure unique constraint on Code (renamed from UniteCode)
            modelBuilder.Entity<UnitOfMeasure>()
                .HasIndex(uc => uc.Code)
                .IsUnique();

            // ItemUnitOfMeasure relationships and constraints
            modelBuilder.Entity<ItemUnitOfMeasure>()
                .HasOne(ium => ium.Item)
                .WithMany(i => i.ItemUnitOfMeasures)
                .HasForeignKey(ium => ium.ItemCode)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ItemUnitOfMeasure>()
                .HasOne(ium => ium.UnitOfMeasure)
                .WithMany(uom => uom.ItemUnitOfMeasures)
                .HasForeignKey(ium => ium.UnitOfMeasureCode)
                .OnDelete(DeleteBehavior.Cascade);

            // ItemUnitOfMeasure unique constraint: no duplication per item and unit
            modelBuilder.Entity<ItemUnitOfMeasure>()
                .HasIndex(ium => new { ium.ItemCode, ium.UnitOfMeasureCode })
                .IsUnique();

            // GeneralAccounts unique constraint on Code
            modelBuilder.Entity<GeneralAccounts>()
                .HasIndex(ga => ga.Code)
                .IsUnique();

            // Backward compatibility: Ligne -> LignesElementType relationship via LignesElementTypeId
            modelBuilder.Entity<Ligne>()
                .HasOne(l => l.LignesElementType)
                .WithMany(let => let.Lignes)
                .HasForeignKey(l => l.LignesElementTypeId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            // Note: The new Type field will reference the same LignesElementType table
            // ElementId is not configured as a foreign key in EF as it's a dynamic reference
            // Validation of ElementId references is handled in application logic

            // New reference tables configurations
            // Customer unique constraint on Code
            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.Code)
                .IsUnique();

            // Vendor unique constraint on VendorCode
            modelBuilder.Entity<Vendor>()
                .HasIndex(v => v.VendorCode)
                .IsUnique();

            // Location unique constraint on LocationCode
            modelBuilder.Entity<Location>()
                .HasIndex(l => l.LocationCode)
                .IsUnique();

            // Configure DocumentType TierType as enum
            modelBuilder.Entity<DocumentType>()
                .Property(dt => dt.TierType)
                .HasConversion<string>();

            // ERP Integration fields unique constraints (optional but unique if provided)
            modelBuilder.Entity<Document>()
                .HasIndex(d => d.ERPDocumentCode)
                .IsUnique()
                .HasFilter("[ERPDocumentCode] IS NOT NULL");

            // ERPLineCode should be unique per document, not globally unique
            modelBuilder.Entity<Ligne>()
                .HasIndex(l => new { l.DocumentId, l.ERPLineCode })
                .IsUnique()
                .HasFilter("[ERPLineCode] IS NOT NULL");

            // Document -> Customer relationship (conditional based on DocumentType.TierType)
            // Note: These are manual navigation properties that need to be resolved in application logic
            // We cannot use traditional foreign key constraints here due to the dynamic nature

            // Seed data
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, RoleName = "Admin", IsAdmin = true, IsSimpleUser = false, IsFullUser = false },
                new Role { Id = 2, RoleName = "SimpleUser", IsAdmin = false, IsSimpleUser = true, IsFullUser = false },
                new Role { Id = 3, RoleName = "FullUser", IsAdmin = false, IsSimpleUser = false, IsFullUser = true }
            );

            // Note: LignesElementType seed data removed - now dynamically created for each Item and GeneralAccount
        }
    }
}