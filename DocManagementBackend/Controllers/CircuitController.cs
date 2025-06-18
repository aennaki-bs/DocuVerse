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
    public class CircuitController : ControllerBase
    {
        private readonly CircuitManagementService _circuitService;
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public CircuitController(
            CircuitManagementService circuitService, 
            ApplicationDbContext context,
            UserAuthorizationService authService)
        {
            _circuitService = circuitService;
            _context = context;
            _authService = authService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CircuitDto>>> GetCircuits()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var circuits = await _context.Circuits
                .Include(c => c.DocumentType)
                .Include(c => c.Statuses)
                .Include(c => c.Steps)
                .ThenInclude(s => s.Approvator)
                .ThenInclude(a => a != null ? a.User : null)
                .Include(c => c.Steps)
                .ThenInclude(s => s.ApprovatorsGroup)
                .ToListAsync();

            var circuitDtos = circuits.Select(c => new CircuitDto
            {
                Id = c.Id,
                CircuitKey = c.CircuitKey,
                Title = c.Title,
                Descriptif = c.Descriptif,
                IsActive = c.IsActive,
                DocumentTypeId = c.DocumentTypeId ?? 0,
                DocumentType = c.DocumentType != null ? new DocumentTypeDto
                {
                    TypeNumber = c.DocumentType.TypeNumber,
                    TypeKey = c.DocumentType.TypeKey,
                    TypeName = c.DocumentType.TypeName,
                    TypeAttr = c.DocumentType.TypeAttr,
                    TierType = c.DocumentType.TierType
                } : null,
                Statuses = c.Statuses.Select(s => new StatusDto
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
                }).ToList(),
                Steps = c.Steps.Select(s => new StepDto
                {
                    Id = s.Id,
                    StepKey = s.StepKey,
                    CircuitId = s.CircuitId,
                    Title = s.Title,
                    Descriptif = s.Descriptif,
                    CurrentStatusId = s.CurrentStatusId,
                    CurrentStatusTitle = c.Statuses.FirstOrDefault(st => st.Id == s.CurrentStatusId)?.Title ?? "",
                    NextStatusId = s.NextStatusId,
                    NextStatusTitle = c.Statuses.FirstOrDefault(st => st.Id == s.NextStatusId)?.Title ?? "",
                    RequiresApproval = s.RequiresApproval,
                    ApprovatorId = s.ApprovatorId,
                    ApprovatorUsername = s.Approvator?.User?.Username,
                    ApprovatorsGroupId = s.ApprovatorsGroupId,
                    ApprovatorsGroupName = s.ApprovatorsGroup?.Name
                }).ToList()
            }).ToList();

            return Ok(circuitDtos);
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<ActiveCircuitDto>>> GetActiveCircuits()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var activeCircuits = await _context.Circuits
                .Include(c => c.DocumentType)
                .Where(c => c.IsActive)
                .Select(c => new ActiveCircuitDto
                {
                    CircuitId = c.Id,
                    CircuitKey = c.CircuitKey,
                    CircuitTitle = c.Title,
                    DocumentTypeId = c.DocumentTypeId ?? 0,
                    DocumentTypeName = c.DocumentType != null ? c.DocumentType.TypeName : "Unknown"
                })
                .ToListAsync();

            return Ok(activeCircuits);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CircuitDto>> GetCircuit(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var circuit = await _context.Circuits
                .Include(c => c.DocumentType)
                .Include(c => c.Statuses)
                .Include(c => c.Steps)
                .ThenInclude(s => s.Approvator)
                .ThenInclude(a => a != null ? a.User : null)
                .Include(c => c.Steps)
                .ThenInclude(s => s.ApprovatorsGroup)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (circuit == null)
                return NotFound("Circuit not found.");

            var circuitDto = new CircuitDto
            {
                Id = circuit.Id,
                CircuitKey = circuit.CircuitKey,
                Title = circuit.Title,
                Descriptif = circuit.Descriptif,
                IsActive = circuit.IsActive,
                DocumentTypeId = circuit.DocumentTypeId ?? 0,
                DocumentType = circuit.DocumentType != null ? new DocumentTypeDto
                {
                    TypeNumber = circuit.DocumentType.TypeNumber,
                    TypeKey = circuit.DocumentType.TypeKey,
                    TypeName = circuit.DocumentType.TypeName,
                    TypeAttr = circuit.DocumentType.TypeAttr,
                    TierType = circuit.DocumentType.TierType
                } : null,
                Statuses = circuit.Statuses.Select(s => new StatusDto
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
                }).ToList(),
                Steps = circuit.Steps.Select(s => new StepDto
                {
                    Id = s.Id,
                    StepKey = s.StepKey,
                    CircuitId = s.CircuitId,
                    Title = s.Title,
                    Descriptif = s.Descriptif,
                    CurrentStatusId = s.CurrentStatusId,
                    CurrentStatusTitle = circuit.Statuses.FirstOrDefault(st => st.Id == s.CurrentStatusId)?.Title ?? "",
                    NextStatusId = s.NextStatusId,
                    NextStatusTitle = circuit.Statuses.FirstOrDefault(st => st.Id == s.NextStatusId)?.Title ?? "",
                    RequiresApproval = s.RequiresApproval,
                    ApprovatorId = s.ApprovatorId,
                    ApprovatorUsername = s.Approvator?.User?.Username,
                    ApprovatorsGroupId = s.ApprovatorsGroupId,
                    ApprovatorsGroupName = s.ApprovatorsGroup?.Name
                }).ToList()
            };

            return Ok(circuitDto);
        }

        [HttpGet("{circuitId}/validate")]
        public async Task<ActionResult<CircuitValidationDto>> ValidateCircuit(int circuitId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var validation = await _circuitService.ValidateCircuitAsync(circuitId);
                return Ok(validation);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error validating circuit: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<CircuitDto>> CreateCircuit([FromBody] CreateCircuitDto createCircuitDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

            // Validate document type
            if (createCircuitDto.DocumentTypeId <= 0)
                return BadRequest("Document type is required.");

            var documentType = await _context.DocumentTypes.FindAsync(createCircuitDto.DocumentTypeId);
            if (documentType == null)
                return BadRequest($"Document type with ID {createCircuitDto.DocumentTypeId} not found.");

            var circuit = new Circuit
            {
                Title = createCircuitDto.Title,
                Descriptif = createCircuitDto.Descriptif,
                IsActive = createCircuitDto.IsActive,
                DocumentTypeId = createCircuitDto.DocumentTypeId
            };

            try
            {
                var createdCircuit = await _circuitService.CreateCircuitAsync(circuit);
                
                return CreatedAtAction(nameof(GetCircuit), new { id = createdCircuit.Id }, new CircuitDto
                {
                    Id = createdCircuit.Id,
                    CircuitKey = createdCircuit.CircuitKey,
                    Title = createdCircuit.Title,
                    Descriptif = createdCircuit.Descriptif,
                    IsActive = createdCircuit.IsActive,
                    DocumentTypeId = createdCircuit.DocumentTypeId ?? 0,
                    DocumentType = new DocumentTypeDto
                    {
                        TypeNumber = documentType.TypeNumber,
                        TypeKey = documentType.TypeKey,
                        TypeName = documentType.TypeName,
                        TypeAttr = documentType.TypeAttr,
                        TierType = documentType.TierType
                    },
                    Statuses = new List<StatusDto>(),
                    Steps = new List<StepDto>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating circuit: {ex.Message}");
            }
        }

        [HttpPost("{circuitId}/steps")]
        public async Task<ActionResult<StepDto>> AddStep(int circuitId, [FromBody] CreateStepDto createStepDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            
            var step = new Step
            {
                CircuitId = circuitId,
                Title = createStepDto.Title,
                Descriptif = createStepDto.Descriptif,
                CurrentStatusId = createStepDto.CurrentStatusId,
                NextStatusId = createStepDto.NextStatusId,
                RequiresApproval = createStepDto.RequiresApproval,
                ApprovatorId = createStepDto.RequiresApproval ? createStepDto.ApprovatorId : null,
                ApprovatorsGroupId = createStepDto.RequiresApproval ? createStepDto.ApprovatorsGroupId : null
            };

            try
            {
                // Check if the step already exists (same current & next status combination)
                var existingStep = await _context.Steps
                    .AnyAsync(s => s.CircuitId == step.CircuitId &&
                               s.CurrentStatusId == step.CurrentStatusId &&
                               s.NextStatusId == step.NextStatusId);

                if (existingStep)
                    throw new InvalidOperationException("A step with this current and next status combination already exists");

                var createdStep = await _circuitService.AddStepToCircuitAsync(step);

                // Get status titles for response
                var currentStatus = await _context.Status.FindAsync(step.CurrentStatusId);
                var nextStatus = await _context.Status.FindAsync(step.NextStatusId);

                // Get approver information if applicable
                string? approvatorUsername = null;
                string? approversGroupName = null;

                if (step.RequiresApproval)
                {
                    if (step.ApprovatorId.HasValue)
                    {
                        var approvator = await _context.Approvators
                            .Include(a => a.User)
                            .FirstOrDefaultAsync(a => a.Id == step.ApprovatorId.Value);
                        approvatorUsername = approvator?.User?.Username;
                    }
                    else if (step.ApprovatorsGroupId.HasValue)
                    {
                        var approversGroup = await _context.ApprovatorsGroups
                            .FirstOrDefaultAsync(g => g.Id == step.ApprovatorsGroupId.Value);
                        approversGroupName = approversGroup?.Name;
                    }
                }

                return CreatedAtAction(nameof(GetCircuit), new { id = circuitId }, new StepDto
                {
                    Id = createdStep.Id,
                    StepKey = createdStep.StepKey,
                    CircuitId = createdStep.CircuitId,
                    Title = createdStep.Title,
                    Descriptif = createdStep.Descriptif,
                    CurrentStatusId = createdStep.CurrentStatusId,
                    CurrentStatusTitle = currentStatus?.Title ?? "",
                    NextStatusId = createdStep.NextStatusId,
                    NextStatusTitle = nextStatus?.Title ?? "",
                    RequiresApproval = createdStep.RequiresApproval,
                    ApprovatorId = createdStep.ApprovatorId,
                    ApprovatorUsername = approvatorUsername,
                    ApprovatorsGroupId = createdStep.ApprovatorsGroupId,
                    ApprovatorsGroupName = approversGroupName
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
                return BadRequest($"Error adding step: {ex.Message}");
            }
        }

        [HttpPut("steps/{stepId}")]
        public async Task<IActionResult> UpdateStep(int stepId, [FromBody] UpdateStepDto updateStepDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to modify steps.");

            try
            {
                var success = await _circuitService.UpdateStepAsync(stepId, updateStepDto);
                return Ok("Step updated successfully.");
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
                return StatusCode(500, $"Error updating step: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCircuit(int id, [FromBody] CreateCircuitDto updateCircuitDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to modify circuits.");

            var circuit = await _context.Circuits.FindAsync(id);
            if (circuit == null)
                return NotFound("Circuit not found.");

            // Validate document type if provided
            if (updateCircuitDto.DocumentTypeId > 0)
            {
                var documentType = await _context.DocumentTypes.FindAsync(updateCircuitDto.DocumentTypeId);
                if (documentType == null)
                    return BadRequest($"Document type with ID {updateCircuitDto.DocumentTypeId} not found.");
                
                circuit.DocumentTypeId = updateCircuitDto.DocumentTypeId;
            }

            circuit.Title = updateCircuitDto.Title;
            circuit.Descriptif = updateCircuitDto.Descriptif;
            circuit.IsActive = updateCircuitDto.IsActive;

            try
            {
                await _context.SaveChangesAsync();
                return Ok("Circuit updated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating circuit: {ex.Message}");
            }
        }

        [HttpDelete("steps/{stepId}")]
        public async Task<IActionResult> DeleteStep(int stepId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to delete steps.");

            try
            {
                var success = await _circuitService.DeleteStepAsync(stepId);
                return Ok("Step deleted successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting step: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCircuit(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to delete circuits.");

            var circuit = await _context.Circuits
                .Include(c => c.Statuses)
                .Include(c => c.Steps)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (circuit == null)
                return NotFound("Circuit not found.");

            // Check if circuit is in use by documents
            var inUse = await _context.Documents.AnyAsync(d => d.CircuitId == id);
            if (inUse)
                return BadRequest("Cannot delete circuit that is in use by documents.");

            // Delete all steps first
            _context.Steps.RemoveRange(circuit.Steps);

            // Delete all statuses next
            _context.Status.RemoveRange(circuit.Statuses);

            // Finally delete the circuit
            _context.Circuits.Remove(circuit);

            await _context.SaveChangesAsync();

            return Ok("Circuit deleted successfully.");
        }

        [HttpGet("check-step-exists")]
        public async Task<ActionResult<object>> CheckStepExists([FromQuery] StepExistenceDto stepExistenceDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Check if the step already exists
            var stepExists = await _context.Steps
                .AnyAsync(s => s.CircuitId == stepExistenceDto.CircuitId && 
                           s.CurrentStatusId == stepExistenceDto.CurrentStatusId && 
                           s.NextStatusId == stepExistenceDto.NextStatusId);
            
            // Return true if it DOESN'T exist (it's available to create)
            return Ok(new { available = stepExists });
        }

        [HttpGet("{circuitId}/statuses")]
        public async Task<ActionResult<IEnumerable<StatusDto>>> GetCircuitStatuses(int circuitId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Check if the circuit exists
            var circuitExists = await _context.Circuits.AnyAsync(c => c.Id == circuitId);
            if (!circuitExists)
                return NotFound($"Circuit with ID {circuitId} not found.");

            // Get all statuses for the specified circuit
            var statuses = await _context.Status
                .Where(s => s.CircuitId == circuitId)
                .OrderBy(s => s.Title)
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

        [HttpGet("{circuitId}/has-documents")]
        public async Task<ActionResult<bool>> CircuitHasDocuments(int circuitId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Check if the circuit exists and is active
            var circuit = await _context.Circuits
                .FirstOrDefaultAsync(c => c.Id == circuitId);
                
            if (circuit == null)
                return NotFound($"Circuit with ID {circuitId} not found.");
                
            if (!circuit.IsActive)
                return BadRequest($"Circuit with ID {circuitId} is not active.");

            // Check if there are any documents associated with this circuit
            bool hasDocuments = await _context.Documents
                .AnyAsync(d => d.CircuitId == circuitId);

            return Ok(hasDocuments);
        }
    }
}