using System;
using System.Linq.Expressions;
using DocManagementBackend.Models;


namespace DocManagementBackend.Mappings
{
    public static class LigneMappings
    {
        public static Expression<Func<Ligne, LigneDto>> ToLigneDto = l => new LigneDto
        {
            Id = l.Id,
            DocumentId = l.DocumentId,
            LigneKey = l.LigneKey,
            Title = l.Title,
            Article = l.Article,
            Prix = l.Prix,
            SousLignesCount = l.SousLignes.Count,
            
            // LignesElementType information (new normalized structure)
            LignesElementTypeId = l.LignesElementTypeId,
            LignesElementType = l.LignesElementType == null ? null : new LignesElementTypeDto
            {
                Id = l.LignesElementType.Id,
                Code = l.LignesElementType.Code,
                TypeElement = l.LignesElementType.TypeElement.ToString(),
                Description = l.LignesElementType.Description,
                TableName = l.LignesElementType.TableName,
                ItemCode = l.LignesElementType.ItemCode,
                AccountCode = l.LignesElementType.AccountCode,
                CreatedAt = l.LignesElementType.CreatedAt,
                UpdatedAt = l.LignesElementType.UpdatedAt
            },
            
            // Element references - prioritize dynamically loaded elements over element type navigation
            ItemCode = l.Item != null ? l.Item.Code : (l.LignesElementType != null ? l.LignesElementType.ItemCode : null),
            Item = l.Item != null ? new ItemDto
            {
                Code = l.Item.Code,
                Description = l.Item.Description,
                Unite = l.Item.Unite,
                UniteCodeNavigation = l.Item.UniteCodeNavigation == null ? null : new UniteCodeDto
                {
                    Code = l.Item.UniteCodeNavigation.Code,
                    Description = l.Item.UniteCodeNavigation.Description,
                    CreatedAt = l.Item.UniteCodeNavigation.CreatedAt,
                    UpdatedAt = l.Item.UniteCodeNavigation.UpdatedAt,
                    ItemsCount = l.Item.UniteCodeNavigation.Items.Count()
                },
                CreatedAt = l.Item.CreatedAt,
                UpdatedAt = l.Item.UpdatedAt,
                ElementTypesCount = l.Item.LignesElementTypes.Count()
            } : (l.LignesElementType == null || l.LignesElementType.Item == null ? null : new ItemDto
            {
                Code = l.LignesElementType.Item.Code,
                Description = l.LignesElementType.Item.Description,
                Unite = l.LignesElementType.Item.Unite,
                UniteCodeNavigation = l.LignesElementType.Item.UniteCodeNavigation == null ? null : new UniteCodeDto
                {
                    Code = l.LignesElementType.Item.UniteCodeNavigation.Code,
                    Description = l.LignesElementType.Item.UniteCodeNavigation.Description,
                    CreatedAt = l.LignesElementType.Item.UniteCodeNavigation.CreatedAt,
                    UpdatedAt = l.LignesElementType.Item.UniteCodeNavigation.UpdatedAt,
                    ItemsCount = l.LignesElementType.Item.UniteCodeNavigation.Items.Count()
                },
                CreatedAt = l.LignesElementType.Item.CreatedAt,
                UpdatedAt = l.LignesElementType.Item.UpdatedAt,
                ElementTypesCount = l.LignesElementType.Item.LignesElementTypes.Count()
            }),
            GeneralAccountsCode = l.GeneralAccount != null ? l.GeneralAccount.Code : (l.LignesElementType != null ? l.LignesElementType.AccountCode : null),
            GeneralAccounts = l.GeneralAccount != null ? new GeneralAccountsDto
            {
                Code = l.GeneralAccount.Code,
                Description = l.GeneralAccount.Description,
                AccountType = l.GeneralAccount.AccountType,
                CreatedAt = l.GeneralAccount.CreatedAt,
                UpdatedAt = l.GeneralAccount.UpdatedAt,
                LignesCount = l.GeneralAccount.LignesElementTypes.Count()
            } : (l.LignesElementType == null || l.LignesElementType.GeneralAccount == null ? null : new GeneralAccountsDto
            {
                Code = l.LignesElementType.GeneralAccount.Code,
                Description = l.LignesElementType.GeneralAccount.Description,
                AccountType = l.LignesElementType.GeneralAccount.AccountType,
                CreatedAt = l.LignesElementType.GeneralAccount.CreatedAt,
                UpdatedAt = l.LignesElementType.GeneralAccount.UpdatedAt,
                LignesCount = l.LignesElementType.GeneralAccount.LignesElementTypes.Count()
            }),
            
            // Location reference (only for Item types)
            LocationCode = l.LocationCode,
            Location = l.Location == null ? null : new LocationDto
            {
                LocationCode = l.Location.LocationCode,
                Description = l.Location.Description,
                CreatedAt = l.Location.CreatedAt,
                UpdatedAt = l.Location.UpdatedAt
            },
            
            // Unit of measure reference (only for Item types)
            UnitCode = l.UnitCode,
            Unit = l.Unit == null ? null : new UniteCodeDto
            {
                Code = l.Unit.Code,
                Description = l.Unit.Description,
                CreatedAt = l.Unit.CreatedAt,
                UpdatedAt = l.Unit.UpdatedAt,
                ItemsCount = l.Unit.Items.Count()
            },
            
            // Pricing fields
            Quantity = l.Quantity,
            PriceHT = l.PriceHT,
            DiscountPercentage = l.DiscountPercentage,
            DiscountAmount = l.DiscountAmount,
            VatPercentage = l.VatPercentage,
            
            // Calculated fields
            AmountHT = l.AmountHT,
            AmountVAT = l.AmountVAT,
            AmountTTC = l.AmountTTC,
            
            // ERP Integration field
            ERPLineCode = l.ERPLineCode,
            
            CreatedAt = l.CreatedAt,
            UpdatedAt = l.UpdatedAt,
            Document = new DocumentDto
            {
                Id = l.Document!.Id,
                DocumentKey = l.Document.DocumentKey,
                DocumentAlias = l.Document.DocumentAlias,
                Title = l.Document.Title,
                DocumentExterne = l.Document.DocumentExterne,
                Content = l.Document.Content,
                TypeId = l.Document.TypeId,
                DocumentType = l.Document.DocumentType == null
                    ? null
                    : new DocumentTypeDto
                    {
                        TypeNumber = l.Document.DocumentType.TypeNumber,
                        TypeKey = l.Document.DocumentType.TypeKey,
                        TypeName = l.Document.DocumentType.TypeName,
                        TypeAttr = l.Document.DocumentType.TypeAttr,
                        TierType = l.Document.DocumentType.TierType
                    },
                CreatedAt = l.Document.CreatedAt,
                UpdatedAt = l.Document.UpdatedAt,
                Status = l.Document.Status,
                CreatedByUserId = l.Document.CreatedByUserId,
                CreatedBy = l.Document.CreatedBy == null
                    ? null
                    : new DocumentUserDto
                    {
                        Email = l.Document.CreatedBy.Email,
                        Username = l.Document.CreatedBy.Username,
                        FirstName = l.Document.CreatedBy.FirstName,
                        LastName = l.Document.CreatedBy.LastName,
                        UserType = l.Document.CreatedBy.UserType,
                        Role = l.Document.CreatedBy.Role != null
                            ? l.Document.CreatedBy.Role.RoleName
                            : "SimpleUser"
                    },
                LignesCount = l.Document.Lignes.Count,
                SousLignesCount = l.Document.Lignes.Sum(ll => ll.SousLignes.Count)
            }
        };

    }

    public static class SousLigneMappings
    {
        public static Expression<Func<SousLigne, SousLigneDto>> ToSousLigneDto = s => new SousLigneDto
        {
            Id = s.Id,
            LigneId = s.LigneId,
            Title = s.Title,
            Attribute = s.Attribute,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt,
            Ligne = new LigneDto
            {
                Id = s.Ligne!.Id,
                DocumentId = s.Ligne.DocumentId,
                LigneKey = s.Ligne.LigneKey,
                Title = s.Ligne.Title,
                Article = s.Ligne.Article,
                Prix = s.Ligne.Prix,
                SousLignesCount = s.Ligne.SousLignes.Count,
                
                // LignesElementType information (new normalized structure)
                LignesElementTypeId = s.Ligne.LignesElementTypeId,
                LignesElementType = s.Ligne.LignesElementType == null ? null : new LignesElementTypeDto
                {
                    Id = s.Ligne.LignesElementType.Id,
                    Code = s.Ligne.LignesElementType.Code,
                    TypeElement = s.Ligne.LignesElementType.TypeElement.ToString(),
                    Description = s.Ligne.LignesElementType.Description,
                    TableName = s.Ligne.LignesElementType.TableName,
                    ItemCode = s.Ligne.LignesElementType.ItemCode,
                    AccountCode = s.Ligne.LignesElementType.AccountCode,
                    CreatedAt = s.Ligne.LignesElementType.CreatedAt,
                    UpdatedAt = s.Ligne.LignesElementType.UpdatedAt
                },
                
                // Element references (computed properties from LignesElementType)
                ItemCode = s.Ligne.LignesElementType != null ? s.Ligne.LignesElementType.ItemCode : null,
                Item = s.Ligne.LignesElementType == null || s.Ligne.LignesElementType.Item == null ? null : new ItemDto
                {
                    Code = s.Ligne.LignesElementType.Item.Code,
                    Description = s.Ligne.LignesElementType.Item.Description,
                    Unite = s.Ligne.LignesElementType.Item.Unite,
                    UniteCodeNavigation = s.Ligne.LignesElementType.Item.UniteCodeNavigation == null ? null : new UniteCodeDto
                    {
                        Code = s.Ligne.LignesElementType.Item.UniteCodeNavigation.Code,
                        Description = s.Ligne.LignesElementType.Item.UniteCodeNavigation.Description,
                        CreatedAt = s.Ligne.LignesElementType.Item.UniteCodeNavigation.CreatedAt,
                        UpdatedAt = s.Ligne.LignesElementType.Item.UniteCodeNavigation.UpdatedAt,
                        ItemsCount = s.Ligne.LignesElementType.Item.UniteCodeNavigation.Items.Count()
                    },
                    CreatedAt = s.Ligne.LignesElementType.Item.CreatedAt,
                    UpdatedAt = s.Ligne.LignesElementType.Item.UpdatedAt,
                    ElementTypesCount = s.Ligne.LignesElementType.Item.LignesElementTypes.Count()
                },
                GeneralAccountsCode = s.Ligne.LignesElementType != null ? s.Ligne.LignesElementType.AccountCode : null,
                GeneralAccounts = s.Ligne.LignesElementType == null || s.Ligne.LignesElementType.GeneralAccount == null ? null : new GeneralAccountsDto
                {
                    Code = s.Ligne.LignesElementType.GeneralAccount.Code,
                    Description = s.Ligne.LignesElementType.GeneralAccount.Description,
                    AccountType = s.Ligne.LignesElementType.GeneralAccount.AccountType,
                    CreatedAt = s.Ligne.LignesElementType.GeneralAccount.CreatedAt,
                    UpdatedAt = s.Ligne.LignesElementType.GeneralAccount.UpdatedAt,
                    LignesCount = s.Ligne.LignesElementType.GeneralAccount.LignesElementTypes.Count()
                },
                
                // Location reference (only for Item types)
                LocationCode = s.Ligne.LocationCode,
                Location = s.Ligne.Location == null ? null : new LocationDto
                {
                    LocationCode = s.Ligne.Location.LocationCode,
                    Description = s.Ligne.Location.Description,
                    CreatedAt = s.Ligne.Location.CreatedAt,
                    UpdatedAt = s.Ligne.Location.UpdatedAt
                },
                
                // Unit of measure reference (only for Item types)
                UnitCode = s.Ligne.UnitCode,
                Unit = s.Ligne.Unit == null ? null : new UniteCodeDto
                {
                    Code = s.Ligne.Unit.Code,
                    Description = s.Ligne.Unit.Description,
                    CreatedAt = s.Ligne.Unit.CreatedAt,
                    UpdatedAt = s.Ligne.Unit.UpdatedAt,
                    ItemsCount = s.Ligne.Unit.Items.Count()
                },
                
                // Pricing fields
                Quantity = s.Ligne.Quantity,
                PriceHT = s.Ligne.PriceHT,
                DiscountPercentage = s.Ligne.DiscountPercentage,
                DiscountAmount = s.Ligne.DiscountAmount,
                VatPercentage = s.Ligne.VatPercentage,
                
                // Calculated fields
                AmountHT = s.Ligne.AmountHT,
                AmountVAT = s.Ligne.AmountVAT,
                AmountTTC = s.Ligne.AmountTTC,
                
                CreatedAt = s.Ligne.CreatedAt,
                UpdatedAt = s.Ligne.UpdatedAt,
                Document = new DocumentDto
                {
                    Id = s.Ligne.Document!.Id,
                    DocumentKey = s.Ligne.Document.DocumentKey,
                    DocumentAlias = s.Ligne.Document.DocumentAlias,
                    Title = s.Ligne.Document.Title,
                    DocumentExterne = s.Ligne.Document.DocumentExterne,
                    Content = s.Ligne.Document.Content,
                    TypeId = s.Ligne.Document.TypeId,
                    DocumentType = s.Ligne.Document.DocumentType == null
                        ? null
                        : new DocumentTypeDto
                        {
                            TypeNumber = s.Ligne.Document.DocumentType.TypeNumber,
                            TypeKey = s.Ligne.Document.DocumentType.TypeKey,
                            TypeName = s.Ligne.Document.DocumentType.TypeName,
                            TypeAttr = s.Ligne.Document.DocumentType.TypeAttr,
                            TierType = s.Ligne.Document.DocumentType.TierType
                        },
                    CreatedAt = s.Ligne.Document.CreatedAt,
                    UpdatedAt = s.Ligne.Document.UpdatedAt,
                    Status = s.Ligne.Document.Status,
                    CreatedByUserId = s.Ligne.Document.CreatedByUserId,
                    CreatedBy = s.Ligne.Document.CreatedBy == null
                        ? null
                        : new DocumentUserDto
                        {
                            Email = s.Ligne.Document.CreatedBy.Email,
                            Username = s.Ligne.Document.CreatedBy.Username,
                            FirstName = s.Ligne.Document.CreatedBy.FirstName,
                            LastName = s.Ligne.Document.CreatedBy.LastName,
                            UserType = s.Ligne.Document.CreatedBy.UserType,
                            Role = s.Ligne.Document.CreatedBy.Role != null
                                ? s.Ligne.Document.CreatedBy.Role.RoleName
                                : "SimpleUser"
                        }
                }
            }
        };
    }

    public static class DocumentMappings
    {
        public static Expression<Func<Document, DocumentDto>> ToDocumentDto = d => new DocumentDto
        {
            Id = d.Id,
            DocumentKey = d.DocumentKey,
            DocumentAlias = d.DocumentAlias,
            Title = d.Title,
            DocumentExterne = d.DocumentExterne,
            Content = d.Content,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt,
            DocDate = d.DocDate,
            ComptableDate = d.ComptableDate,
            Status = d.Status,
            TypeId = d.TypeId,
            DocumentType = new DocumentTypeDto
            {
                TypeNumber = d.DocumentType!.TypeNumber,
                TypeKey = d.DocumentType!.TypeKey,
                TypeName = d.DocumentType!.TypeName,
                TypeAttr = d.DocumentType.TypeAttr,
                TierType = d.DocumentType.TierType
            },
            SubTypeId = d.SubTypeId,
            SubType = d.SubType == null ? null : new SubTypeDto
            {
                Id = d.SubType.Id,
                SubTypeKey = d.SubType.SubTypeKey,
                Name = d.SubType.Name,
                Description = d.SubType.Description,
                StartDate = d.SubType.StartDate,
                EndDate = d.SubType.EndDate,
                DocumentTypeId = d.SubType.DocumentTypeId,
                IsActive = d.SubType.IsActive
            },
            CreatedByUserId = d.CreatedByUserId,
            CreatedBy = new DocumentUserDto
            {
                Email = d.CreatedBy.Email,
                Username = d.CreatedBy.Username,
                FirstName = d.CreatedBy.FirstName,
                LastName = d.CreatedBy.LastName,
                UserType = d.CreatedBy.UserType,
                Role = d.CreatedBy.Role != null ? d.CreatedBy.Role.RoleName : string.Empty
            },
            UpdatedByUserId = d.UpdatedByUserId,
            UpdatedBy = d.UpdatedBy == null ? null : new DocumentUserDto
            {
                Email = d.UpdatedBy.Email,
                Username = d.UpdatedBy.Username,
                FirstName = d.UpdatedBy.FirstName,
                LastName = d.UpdatedBy.LastName,
                UserType = d.UpdatedBy.UserType,
                Role = d.UpdatedBy.Role != null ? d.UpdatedBy.Role.RoleName : string.Empty
            },
            LignesCount = d.Lignes.Count,
            SousLignesCount = d.Lignes.Sum(l => l.SousLignes.Count),
            CircuitId = d.CircuitId,
            CurrentStepId = d.CurrentStepId,
            ResponsibilityCentreId = d.ResponsibilityCentreId,
            ResponsibilityCentre = d.ResponsibilityCentre == null ? null : new ResponsibilityCentreSimpleDto
            {
                Id = d.ResponsibilityCentre.Id,
                Code = d.ResponsibilityCentre.Code,
                Descr = d.ResponsibilityCentre.Descr
            },
            
            // Customer/Vendor snapshot data
            CustomerVendorCode = d.CustomerVendorCode,
            CustomerVendorName = d.CustomerVendorName,
            CustomerVendorAddress = d.CustomerVendorAddress,
            CustomerVendorCity = d.CustomerVendorCity,
            CustomerVendorCountry = d.CustomerVendorCountry
        };
    }

    public static class UserMappings
    {
        public static Expression<Func<User, UserDto>> ToUserDto = d => new UserDto
        {
            Id = d.Id,
            Email = d.Email,
            Username = d.Username,
            FirstName = d.FirstName,
            LastName = d.LastName,
            City = d.City,
            WebSite = d.WebSite,
            Address = d.Address,
            PhoneNumber = d.PhoneNumber,
            Country = d.Country,
            UserType = d.UserType,
            Identity = d.Identity,
            IsEmailConfirmed = d.IsEmailConfirmed,
            EmailVerificationCode = d.EmailVerificationCode,
            IsActive = d.IsActive,
            IsOnline = d.IsOnline,
            ProfilePicture = d.ProfilePicture,
            Role = new RoleDto
            {
                RoleId = d.Role!.Id,
                RoleName = d.Role.RoleName
            }
        };
    }
}