using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace DocManagementBackend.Services
{
    public class ApiSyncBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ApiSyncBackgroundService> _logger;
        private readonly IConfiguration _configuration;
        private readonly TimeSpan _checkInterval;

        public ApiSyncBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<ApiSyncBackgroundService> logger,
            IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _configuration = configuration;
            
            // Check every minute to see if any endpoint needs to be synced
            var checkIntervalMinutes = configuration.GetValue<int>("ApiSync:CheckIntervalMinutes", 1);
            _checkInterval = TimeSpan.FromMinutes(checkIntervalMinutes);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("API Sync Background Service started");

            // Initialize configuration when service starts
            await InitializeConfigurationAsync();

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessScheduledSyncsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while processing scheduled syncs");
                }

                try
                {
                    await Task.Delay(_checkInterval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    // This is expected when cancellation is requested
                    break;
                }
            }

            _logger.LogInformation("API Sync Background Service stopped");
        }

        private async Task InitializeConfigurationAsync()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var apiSyncService = scope.ServiceProvider.GetRequiredService<IApiSyncService>();
                await apiSyncService.InitializeConfigurationAsync();
                _logger.LogInformation("API sync configuration initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize API sync configuration");
            }
        }

        private async Task ProcessScheduledSyncsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var apiSyncService = scope.ServiceProvider.GetRequiredService<IApiSyncService>();

            try
            {
                var currentTime = DateTime.UtcNow;
                
                // Get all enabled configurations that are due for sync
                var configurationsDue = await context.ApiSyncConfigurations
                    .Where(c => c.IsEnabled && c.NextSyncTime <= currentTime)
                    .ToListAsync();

                if (configurationsDue.Count == 0)
                {
                    _logger.LogDebug("No API endpoints are due for sync at {CurrentTime}", currentTime);
                    return;
                }

                _logger.LogInformation("Found {Count} API endpoints due for sync", configurationsDue.Count);

                foreach (var config in configurationsDue)
                {
                    try
                    {
                        _logger.LogInformation("Starting sync for endpoint: {EndpointName}", config.EndpointName);

                        // Parse the endpoint type from the configuration
                        if (Enum.TryParse<ApiEndpointType>(config.EndpointName, out var endpointType))
                        {
                            var result = await apiSyncService.SyncEndpointAsync(endpointType);
                            
                            if (result.IsSuccess)
                            {
                                _logger.LogInformation("Successfully synced {EndpointName}: {Inserted} inserted, {Skipped} skipped",
                                    config.EndpointName, result.RecordsInserted, result.RecordsSkipped);
                            }
                            else
                            {
                                _logger.LogWarning("Sync failed for {EndpointName}: {ErrorMessage}",
                                    config.EndpointName, result.ErrorMessage);
                            }
                        }
                        else
                        {
                            _logger.LogWarning("Unknown endpoint type: {EndpointName}", config.EndpointName);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error syncing endpoint: {EndpointName}", config.EndpointName);
                        
                        // Update the configuration to mark the failed sync
                        config.LastSyncTime = currentTime;
                        config.NextSyncTime = currentTime.AddMinutes(config.PollingIntervalMinutes);
                        config.LastSyncStatus = "Failed";
                        config.LastErrorMessage = ex.Message;
                        config.FailedSyncs++;
                        config.UpdatedAt = currentTime;
                    }
                }

                // Save any configuration updates
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing scheduled syncs");
            }
        }

        public override async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("API Sync Background Service is starting");
            await base.StartAsync(cancellationToken);
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("API Sync Background Service is stopping");
            await base.StopAsync(cancellationToken);
        }
    }

    // Extension methods for easier service registration
    public static class ApiSyncServiceExtensions
    {
        public static IServiceCollection AddApiSyncServices(this IServiceCollection services)
        {
            // Register HTTP client for BC API with NTLM authentication
            services.AddHttpClient<IBcApiClient, BcApiClient>((serviceProvider, client) =>
            {
                client.Timeout = TimeSpan.FromMinutes(2);
            })
            .ConfigurePrimaryHttpMessageHandler(serviceProvider =>
            {
                var configuration = serviceProvider.GetRequiredService<IConfiguration>();
                
                var username = Environment.GetEnvironmentVariable("USERNAME") ?? 
                              configuration["BcApi:Username"] ?? "ENNAKI";
                var password = Environment.GetEnvironmentVariable("PASSWORD") ?? 
                              configuration["BcApi:Password"] ?? "Allahislam@12";
                var domain = Environment.GetEnvironmentVariable("DOMAIN") ?? 
                            configuration["BcApi:Domain"] ?? "DESKTOP-8FCE015";

                var handler = new HttpClientHandler()
                {
                    Credentials = new NetworkCredential(username, password, domain),
                    PreAuthenticate = true
                };
                
                return handler;
            });

            // Register sync services
            services.AddScoped<IApiSyncService, ApiSyncService>();
            
            // Register background service
            services.AddHostedService<ApiSyncBackgroundService>();

            return services;
        }
    }
} 