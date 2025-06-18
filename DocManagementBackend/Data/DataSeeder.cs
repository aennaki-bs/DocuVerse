using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Models;

namespace DocManagementBackend.Data
{
    public static class DataSeeder
    {
        public static async Task SeedDataAsync(ApplicationDbContext context)
        {
            // Seed default LignesElementTypes for the new dynamic system
            // UnitOfMeasures will be populated only from BC API sync
            await SeedLignesElementTypesAsync(context);
            
            // Seed DocumentTypes with TypeNumber
            await SeedDocumentTypesAsync(context);
        }

        private static async Task SeedDocumentTypesAsync(ApplicationDbContext context)
        {
            var existingTypeNumbers = await context.DocumentTypes.Select(dt => dt.TypeNumber).ToListAsync();
            
            var documentTypesToSeed = new[]
            {
                // Customer Document Types (0-9)
                new { TypeNumber = 0, TypeName = "sales Quote", TypeKey = "SQ", TypeAttr = "Quote", TierType = TierType.Customer },
                new { TypeNumber = 1, TypeName = "sales Order", TypeKey = "SO", TypeAttr = "Order", TierType = TierType.Customer },
                new { TypeNumber = 2, TypeName = "sales Invoice", TypeKey = "SI", TypeAttr = "Invoice", TierType = TierType.Customer },
                new { TypeNumber = 3, TypeName = "sales Credit Memo", TypeKey = "SCM", TypeAttr = "Credit Memo", TierType = TierType.Customer },
                new { TypeNumber = 4, TypeName = "sales Blanket Order", TypeKey = "CBO", TypeAttr = "Blanket Order", TierType = TierType.Customer },
                new { TypeNumber = 5, TypeName = "sales Return Order", TypeKey = "CRO", TypeAttr = "Return Order", TierType = TierType.Customer },
                
                // Vendor Document Types (10-19)
                new { TypeNumber = 10, TypeName = "Purchase Quote", TypeKey = "PQ", TypeAttr = "Quote", TierType = TierType.Vendor },
                new { TypeNumber = 11, TypeName = "Purchase Order", TypeKey = "PO", TypeAttr = "Order", TierType = TierType.Vendor },
                new { TypeNumber = 12, TypeName = "Purchase Invoice", TypeKey = "PI", TypeAttr = "Invoice", TierType = TierType.Vendor },
                new { TypeNumber = 13, TypeName = "Purchase Credit Memo", TypeKey = "PCM", TypeAttr = "Credit Memo", TierType = TierType.Vendor },
                new { TypeNumber = 14, TypeName = "Purchase Blanket Order", TypeKey = "PBO", TypeAttr = "Blanket Order", TierType = TierType.Vendor },
                new { TypeNumber = 15, TypeName = "Purchase Return Order", TypeKey = "VRO", TypeAttr = "Return Order", TierType = TierType.Vendor }
            };

            var newDocumentTypes = documentTypesToSeed
                .Where(docType => !existingTypeNumbers.Contains(docType.TypeNumber))
                .Select(docType => new DocumentType
                {
                    TypeNumber = docType.TypeNumber,
                    TypeName = docType.TypeName,
                    TypeKey = docType.TypeKey,
                    TypeAttr = docType.TypeAttr,
                    TierType = docType.TierType,
                    DocumentCounter = 0,
                    DocCounter = 0
                })
                .ToList();

            if (newDocumentTypes.Any())
            {
                context.DocumentTypes.AddRange(newDocumentTypes);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedLignesElementTypesAsync(ApplicationDbContext context)
        {
            var existingCodes = await context.LignesElementTypes.Select(let => let.Code).ToListAsync();
            var elementTypesToSeed = new[]
            {
                new { 
                    Code = "ITEM", 
                    TypeElement = ElementType.Item, 
                    Description = "Default element type for items", 
                    TableName = "Items" 
                },
                new { 
                    Code = "GENERAL_ACCOUNT", 
                    TypeElement = ElementType.GeneralAccounts, 
                    Description = "Default element type for general accounts", 
                    TableName = "GeneralAccounts" 
                }
            };

            var now = DateTime.UtcNow;
            var newElementTypes = elementTypesToSeed
                .Where(elementType => !existingCodes.Contains(elementType.Code))
                .Select(elementType => new LignesElementType
                {
                    Code = elementType.Code,
                    TypeElement = elementType.TypeElement,
                    Description = elementType.Description,
                    TableName = elementType.TableName,
                    ItemCode = null, // These are generic types, not tied to specific items/accounts
                    AccountCode = null,
                    CreatedAt = now,
                    UpdatedAt = now
                })
                .ToList();

            if (newElementTypes.Any())
            {
                context.LignesElementTypes.AddRange(newElementTypes);
                await context.SaveChangesAsync();
            }
        }
    }
} 