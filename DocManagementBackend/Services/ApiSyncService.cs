using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace DocManagementBackend.Services
{
    public interface IApiSyncService
    {
        Task<SyncResult> SyncItemsAsync();
        Task<SyncResult> SyncGeneralAccountsAsync();
        Task<SyncResult> SyncCustomersAsync();
        Task<SyncResult> SyncVendorsAsync();
        Task<SyncResult> SyncLocationsAsync();
        Task<SyncResult> SyncResponsibilityCentresAsync();
        Task<SyncResult> SyncUnitOfMeasuresAsync();
        Task<SyncResult> SyncItemUnitOfMeasuresAsync();
        Task<List<SyncResult>> SyncAllAsync();
        Task<SyncResult> SyncEndpointAsync(ApiEndpointType endpointType);
        Task InitializeConfigurationAsync();
        Task UpdateSyncConfigurationAsync(string endpointName, int pollingIntervalMinutes, bool isEnabled);
    }

    public class ApiSyncService : IApiSyncService
    {
        private readonly ApplicationDbContext _context;
        private readonly IBcApiClient _bcApiClient;
        private readonly ILogger<ApiSyncService> _logger;

        public ApiSyncService(
            ApplicationDbContext context,
            IBcApiClient bcApiClient,
            ILogger<ApiSyncService> logger)
        {
            _context = context;
            _bcApiClient = bcApiClient;
            _logger = logger;
        }

        public async Task InitializeConfigurationAsync()
        {
            _logger.LogInformation("Initializing API sync configuration...");

            var endpoints = new List<ApiEndpointConfig>
            {
                new() { Name = "Items", Url = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/items", Type = ApiEndpointType.Items, DefaultPollingIntervalMinutes = 10 },
                new() { Name = "GeneralAccounts", Url = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/accounts", Type = ApiEndpointType.GeneralAccounts, DefaultPollingIntervalMinutes = 10 },
                new() { Name = "Customers", Url = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/customers", Type = ApiEndpointType.Customers, DefaultPollingIntervalMinutes = 10 },
                new() { Name = "Vendors", Url = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/vendors", Type = ApiEndpointType.Vendors, DefaultPollingIntervalMinutes = 10 },
                new() { Name = "Locations", Url = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/locations", Type = ApiEndpointType.Locations, DefaultPollingIntervalMinutes = 60 },
                new() { Name = "ResponsibilityCentres", Url = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/responsibilityCenters", Type = ApiEndpointType.ResponsibilityCentres, DefaultPollingIntervalMinutes = 60 },
                new() { Name = "UnitOfMeasures", Url = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/UnitofMeasures", Type = ApiEndpointType.UnitOfMeasures, DefaultPollingIntervalMinutes = 60 },
                new() { Name = "ItemUnitOfMeasures", Url = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/itemnitofMeasures", Type = ApiEndpointType.ItemUnitOfMeasures, DefaultPollingIntervalMinutes = 30 }
            };

            foreach (var endpoint in endpoints)
            {
                var existingConfig = await _context.ApiSyncConfigurations
                    .FirstOrDefaultAsync(c => c.EndpointName == endpoint.Name);

                if (existingConfig == null)
                {
                    var config = new ApiSyncConfiguration
                    {
                        EndpointName = endpoint.Name,
                        ApiUrl = endpoint.Url,
                        PollingIntervalMinutes = endpoint.DefaultPollingIntervalMinutes,
                        IsEnabled = true,
                        NextSyncTime = DateTime.UtcNow,
                        LastSyncStatus = "Initialized",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.ApiSyncConfigurations.Add(config);
                    _logger.LogInformation("Added configuration for endpoint: {EndpointName} with {Interval} minute interval", endpoint.Name, endpoint.DefaultPollingIntervalMinutes);
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("API sync configuration initialization completed");
        }

        public async Task<SyncResult> SyncItemsAsync()
        {
            return await SyncEndpointAsync(ApiEndpointType.Items);
        }

        public async Task<SyncResult> SyncGeneralAccountsAsync()
        {
            return await SyncEndpointAsync(ApiEndpointType.GeneralAccounts);
        }

        public async Task<SyncResult> SyncCustomersAsync()
        {
            return await SyncEndpointAsync(ApiEndpointType.Customers);
        }

        public async Task<SyncResult> SyncVendorsAsync()
        {
            return await SyncEndpointAsync(ApiEndpointType.Vendors);
        }

        public async Task<SyncResult> SyncLocationsAsync()
        {
            return await SyncEndpointAsync(ApiEndpointType.Locations);
        }

        public async Task<SyncResult> SyncResponsibilityCentresAsync()
        {
            return await SyncEndpointAsync(ApiEndpointType.ResponsibilityCentres);
        }

        public async Task<SyncResult> SyncUnitOfMeasuresAsync()
        {
            return await SyncEndpointAsync(ApiEndpointType.UnitOfMeasures);
        }

        public async Task<SyncResult> SyncItemUnitOfMeasuresAsync()
        {
            return await SyncEndpointAsync(ApiEndpointType.ItemUnitOfMeasures);
        }

        public async Task<List<SyncResult>> SyncAllAsync()
        {
            var results = new List<SyncResult>();

            foreach (var endpointType in Enum.GetValues<ApiEndpointType>())
            {
                var result = await SyncEndpointAsync(endpointType);
                results.Add(result);
            }

            return results;
        }

        public async Task<SyncResult> SyncEndpointAsync(ApiEndpointType endpointType)
        {
            var startTime = DateTime.UtcNow;
            var result = new SyncResult
            {
                EndpointName = endpointType.ToString(),
                SyncTime = startTime
            };

            try
            {
                _logger.LogInformation("Starting sync for endpoint: {EndpointType}", endpointType);

                switch (endpointType)
                {
                    case ApiEndpointType.Items:
                        await SyncItemsInternalAsync(result);
                        break;
                    case ApiEndpointType.GeneralAccounts:
                        await SyncGeneralAccountsInternalAsync(result);
                        break;
                    case ApiEndpointType.Customers:
                        await SyncCustomersInternalAsync(result);
                        break;
                    case ApiEndpointType.Vendors:
                        await SyncVendorsInternalAsync(result);
                        break;
                    case ApiEndpointType.Locations:
                        await SyncLocationsInternalAsync(result);
                        break;
                    case ApiEndpointType.ResponsibilityCentres:
                        await SyncResponsibilityCentresInternalAsync(result);
                        break;
                    case ApiEndpointType.UnitOfMeasures:
                        await SyncUnitOfMeasuresInternalAsync(result);
                        break;
                    case ApiEndpointType.ItemUnitOfMeasures:
                        await SyncItemUnitOfMeasuresInternalAsync(result);
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(endpointType), endpointType, null);
                }

                result.IsSuccess = true;
                result.Duration = DateTime.UtcNow - startTime;

                _logger.LogInformation("Sync completed for {EndpointType}. Processed: {Processed}, Inserted: {Inserted}, Skipped: {Skipped}",
                    endpointType, result.RecordsProcessed, result.RecordsInserted, result.RecordsSkipped);

                await UpdateSyncStatusAsync(endpointType.ToString(), result);
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Duration = DateTime.UtcNow - startTime;

                _logger.LogError(ex, "Sync failed for endpoint: {EndpointType}", endpointType);
                await UpdateSyncStatusAsync(endpointType.ToString(), result);
            }

            return result;
        }

        private async Task SyncItemsInternalAsync(SyncResult result)
        {
            var apiResponse = await _bcApiClient.GetItemsAsync();
            if (apiResponse?.Value == null)
            {
                throw new InvalidOperationException("Failed to fetch items from BC API");
            }

            result.RecordsProcessed = apiResponse.Value.Count;

                            // Get all existing UnitOfMeasures to check foreign key constraints
                var existingUnitCodes = await _context.UnitOfMeasures
                .Select(uc => uc.Code)
                .ToHashSetAsync();

            foreach (var bcItem in apiResponse.Value)
            {
                try
                {
                    // Skip records with missing required fields
                    if (string.IsNullOrWhiteSpace(bcItem.No))
                    {
                        _logger.LogWarning("Skipping item with missing No field");
                        result.RecordsSkipped++;
                        continue;
                    }

                    var existingItem = await _context.Items.FindAsync(bcItem.No);
                    if (existingItem == null)
                    {
                        var newItem = new Item
                        {
                            Code = bcItem.No.Trim(),
                            Description = (bcItem.Description ?? "").Trim(),
                            Unite = (bcItem.BaseUnitofMeasure ?? "").Trim(),
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.Items.Add(newItem);
                        result.RecordsInserted++;
                    }
                    else
                    {
                        result.RecordsSkipped++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing item {ItemNo}: {Error}", 
                        bcItem.No ?? "Unknown", ex.Message);
                    result.RecordsSkipped++;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving items to database: {Error}", ex.Message);
                throw;
            }
        }

        private async Task SyncGeneralAccountsInternalAsync(SyncResult result)
        {
            var apiResponse = await _bcApiClient.GetGeneralAccountsAsync();
            if (apiResponse?.Value == null)
            {
                throw new InvalidOperationException("Failed to fetch general accounts from BC API");
            }

            result.RecordsProcessed = apiResponse.Value.Count;

            foreach (var bcAccount in apiResponse.Value)
            {
                try
                {
                    // Skip records with missing required fields
                    if (string.IsNullOrWhiteSpace(bcAccount.No))
                    {
                        _logger.LogWarning("Skipping general account with missing No field");
                        result.RecordsSkipped++;
                        continue;
                    }

                    var existingAccount = await _context.GeneralAccounts.FindAsync(bcAccount.No);
                    if (existingAccount == null)
                    {
                        var newAccount = new GeneralAccounts
                        {
                            Code = bcAccount.No.Trim(),
                            Description = (bcAccount.Name ?? "").Trim(),
                            AccountType = (bcAccount.IncomeBalance ?? "").Trim(),
                            LinesCount = 0,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.GeneralAccounts.Add(newAccount);
                        result.RecordsInserted++;
                    }
                    else
                    {
                        result.RecordsSkipped++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing general account {AccountNo}: {Error}", 
                        bcAccount.No ?? "Unknown", ex.Message);
                    result.RecordsSkipped++;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving general accounts to database: {Error}", ex.Message);
                throw;
            }
        }

        private async Task SyncCustomersInternalAsync(SyncResult result)
        {
            var apiResponse = await _bcApiClient.GetCustomersAsync();
            if (apiResponse?.Value == null)
            {
                throw new InvalidOperationException("Failed to fetch customers from BC API");
            }

            result.RecordsProcessed = apiResponse.Value.Count;

            foreach (var bcCustomer in apiResponse.Value)
            {
                try
                {
                    // Skip records with missing required fields
                    if (string.IsNullOrWhiteSpace(bcCustomer.No))
                    {
                        _logger.LogWarning("Skipping customer with missing No field");
                        result.RecordsSkipped++;
                        continue;
                    }

                    var existingCustomer = await _context.Customers.FindAsync(bcCustomer.No);
                    if (existingCustomer == null)
                    {
                        var newCustomer = new Customer
                        {
                            Code = bcCustomer.No.Trim(),
                            Name = (bcCustomer.Name ?? "").Trim(),
                            Address = (bcCustomer.Address ?? string.Empty).Trim(),
                            City = (bcCustomer.City ?? string.Empty).Trim(),
                            Country = (bcCustomer.Country ?? string.Empty).Trim(),
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.Customers.Add(newCustomer);
                        result.RecordsInserted++;
                    }
                    else
                    {
                        result.RecordsSkipped++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing customer {CustomerNo}: {Error}", 
                        bcCustomer.No ?? "Unknown", ex.Message);
                    result.RecordsSkipped++;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving customers to database: {Error}", ex.Message);
                throw;
            }
        }

        private async Task SyncVendorsInternalAsync(SyncResult result)
        {
            var apiResponse = await _bcApiClient.GetVendorsAsync();
            if (apiResponse?.Value == null)
            {
                throw new InvalidOperationException("Failed to fetch vendors from BC API");
            }

            result.RecordsProcessed = apiResponse.Value.Count;

            foreach (var bcVendor in apiResponse.Value)
            {
                try
                {
                    // Skip records with missing required fields
                    if (string.IsNullOrWhiteSpace(bcVendor.No))
                    {
                        _logger.LogWarning("Skipping vendor with missing No field");
                        result.RecordsSkipped++;
                        continue;
                    }

                    var existingVendor = await _context.Vendors
                        .FirstOrDefaultAsync(v => v.VendorCode == bcVendor.No);
                    if (existingVendor == null)
                    {
                        var newVendor = new Vendor
                        {
                            VendorCode = bcVendor.No.Trim(),
                            Name = (bcVendor.Name ?? "").Trim(),
                            Address = (bcVendor.Address ?? string.Empty).Trim(),
                            City = (bcVendor.City ?? string.Empty).Trim(),
                            Country = (bcVendor.Country ?? string.Empty).Trim(),
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.Vendors.Add(newVendor);
                        result.RecordsInserted++;
                    }
                    else
                    {
                        result.RecordsSkipped++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing vendor {VendorNo}: {Error}", 
                        bcVendor.No ?? "Unknown", ex.Message);
                    result.RecordsSkipped++;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving vendors to database: {Error}", ex.Message);
                throw;
            }
        }

        private async Task SyncLocationsInternalAsync(SyncResult result)
        {
            var apiResponse = await _bcApiClient.GetLocationsAsync();
            if (apiResponse?.Value == null)
            {
                throw new InvalidOperationException("Failed to fetch locations from BC API");
            }

            result.RecordsProcessed = apiResponse.Value.Count;

            foreach (var bcLocation in apiResponse.Value)
            {
                try
                {
                    // Skip records with missing required fields
                    if (string.IsNullOrWhiteSpace(bcLocation.No))
                    {
                        _logger.LogWarning("Skipping location with missing No field");
                        result.RecordsSkipped++;
                        continue;
                    }

                    var existingLocation = await _context.Locations.FindAsync(bcLocation.No);
                    if (existingLocation == null)
                    {
                        var newLocation = new Location
                        {
                            LocationCode = bcLocation.No.Trim(),
                            Description = (bcLocation.Description ?? "Unknown Location").Trim(),
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.Locations.Add(newLocation);
                        result.RecordsInserted++;
                    }
                    else
                    {
                        result.RecordsSkipped++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing location {LocationNo}: {Error}", 
                        bcLocation.No ?? "Unknown", ex.Message);
                    result.RecordsSkipped++;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving locations to database: {Error}", ex.Message);
                throw;
            }
        }

        private async Task SyncResponsibilityCentresInternalAsync(SyncResult result)
        {
            var apiResponse = await _bcApiClient.GetResponsibilityCentresAsync();
            if (apiResponse?.Value == null)
            {
                throw new InvalidOperationException("Failed to fetch responsibility centres from BC API");
            }

            result.RecordsProcessed = apiResponse.Value.Count;

            foreach (var bcResponsibilityCentre in apiResponse.Value)
            {
                try
                {
                    // Skip records with missing required fields
                    if (string.IsNullOrWhiteSpace(bcResponsibilityCentre.Code))
                    {
                        _logger.LogWarning("Skipping responsibility centre with missing Code field");
                        result.RecordsSkipped++;
                        continue;
                    }

                    var existingCentre = await _context.ResponsibilityCentres
                        .FirstOrDefaultAsync(rc => rc.Code == bcResponsibilityCentre.Code);
                    if (existingCentre == null)
                    {
                        var newCentre = new ResponsibilityCentre
                        {
                            Code = bcResponsibilityCentre.Code.Trim(),
                            Descr = (!string.IsNullOrWhiteSpace(bcResponsibilityCentre.Name) 
                                    ? bcResponsibilityCentre.Name 
                                    : bcResponsibilityCentre.Description ?? "Unknown Centre").Trim(),
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.ResponsibilityCentres.Add(newCentre);
                        result.RecordsInserted++;
                    }
                    else
                    {
                        // Update description if it has changed
                        var newDescription = (!string.IsNullOrWhiteSpace(bcResponsibilityCentre.Name) 
                                            ? bcResponsibilityCentre.Name 
                                            : bcResponsibilityCentre.Description ?? "Unknown Centre").Trim();
                        if (existingCentre.Descr != newDescription)
                        {
                            existingCentre.Descr = newDescription;
                            existingCentre.UpdatedAt = DateTime.UtcNow;
                        }
                        result.RecordsSkipped++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing responsibility centre {Code}: {Error}", 
                        bcResponsibilityCentre.Code ?? "Unknown", ex.Message);
                    result.RecordsSkipped++;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving responsibility centres to database: {Error}", ex.Message);
                throw;
            }
        }

        private async Task SyncUnitOfMeasuresInternalAsync(SyncResult result)
        {
            var apiResponse = await _bcApiClient.GetUnitOfMeasuresAsync();
            if (apiResponse?.Value == null)
            {
                throw new InvalidOperationException("Failed to fetch units of measure from BC API");
            }

            result.RecordsProcessed = apiResponse.Value.Count;

            foreach (var bcUnitOfMeasure in apiResponse.Value)
            {
                try
                {
                    // Skip records with missing required fields
                    if (string.IsNullOrWhiteSpace(bcUnitOfMeasure.Code))
                    {
                        _logger.LogWarning("Skipping unit of measure with missing Code field");
                        result.RecordsSkipped++;
                        continue;
                    }

                    var existingUnit = await _context.UnitOfMeasures.FindAsync(bcUnitOfMeasure.Code);
                    if (existingUnit == null)
                    {
                        var newUnit = new UnitOfMeasure
                        {
                            Code = bcUnitOfMeasure.Code.Trim(),
                            Description = (bcUnitOfMeasure.Description ?? "Unknown Unit").Trim(),
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                            ItemsCount = 0
                        };

                        _context.UnitOfMeasures.Add(newUnit);
                        result.RecordsInserted++;
                    }
                    else
                    {
                        // Update description if it has changed
                        var newDescription = (bcUnitOfMeasure.Description ?? "Unknown Unit").Trim();
                        if (existingUnit.Description != newDescription)
                        {
                            existingUnit.Description = newDescription;
                            existingUnit.UpdatedAt = DateTime.UtcNow;
                        }
                        result.RecordsSkipped++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing unit of measure {Code}: {Error}", 
                        bcUnitOfMeasure.Code ?? "Unknown", ex.Message);
                    result.RecordsSkipped++;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving units of measure to database: {Error}", ex.Message);
                throw;
            }
        }

        private async Task SyncItemUnitOfMeasuresInternalAsync(SyncResult result)
        {
            var apiResponse = await _bcApiClient.GetItemUnitOfMeasuresAsync();
            if (apiResponse?.Value == null)
            {
                throw new InvalidOperationException("Failed to fetch item units of measure from BC API");
            }

            result.RecordsProcessed = apiResponse.Value.Count;

            // Get all existing items and units of measure to validate foreign keys
            var existingItems = await _context.Items
                .Select(i => i.Code)
                .ToHashSetAsync();

            var existingUnits = await _context.UnitOfMeasures
                .Select(u => u.Code)
                .ToHashSetAsync();

            foreach (var bcItemUnitOfMeasure in apiResponse.Value)
            {
                try
                {
                    // Skip records with missing required fields
                    if (string.IsNullOrWhiteSpace(bcItemUnitOfMeasure.ItemNo) || 
                        string.IsNullOrWhiteSpace(bcItemUnitOfMeasure.Code))
                    {
                        _logger.LogWarning("Skipping item unit of measure with missing ItemNo or Code field");
                        result.RecordsSkipped++;
                        continue;
                    }

                    // Validate foreign key constraints
                    if (!existingItems.Contains(bcItemUnitOfMeasure.ItemNo))
                    {
                        _logger.LogWarning("Item '{ItemNo}' for item unit of measure not found in Items table, skipping",
                            bcItemUnitOfMeasure.ItemNo);
                        result.RecordsSkipped++;
                        continue;
                    }

                    if (!existingUnits.Contains(bcItemUnitOfMeasure.Code))
                    {
                        _logger.LogWarning("Unit '{Code}' for item unit of measure not found in UnitOfMeasures table, skipping",
                            bcItemUnitOfMeasure.Code);
                        result.RecordsSkipped++;
                        continue;
                    }

                    var existingItemUnit = await _context.ItemUnitOfMeasures
                        .FirstOrDefaultAsync(ium => ium.ItemCode == bcItemUnitOfMeasure.ItemNo && 
                                                   ium.UnitOfMeasureCode == bcItemUnitOfMeasure.Code);
                    
                    if (existingItemUnit == null)
                    {
                        var newItemUnit = new ItemUnitOfMeasure
                        {
                            ItemCode = bcItemUnitOfMeasure.ItemNo.Trim(),
                            UnitOfMeasureCode = bcItemUnitOfMeasure.Code.Trim(),
                            QtyPerUnitOfMeasure = bcItemUnitOfMeasure.QtyperUnitofMeasure,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        _context.ItemUnitOfMeasures.Add(newItemUnit);
                        result.RecordsInserted++;
                    }
                    else
                    {
                        // Update quantity if it has changed
                        if (existingItemUnit.QtyPerUnitOfMeasure != bcItemUnitOfMeasure.QtyperUnitofMeasure)
                        {
                            existingItemUnit.QtyPerUnitOfMeasure = bcItemUnitOfMeasure.QtyperUnitofMeasure;
                            existingItemUnit.UpdatedAt = DateTime.UtcNow;
                        }
                        result.RecordsSkipped++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing item unit of measure {ItemNo}-{Code}: {Error}", 
                        bcItemUnitOfMeasure.ItemNo ?? "Unknown", bcItemUnitOfMeasure.Code ?? "Unknown", ex.Message);
                    result.RecordsSkipped++;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving item units of measure to database: {Error}", ex.Message);
                throw;
            }
        }

        private async Task UpdateSyncStatusAsync(string endpointName, SyncResult result)
        {
            try
            {
                var config = await _context.ApiSyncConfigurations
                    .FirstOrDefaultAsync(c => c.EndpointName == endpointName);

                if (config != null)
                {
                    config.LastSyncTime = result.SyncTime;
                    config.NextSyncTime = DateTime.UtcNow.AddMinutes(config.PollingIntervalMinutes);
                    config.LastSyncStatus = result.IsSuccess ? "Success" : "Failed";
                    config.LastErrorMessage = result.ErrorMessage;
                    config.UpdatedAt = DateTime.UtcNow;

                    if (result.IsSuccess)
                    {
                        config.SuccessfulSyncs++;
                    }
                    else
                    {
                        config.FailedSyncs++;
                    }

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update sync status for endpoint: {EndpointName}", endpointName);
            }
        }

        public async Task UpdateSyncConfigurationAsync(string endpointName, int pollingIntervalMinutes, bool isEnabled)
        {
            var config = await _context.ApiSyncConfigurations
                .FirstOrDefaultAsync(c => c.EndpointName == endpointName);

            if (config != null)
            {
                config.PollingIntervalMinutes = pollingIntervalMinutes;
                config.IsEnabled = isEnabled;
                config.UpdatedAt = DateTime.UtcNow;
                
                // Update next sync time if the interval changed
                if (isEnabled)
                {
                    config.NextSyncTime = DateTime.UtcNow.AddMinutes(pollingIntervalMinutes);
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Updated configuration for endpoint {EndpointName}: Interval={Interval}min, Enabled={Enabled}",
                    endpointName, pollingIntervalMinutes, isEnabled);
            }
        }
    }
} 