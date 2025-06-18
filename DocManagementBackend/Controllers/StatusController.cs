using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using DocManagementBackend.Services;
using System.Security.Claims;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class StatusController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly CircuitManagementService _circuitService;
        private readonly UserAuthorizationService _authService;

        public StatusController(
            ApplicationDbContext context, 
            CircuitManagementService circuitService,
            UserAuthorizationService authService)
        {
            _context = context;
            _circuitService = circuitService;
            _authService = authService;
        }

        [HttpGet("circuit/{circuitId}")]
        public async Task<ActionResult<IEnumerable<StatusDto>>> GetStatusesForCircuit(int circuitId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var statuses = await _context.Status
                .Where(s => s.CircuitId == circuitId)
                .OrderBy(s => s.Id)
                .Select(s => new StatusDto
                {
                    StatusId = s.Id,
                    StatusKey = s.StatusKey,
                    Title = s.Title,
                    Description = s.Description,
                    IsRequired = s.IsRequired,
                    IsInitial = s.IsInitial,
                    IsFinal = s.IsFinal,
                    IsFlexible = s.IsFlexible,
                    CircuitId = s.CircuitId
                })
                .ToListAsync();

            return Ok(statuses);
        }

        [HttpGet("{statusId}")]
        public async Task<ActionResult<StatusDto>> GetStatus(int statusId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var status = await _context.Status.FindAsync(statusId);
            if (status == null)
                return NotFound("Status not found.");

            var statusDto = new StatusDto
            {
                StatusId = status.Id,
                StatusKey = status.StatusKey,
                Title = status.Title,
                Description = status.Description,
                IsRequired = status.IsRequired,
                IsInitial = status.IsInitial,
                IsFinal = status.IsFinal,
                IsFlexible = status.IsFlexible,
                CircuitId = status.CircuitId
            };

            return Ok(statusDto);
        }

        [HttpPost("circuit/{circuitId}")]
        public async Task<ActionResult<StatusDto>> AddStatusToCircuit(int circuitId, [FromBody] CreateStatusDto createStatusDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var status = new Status
            {
                CircuitId = circuitId,
                Title = createStatusDto.Title,
                Description = createStatusDto.Description,
                IsRequired = createStatusDto.IsRequired,
                IsInitial = createStatusDto.IsInitial,
                IsFinal = createStatusDto.IsFinal,
                IsFlexible = createStatusDto.IsFlexible
            };

            try
            {
                var createdStatus = await _circuitService.AddStatusToCircuitAsync(status);

                return CreatedAtAction(nameof(GetStatus), new { statusId = createdStatus.Id }, new StatusDto
                {
                    StatusId = createdStatus.Id,
                    StatusKey = createdStatus.StatusKey,
                    Title = createdStatus.Title,
                    Description = createdStatus.Description,
                    IsRequired = createdStatus.IsRequired,
                    IsInitial = createdStatus.IsInitial,
                    IsFinal = createdStatus.IsFinal,
                    IsFlexible = createdStatus.IsFlexible,
                    CircuitId = createdStatus.CircuitId
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating status: {ex.Message}");
            }
        }

        [HttpPut("{statusId}")]
        public async Task<IActionResult> UpdateStatus(int statusId, [FromBody] UpdateStatusDto updateStatusDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var success = await _circuitService.UpdateStatusAsync(statusId, updateStatusDto);
                return Ok("Status updated successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error updating status: {ex.Message}");
            }
        }

        [HttpDelete("{statusId}")]
        public async Task<IActionResult> DeleteStatus(int statusId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var success = await _circuitService.DeleteStatusAsync(statusId);
                return Ok("Status deleted successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting status: {ex.Message}");
            }
        }
    }
}