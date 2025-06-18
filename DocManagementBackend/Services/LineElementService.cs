using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;

namespace DocManagementBackend.Services
{
    public class LineElementService
    {
        private readonly ApplicationDbContext _context;

        public LineElementService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Creates or gets a LignesElementType for an Item
        /// </summary>
        public async Task<LignesElementType> GetOrCreateItemElementTypeAsync(string itemCode)
        {
            if (string.IsNullOrWhiteSpace(itemCode))
                throw new ArgumentException("Item code cannot be null or empty", nameof(itemCode));

            // Check if item exists
            var item = await _context.Items.FindAsync(itemCode);
            if (item == null)
                throw new InvalidOperationException($"Item with code '{itemCode}' not found");

            // Check if LignesElementType already exists for this item
            var existingElementType = await _context.LignesElementTypes
                .FirstOrDefaultAsync(let => let.ItemCode == itemCode && let.TypeElement == ElementType.Item);

            if (existingElementType != null)
                return existingElementType;

            // Create new LignesElementType for the item
            var elementType = new LignesElementType
            {
                Code = $"ITEM_{itemCode}",
                TypeElement = ElementType.Item,
                Description = $"Line element for item: {item.Description}",
                TableName = "Item",
                ItemCode = itemCode,
                AccountCode = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Ensure code uniqueness
            var codeExists = await _context.LignesElementTypes
                .AnyAsync(let => let.Code == elementType.Code);

            if (codeExists)
            {
                // Generate a unique code with timestamp
                elementType.Code = $"ITEM_{itemCode}_{DateTime.UtcNow:yyyyMMddHHmmss}";
            }

            _context.LignesElementTypes.Add(elementType);
            await _context.SaveChangesAsync();

            return elementType;
        }

        /// <summary>
        /// Creates or gets a LignesElementType for a GeneralAccount
        /// </summary>
        public async Task<LignesElementType> GetOrCreateGeneralAccountElementTypeAsync(string accountCode)
        {
            if (string.IsNullOrWhiteSpace(accountCode))
                throw new ArgumentException("Account code cannot be null or empty", nameof(accountCode));

            // Check if general account exists
            var account = await _context.GeneralAccounts.FindAsync(accountCode);
            if (account == null)
                throw new InvalidOperationException($"General account with code '{accountCode}' not found");

            // Check if LignesElementType already exists for this account
            var existingElementType = await _context.LignesElementTypes
                .FirstOrDefaultAsync(let => let.AccountCode == accountCode && let.TypeElement == ElementType.GeneralAccounts);

            if (existingElementType != null)
                return existingElementType;

            // Create new LignesElementType for the general account
            var elementType = new LignesElementType
            {
                Code = $"ACCOUNT_{accountCode}",
                TypeElement = ElementType.GeneralAccounts,
                Description = $"Line element for account: {account.Description}",
                TableName = "GeneralAccounts",
                ItemCode = null,
                AccountCode = accountCode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Ensure code uniqueness
            var codeExists = await _context.LignesElementTypes
                .AnyAsync(let => let.Code == elementType.Code);

            if (codeExists)
            {
                // Generate a unique code with timestamp
                elementType.Code = $"ACCOUNT_{accountCode}_{DateTime.UtcNow:yyyyMMddHHmmss}";
            }

            _context.LignesElementTypes.Add(elementType);
            await _context.SaveChangesAsync();

            return elementType;
        }

        /// <summary>
        /// Validates a LignesElementType for consistency
        /// </summary>
        public async Task<bool> ValidateElementTypeAsync(LignesElementType elementType)
        {
            if (elementType == null)
                return false;

            // Check basic validation
            if (!elementType.IsValid())
                return false;

            // Check code uniqueness
            var codeExists = await _context.LignesElementTypes
                .AnyAsync(let => let.Code == elementType.Code && let.Id != elementType.Id);

            if (codeExists)
                return false;

            // Validate referenced entities exist
            switch (elementType.TypeElement)
            {
                case ElementType.Item:
                    if (string.IsNullOrEmpty(elementType.ItemCode))
                        return false;
                    
                    var itemExists = await _context.Items.AnyAsync(i => i.Code == elementType.ItemCode);
                    return itemExists;

                case ElementType.GeneralAccounts:
                    if (string.IsNullOrEmpty(elementType.AccountCode))
                        return false;
                    
                    var accountExists = await _context.GeneralAccounts.AnyAsync(ga => ga.Code == elementType.AccountCode);
                    return accountExists;

                default:
                    return false;
            }
        }

        /// <summary>
        /// Gets all line element types with their related data
        /// </summary>
        public async Task<List<LignesElementType>> GetAllElementTypesAsync()
        {
            return await _context.LignesElementTypes
                .Include(let => let.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(let => let.GeneralAccount)
                .OrderBy(let => let.Code)
                .ToListAsync();
        }

        /// <summary>
        /// Gets line element types by type (Item or General Accounts)
        /// </summary>
        public async Task<List<LignesElementType>> GetElementTypesByTypeAsync(string typeElement)
        {
            if (!Enum.TryParse<ElementType>(typeElement, true, out var enumValue))
            {
                return new List<LignesElementType>(); // Return empty list for invalid type
            }
            
            return await _context.LignesElementTypes
                .Include(let => let.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(let => let.GeneralAccount)
                .Where(let => let.TypeElement == enumValue)
                .OrderBy(let => let.Code)
                .ToListAsync();
        }

        /// <summary>
        /// Deletes a line element type if it's not being used
        /// </summary>
        public async Task<bool> DeleteElementTypeAsync(int elementTypeId)
        {
            var elementType = await _context.LignesElementTypes
                .Include(let => let.Lignes)
                .FirstOrDefaultAsync(let => let.Id == elementTypeId);

            if (elementType == null)
                return false;

            // Check if it's being used by any lines
            if (elementType.Lignes.Any())
                return false;

            _context.LignesElementTypes.Remove(elementType);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Checks if an element type is currently being used by any lines
        /// </summary>
        public async Task<bool> IsElementTypeInUseAsync(int elementTypeId)
        {
            return await _context.Lignes
                .AnyAsync(l => l.LignesElementTypeId == elementTypeId);
        }

        /// <summary>
        /// Validates if an element type can be safely updated (doesn't break existing lines)
        /// </summary>
        public async Task<(bool CanUpdate, string? ErrorMessage)> CanUpdateElementTypeAsync(int elementTypeId, LignesElementType updatedElementType)
        {
            var isInUse = await IsElementTypeInUseAsync(elementTypeId);
            
            if (!isInUse)
            {
                // If not in use, allow any update
                return (true, null);
            }

            var existingElementType = await _context.LignesElementTypes.FindAsync(elementTypeId);
            if (existingElementType == null)
            {
                return (false, "Element type not found");
            }

            // If in use, only allow safe updates (description, table name)
            // Prevent changes to critical fields that would break line references
            if (existingElementType.Code != updatedElementType.Code)
            {
                return (false, "Cannot change the code of an element type that is being used by lines");
            }

            if (existingElementType.TypeElement != updatedElementType.TypeElement)
            {
                return (false, "Cannot change the type element of an element type that is being used by lines");
            }

            if (existingElementType.ItemCode != updatedElementType.ItemCode)
            {
                return (false, "Cannot change the item code of an element type that is being used by lines");
            }

            if (existingElementType.AccountCode != updatedElementType.AccountCode)
            {
                return (false, "Cannot change the account code of an element type that is being used by lines");
            }

            // Only description and table name changes are allowed when in use
            return (true, null);
        }
    }
} 