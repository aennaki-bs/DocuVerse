using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DocManagementBackend.Services;
using DocManagementBackend.Models;
using DocManagementBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace DocManagementBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ApiSyncController : ControllerBase
    {
        private readonly IApiSyncService _apiSyncService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ApiSyncController> _logger;

        public ApiSyncController(
            IApiSyncService apiSyncService,
            ApplicationDbContext context,
            ILogger<ApiSyncController> logger)
        {
            _apiSyncService = apiSyncService;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all API sync configurations
        /// </summary>
        [HttpGet("configurations")]
        public async Task<ActionResult<IEnumerable<ApiSyncConfiguration>>> GetConfigurations()
        {
            try
            {
                var configurations = await _context.ApiSyncConfigurations
                    .OrderBy(c => c.EndpointName)
                    .ToListAsync();
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving API sync configurations");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get a specific API sync configuration
        /// </summary>
        [HttpGet("configurations/{id}")]
        public async Task<ActionResult<ApiSyncConfiguration>> GetConfiguration(int id)
        {
            try
            {
                var configuration = await _context.ApiSyncConfigurations.FindAsync(id);
                if (configuration == null)
                {
                    return NotFound();
                }
                return Ok(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving API sync configuration with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update API sync configuration
        /// </summary>
        [HttpPut("configurations/{id}")]
        public async Task<IActionResult> UpdateConfiguration(int id, [FromBody] UpdateConfigurationRequest request)
        {
            try
            {
                var configuration = await _context.ApiSyncConfigurations.FindAsync(id);
                if (configuration == null)
                {
                    return NotFound();
                }

                if (request.PollingIntervalMinutes < 1)
                {
                    return BadRequest("Polling interval must be at least 1 minute");
                }

                await _apiSyncService.UpdateSyncConfigurationAsync(
                    configuration.EndpointName,
                    request.PollingIntervalMinutes,
                    request.IsEnabled);

                _logger.LogInformation("Updated configuration for endpoint {EndpointName}", configuration.EndpointName);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating API sync configuration with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Manually trigger sync for all endpoints
        /// </summary>
        [HttpPost("sync/all")]
        public async Task<ActionResult<List<SyncResult>>> SyncAll()
        {
            try
            {
                _logger.LogInformation("Manual sync triggered for all endpoints");
                var results = await _apiSyncService.SyncAllAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual sync for all endpoints");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Manually trigger sync for Items endpoint
        /// </summary>
        [HttpPost("sync/items")]
        public async Task<ActionResult<SyncResult>> SyncItems()
        {
            try
            {
                _logger.LogInformation("Manual sync triggered for Items endpoint");
                var result = await _apiSyncService.SyncItemsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual sync for Items endpoint");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Manually trigger sync for GeneralAccounts endpoint
        /// </summary>
        [HttpPost("sync/generalaccounts")]
        public async Task<ActionResult<SyncResult>> SyncGeneralAccounts()
        {
            try
            {
                _logger.LogInformation("Manual sync triggered for GeneralAccounts endpoint");
                var result = await _apiSyncService.SyncGeneralAccountsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual sync for GeneralAccounts endpoint");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Manually trigger sync for Customers endpoint
        /// </summary>
        [HttpPost("sync/customers")]
        public async Task<ActionResult<SyncResult>> SyncCustomers()
        {
            try
            {
                _logger.LogInformation("Manual sync triggered for Customers endpoint");
                var result = await _apiSyncService.SyncCustomersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual sync for Customers endpoint");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Manually trigger sync for Vendors endpoint
        /// </summary>
        [HttpPost("sync/vendors")]
        public async Task<ActionResult<SyncResult>> SyncVendors()
        {
            try
            {
                _logger.LogInformation("Manual sync triggered for Vendors endpoint");
                var result = await _apiSyncService.SyncVendorsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual sync for Vendors endpoint");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Manually trigger sync for Locations endpoint
        /// </summary>
        [HttpPost("sync/locations")]
        public async Task<ActionResult<SyncResult>> SyncLocations()
        {
            try
            {
                _logger.LogInformation("Manual sync triggered for Locations endpoint");
                var result = await _apiSyncService.SyncLocationsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual sync for Locations endpoint");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Manually trigger sync for a specific endpoint by type
        /// </summary>
        [HttpPost("sync/{endpointType}")]
        public async Task<ActionResult<SyncResult>> SyncEndpoint(ApiEndpointType endpointType)
        {
            try
            {
                _logger.LogInformation("Manual sync triggered for {EndpointType} endpoint", endpointType);
                var result = await _apiSyncService.SyncEndpointAsync(endpointType);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during manual sync for {EndpointType} endpoint", endpointType);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get sync status and statistics
        /// </summary>
        [HttpGet("status")]
        public async Task<ActionResult<ApiSyncStatus>> GetSyncStatus()
        {
            try
            {
                var configurations = await _context.ApiSyncConfigurations.ToListAsync();
                
                var status = new ApiSyncStatus
                {
                    TotalEndpoints = configurations.Count,
                    EnabledEndpoints = configurations.Count(c => c.IsEnabled),
                    LastSyncTimes = configurations.ToDictionary(c => c.EndpointName, c => c.LastSyncTime),
                    NextSyncTimes = configurations.ToDictionary(c => c.EndpointName, c => c.NextSyncTime),
                    SyncStatuses = configurations.ToDictionary(c => c.EndpointName, c => c.LastSyncStatus ?? "Unknown"),
                    SuccessfulSyncs = configurations.ToDictionary(c => c.EndpointName, c => c.SuccessfulSyncs),
                    FailedSyncs = configurations.ToDictionary(c => c.EndpointName, c => c.FailedSyncs),
                    Configurations = configurations
                };

                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sync status");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Initialize or reset API sync configuration
        /// </summary>
        [HttpPost("initialize")]
        public async Task<IActionResult> InitializeConfiguration()
        {
            try
            {
                await _apiSyncService.InitializeConfigurationAsync();
                _logger.LogInformation("API sync configuration initialized/reset");
                return Ok(new { message = "Configuration initialized successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing API sync configuration");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update all existing configurations to use their specific recommended polling intervals
        /// Items: 60 min, GeneralAccounts: 60 min, Customers: 30 min, Vendors: 30 min
        /// </summary>
        [HttpPost("update-all-intervals")]
        public async Task<IActionResult> UpdateAllIntervals()
        {
            try
            {
                var configurations = await _context.ApiSyncConfigurations.ToListAsync();
                var updatedCount = 0;
                var updates = new List<string>();

                // Define the specific intervals for each endpoint
                var endpointIntervals = new Dictionary<string, int>
                {
                    { "Items", 60 },
                    { "GeneralAccounts", 60 },
                    { "Customers", 30 },
                    { "Vendors", 30 },
                    { "Locations", 60 }
                };

                foreach (var config in configurations)
                {
                    if (endpointIntervals.TryGetValue(config.EndpointName, out var targetInterval))
                    {
                        if (config.PollingIntervalMinutes != targetInterval)
                        {
                            var oldInterval = config.PollingIntervalMinutes;
                            config.PollingIntervalMinutes = targetInterval;
                            config.NextSyncTime = DateTime.UtcNow.AddMinutes(targetInterval);
                            config.UpdatedAt = DateTime.UtcNow;
                            updatedCount++;
                            updates.Add($"{config.EndpointName}: {oldInterval} → {targetInterval} minutes");
                        }
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Updated {Count} configurations with specific polling intervals", updatedCount);
                return Ok(new { 
                    message = $"Updated {updatedCount} configurations with specific polling intervals",
                    totalConfigurations = configurations.Count,
                    updatedConfigurations = updatedCount,
                    updates = updates,
                    intervals = endpointIntervals
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating polling intervals");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update polling interval for a specific endpoint by name
        /// </summary>
        [HttpPut("configurations/{endpointName}/interval")]
        public async Task<IActionResult> UpdateEndpointInterval(string endpointName, [FromBody] UpdateIntervalRequest request)
        {
            try
            {
                if (request.PollingIntervalMinutes < 1)
                {
                    return BadRequest("Polling interval must be at least 1 minute");
                }

                var configuration = await _context.ApiSyncConfigurations
                    .FirstOrDefaultAsync(c => c.EndpointName == endpointName);

                if (configuration == null)
                {
                    return NotFound($"Configuration for endpoint '{endpointName}' not found");
                }

                var oldInterval = configuration.PollingIntervalMinutes;
                configuration.PollingIntervalMinutes = request.PollingIntervalMinutes;
                configuration.IsEnabled = request.IsEnabled ?? configuration.IsEnabled;
                configuration.NextSyncTime = DateTime.UtcNow.AddMinutes(request.PollingIntervalMinutes);
                configuration.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated {EndpointName} polling interval from {OldInterval} to {NewInterval} minutes", 
                    endpointName, oldInterval, request.PollingIntervalMinutes);

                return Ok(new { 
                    message = $"Updated {endpointName} polling interval from {oldInterval} to {request.PollingIntervalMinutes} minutes",
                    endpointName = endpointName,
                    oldInterval = oldInterval,
                    newInterval = request.PollingIntervalMinutes,
                    isEnabled = configuration.IsEnabled,
                    nextSyncTime = configuration.NextSyncTime
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating polling interval for endpoint: {EndpointName}", endpointName);
                return StatusCode(500, "Internal server error");
            }
        }
    }

    // Request models
    public class UpdateConfigurationRequest
    {
        public int PollingIntervalMinutes { get; set; }
        public bool IsEnabled { get; set; }
    }

    public class UpdateIntervalRequest
    {
        public int PollingIntervalMinutes { get; set; }
        public bool? IsEnabled { get; set; }
    }

    // Response models
    public class ApiSyncStatus
    {
        public int TotalEndpoints { get; set; }
        public int EnabledEndpoints { get; set; }
        public Dictionary<string, DateTime> LastSyncTimes { get; set; } = new();
        public Dictionary<string, DateTime> NextSyncTimes { get; set; } = new();
        public Dictionary<string, string> SyncStatuses { get; set; } = new();
        public Dictionary<string, int> SuccessfulSyncs { get; set; } = new();
        public Dictionary<string, int> FailedSyncs { get; set; } = new();
        public List<ApiSyncConfiguration> Configurations { get; set; } = new();
    }
} 