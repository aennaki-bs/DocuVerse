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
    public class WorkflowController : ControllerBase
    {
        private readonly DocumentWorkflowService _workflowService;
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public WorkflowController(
            DocumentWorkflowService workflowService, 
            ApplicationDbContext context,
            UserAuthorizationService authService)
        {
            _workflowService = workflowService;
            _context = context;
            _authService = authService;
        }

        [HttpPost("assign-circuit")]
        public async Task<IActionResult> AssignDocumentToCircuit([FromBody] AssignCircuitDto assignCircuitDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

            try
            {
                var success = await _workflowService.AssignDocumentToCircuitAsync(
                    assignCircuitDto.DocumentId, assignCircuitDto.CircuitId, userId);

                if (success)
                    return Ok("Document assigned to circuit successfully.");
                else
                    return BadRequest("Failed to assign document to circuit.");
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
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("perform-action")]
        public async Task<IActionResult> PerformAction([FromBody] PerformActionDto actionDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

            try
            {
                var success = await _workflowService.ProcessActionAsync(
                    actionDto.DocumentId, actionDto.ActionId, userId, actionDto.Comments, actionDto.IsApproved);

                if (success)
                    return Ok("Action performed successfully.");
                else
                    return BadRequest("Failed to perform action.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("move-to-status")]
        public async Task<IActionResult> MoveToStatus([FromBody] MoveToStatusDto moveToStatusDto)
        {
            Console.WriteLine($"MoveToStatus called with documentId={moveToStatusDto.DocumentId}, targetStatusId={moveToStatusDto.TargetStatusId}");
            
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            try
            {
                // Get document and status information for logging
                var document = await _context.Documents
                    .Include(d => d.CurrentStatus)
                    .FirstOrDefaultAsync(d => d.Id == moveToStatusDto.DocumentId);
                
                if (document == null)
                    return NotFound("Document not found.");
                
                var targetStatus = await _context.Status
                    .FirstOrDefaultAsync(s => s.Id == moveToStatusDto.TargetStatusId);
                
                if (targetStatus == null)
                    return NotFound("Target status not found.");
        
                Console.WriteLine($"Attempting to move document from status '{document?.CurrentStatus?.Title}' to '{targetStatus?.Title}'");
                Console.WriteLine($"Target status IsFlexible: {targetStatus?.IsFlexible}");
        
                // Check if we can make this transition
                bool canMove = await _workflowService.CanMoveToStatusAsync(
                    moveToStatusDto.DocumentId, 
                    moveToStatusDto.TargetStatusId);
                
                Console.WriteLine($"CanMoveToStatusAsync result: {canMove}");
                
                if (!canMove)
                    return BadRequest("This status transition is not allowed in the current workflow.");
                
                // Find the step needed for this transition
                var step = await _context.Steps
                    .FirstOrDefaultAsync(s => 
                        s.CircuitId == document.CircuitId &&
                        s.CurrentStatusId == document.CurrentStatusId &&
                        s.NextStatusId == moveToStatusDto.TargetStatusId);
                        
                if (step == null)
                    return BadRequest("No valid step found for this transition.");
                
                try
                {
                    // Check if step requires approval
                    if (step.RequiresApproval)
                    {
                        Console.WriteLine($"Step requires approval. Checking if user {userId} can auto-approve");
                        
                        // Track whether auto-approval has been performed
                        bool isAutoApproved = false;
                        
                        // Check if the user can auto-approve
                        // Case 1: User is the single approver assigned to this step
                        if (step.ApprovatorId.HasValue)
                        {
                            var approvator = await _context.Approvators
                                .FirstOrDefaultAsync(a => a.Id == step.ApprovatorId.Value);
                                
                            if (approvator != null)
                            {
                                Console.WriteLine($"Step has approvator ID: {approvator.Id}, User ID: {approvator.UserId}");
                                
                                if (approvator.UserId == userId)
                                {
                                    Console.WriteLine($"User {userId} is the assigned approvator - creating auto-approved record");
                                    
                                    // Create an auto-approved record
                                    var approvalWriting = new ApprovalWriting
                                    {
                                        DocumentId = moveToStatusDto.DocumentId,
                                        StepId = step.Id,
                                        ProcessedByUserId = userId,
                                        ApprovatorId = step.ApprovatorId,
                                        Status = ApprovalStatus.Accepted,
                                        Comments = $"Auto-approved by {user.Username}: {moveToStatusDto.Comments}",
                                        CreatedAt = DateTime.UtcNow
                                    };
                                    
                                    _context.ApprovalWritings.Add(approvalWriting);
                                    await _context.SaveChangesAsync();
                                    
                                    // Create auto-approval response record
                                    var approvalResponse = new ApprovalResponse
                                    {
                                        ApprovalWritingId = approvalWriting.Id,
                                        UserId = userId,
                                        IsApproved = true,
                                        Comments = "Auto-approved as user is the assigned approvator",
                                        ResponseDate = DateTime.UtcNow
                                    };
                                    
                                    _context.ApprovalResponses.Add(approvalResponse);
                                    await _context.SaveChangesAsync();
                                    
                                    isAutoApproved = true;
                                    Console.WriteLine($"Created auto-approved record with ID {approvalWriting.Id}");
                                }
                            }
                        }
                        // Case 2: User is in an approvers group with "Any" rule
                        else if (step.ApprovatorsGroupId.HasValue && !isAutoApproved)
                        {
                            var group = await _context.ApprovatorsGroups
                                .Include(g => g.ApprovatorsGroupUsers)
                                .FirstOrDefaultAsync(g => g.Id == step.ApprovatorsGroupId.Value);
                                
                            if (group != null)
                            {
                                Console.WriteLine($"Step has approvers group ID: {group.Id}");
                                
                                // Check if user is in the group
                                var groupUser = group.ApprovatorsGroupUsers
                                    .FirstOrDefault(gu => gu.UserId == userId);
                                    
                                if (groupUser != null)
                                {
                                    Console.WriteLine($"User {userId} is in the approvers group");
                                    
                                    // Get the group approval rule
                                    var rule = await _context.ApprovatorsGroupRules
                                        .FirstOrDefaultAsync(r => r.GroupId == group.Id);
                                        
                                    if (rule != null && rule.RuleType == RuleType.Any)
                                    {
                                        Console.WriteLine($"Group has 'Any' rule - creating auto-approved record");
                                        
                                        // Create an auto-approved record
                                        var approvalWriting = new ApprovalWriting
                                        {
                                            DocumentId = moveToStatusDto.DocumentId,
                                            StepId = step.Id,
                                            ProcessedByUserId = userId,
                                            ApprovatorsGroupId = step.ApprovatorsGroupId,
                                            Status = ApprovalStatus.Accepted,
                                            Comments = $"Auto-approved by {user.Username}: {moveToStatusDto.Comments}",
                                            CreatedAt = DateTime.UtcNow
                                        };
                                        
                                        _context.ApprovalWritings.Add(approvalWriting);
                                        await _context.SaveChangesAsync();
                                        
                                        // Create auto-approval response record
                                        var approvalResponse = new ApprovalResponse
                                        {
                                            ApprovalWritingId = approvalWriting.Id,
                                            UserId = userId,
                                            IsApproved = true,
                                            Comments = "Auto-approved as user is in approvers group with 'Any' rule",
                                            ResponseDate = DateTime.UtcNow
                                        };
                                        
                                        _context.ApprovalResponses.Add(approvalResponse);
                                        await _context.SaveChangesAsync();
                                        
                                        isAutoApproved = true;
                                        Console.WriteLine($"Created auto-approved record with ID {approvalWriting.Id}");
                                    }
                                    else if (rule != null && (rule.RuleType == RuleType.All || rule.RuleType == RuleType.Sequential))
                                    {
                                        Console.WriteLine($"Group has '{rule.RuleType}' rule - creating approval request");
                                        
                                        // For Sequential rule, we need to respect the order
                                        if (rule.RuleType == RuleType.Sequential)
                                        {
                                            var orderedUsers = group.ApprovatorsGroupUsers
                                                .OrderBy(gu => gu.OrderIndex ?? 0)
                                                .ToList();
                                                
                                            var currentUserIndex = orderedUsers.FindIndex(gu => gu.UserId == userId);
                                            
                                            Console.WriteLine($"Sequential approval: User {user.Username} is at position {currentUserIndex + 1}/{orderedUsers.Count}");
                                            
                                            // Check if all previous users in sequence have already approved for this step
                                            var previousUserIds = orderedUsers
                                                .Take(currentUserIndex)
                                                .Select(gu => gu.UserId)
                                                .ToList();
                                                
                                            // Check if there's an existing approval for this step
                                            var existingApproval = await _context.ApprovalWritings
                                                .FirstOrDefaultAsync(aw => aw.DocumentId == moveToStatusDto.DocumentId && 
                                                                          aw.StepId == step.Id &&
                                                                          aw.Status == ApprovalStatus.InProgress);
                                            
                                            if (existingApproval != null)
                                            {
                                                // Check how many previous users have approved
                                                var previousApprovalsCount = await _context.ApprovalResponses
                                                    .Where(ar => ar.ApprovalWritingId == existingApproval.Id && 
                                                                previousUserIds.Contains(ar.UserId) && 
                                                                ar.IsApproved)
                                                    .CountAsync();
                                                    
                                                Console.WriteLine($"Existing approval found. {previousApprovalsCount}/{previousUserIds.Count} previous users have approved");
                                                
                                                // Only auto-approve if all previous users have approved
                                                if (previousApprovalsCount == previousUserIds.Count)
                                                {
                                                    Console.WriteLine($"All previous users approved - auto-approving current user {user.Username}");
                                                    
                                                    // Auto-approve current user
                                                    var approvalResponse = new ApprovalResponse
                                                    {
                                                        ApprovalWritingId = existingApproval.Id,
                                                        UserId = userId,
                                                        IsApproved = true,
                                                        Comments = $"Auto-approved as user initiated the movement and it's their turn in sequence",
                                                        ResponseDate = DateTime.UtcNow
                                                    };
                                                    
                                                    _context.ApprovalResponses.Add(approvalResponse);
                                                    await _context.SaveChangesAsync();
                                                    
                                                    // Check if this completes all approvals
                                                    var totalApprovalsCount = await _context.ApprovalResponses
                                                        .Where(ar => ar.ApprovalWritingId == existingApproval.Id && ar.IsApproved)
                                                        .CountAsync();
                                                        
                                                    if (totalApprovalsCount == orderedUsers.Count)
                                                    {
                                                        existingApproval.Status = ApprovalStatus.Accepted;
                                                        await _context.SaveChangesAsync();
                                                        isAutoApproved = true;
                                                        Console.WriteLine($"All sequential approvals complete - marked as accepted");
                                                    }
                                                    else
                                                    {
                                                        Console.WriteLine($"Sequential approval continues - {totalApprovalsCount}/{orderedUsers.Count} users approved");
                                                        // Return to wait for remaining approvals
                                                        return Ok(new { 
                                                            message = "This step requires approval. Approval request updated and proceeding to next approver.",
                                                            requiresApproval = true,
                                                            approvalId = existingApproval.Id
                                                        });
                                                    }
                                                }
                                                else
                                                {
                                                    Console.WriteLine($"Not all previous users have approved yet - waiting for sequence");
                                                    // Return to wait for previous approvals
                                                    return Ok(new { 
                                                        message = "This step requires approval. Waiting for previous approvers in sequence.",
                                                        requiresApproval = true,
                                                        approvalId = existingApproval.Id
                                                    });
                                                }
                                            }
                                            else
                                            {
                                                // No existing approval - create new one
                                                Console.WriteLine($"Creating new sequential approval request");
                                                
                                                var approvalWriting = new ApprovalWriting
                                                {
                                                    DocumentId = moveToStatusDto.DocumentId,
                                                    StepId = step.Id,
                                                    ProcessedByUserId = userId,
                                                    ApprovatorsGroupId = step.ApprovatorsGroupId,
                                                    Status = ApprovalStatus.InProgress,
                                                    Comments = $"Sequential approval initiated by {user.Username}: {moveToStatusDto.Comments}",
                                                    CreatedAt = DateTime.UtcNow
                                                };
                                                
                                                _context.ApprovalWritings.Add(approvalWriting);
                                                await _context.SaveChangesAsync();
                                                
                                                // Only auto-approve if user is first in sequence OR all previous have approved
                                                if (currentUserIndex == 0)
                                                {
                                                    Console.WriteLine($"User is first in sequence - auto-approving");
                                                    
                                                    var approvalResponse = new ApprovalResponse
                                                    {
                                                        ApprovalWritingId = approvalWriting.Id,
                                                        UserId = userId,
                                                        IsApproved = true,
                                                        Comments = $"Auto-approved as first user in sequence who initiated the movement",
                                                        ResponseDate = DateTime.UtcNow
                                                    };
                                                    
                                                    _context.ApprovalResponses.Add(approvalResponse);
                                                    await _context.SaveChangesAsync();
                                                    
                                                    // Check if user is the only one in the group
                                                    if (orderedUsers.Count == 1)
                                                    {
                                                        approvalWriting.Status = ApprovalStatus.Accepted;
                                                        await _context.SaveChangesAsync();
                                                        isAutoApproved = true;
                                                        Console.WriteLine($"Only user in group - approval complete");
                                                    }
                                                    else
                                                    {
                                                        Console.WriteLine($"First user approved - waiting for remaining {orderedUsers.Count - 1} users");
                                                        return Ok(new { 
                                                            message = "This step requires approval. Your approval has been recorded, waiting for other approvers.",
                                                            requiresApproval = true,
                                                            approvalId = approvalWriting.Id
                                                        });
                                                    }
                                                }
                                                else
                                                {
                                                    Console.WriteLine($"User is not first in sequence - will wait for previous approvers");
                                                    return Ok(new { 
                                                        message = "This step requires approval. Approval request created, waiting for previous approvers in sequence.",
                                                        requiresApproval = true,
                                                        approvalId = approvalWriting.Id
                                                    });
                                                }
                                            }
                                        }
                                        else // RuleType.All
                                        {
                                            Console.WriteLine($"Group has 'All' rule - creating approval request with auto-approval for initiator");
                                            
                                            // For 'All' rule, create approval and auto-approve the initiator
                                            var approvalWriting = new ApprovalWriting
                                            {
                                                DocumentId = moveToStatusDto.DocumentId,
                                                StepId = step.Id,
                                                ProcessedByUserId = userId,
                                                ApprovatorsGroupId = step.ApprovatorsGroupId,
                                                Status = ApprovalStatus.InProgress,
                                                Comments = $"Group approval initiated by {user.Username}: {moveToStatusDto.Comments}",
                                                CreatedAt = DateTime.UtcNow
                                            };
                                            
                                            _context.ApprovalWritings.Add(approvalWriting);
                                            await _context.SaveChangesAsync();
                                            
                                            // Auto-approve the initiator
                                            var approvalResponse = new ApprovalResponse
                                            {
                                                ApprovalWritingId = approvalWriting.Id,
                                                UserId = userId,
                                                IsApproved = true,
                                                Comments = $"Auto-approved as user initiated the movement (Rule: All)",
                                                ResponseDate = DateTime.UtcNow
                                            };
                                            
                                            _context.ApprovalResponses.Add(approvalResponse);
                                            await _context.SaveChangesAsync();
                                            
                                            // Check if all users have approved
                                            var totalGroupMembers = group.ApprovatorsGroupUsers.Count;
                                            var approvedCount = await _context.ApprovalResponses
                                                .Where(ar => ar.ApprovalWritingId == approvalWriting.Id && ar.IsApproved)
                                                .CountAsync();
                                                
                                            Console.WriteLine($"All rule: {approvedCount}/{totalGroupMembers} members have approved");
                                            
                                            if (approvedCount == totalGroupMembers)
                                            {
                                                approvalWriting.Status = ApprovalStatus.Accepted;
                                                await _context.SaveChangesAsync();
                                                isAutoApproved = true;
                                                Console.WriteLine($"All required approvals complete - marked as auto-approved");
                                            }
                                            else
                                            {
                                                Console.WriteLine($"Additional approvals required from other group members");
                                                return Ok(new { 
                                                    message = "This step requires approval. Your approval has been recorded, waiting for other group members.",
                                                    requiresApproval = true,
                                                    approvalId = approvalWriting.Id
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // If not auto-approved, initiate normal approval process
                        if (!isAutoApproved)
                        {
                            Console.WriteLine($"User {userId} cannot auto-approve - initiating normal approval process");
                            
                            // Check if an approval writing already exists for this step (from group approval above)
                            var existingApproval = await _context.ApprovalWritings
                                .FirstOrDefaultAsync(aw => aw.DocumentId == moveToStatusDto.DocumentId && 
                                                          aw.StepId == step.Id &&
                                                          aw.Status == ApprovalStatus.InProgress);
                            
                            if (existingApproval != null)
                            {
                                Console.WriteLine($"Found existing approval writing ID {existingApproval.Id} in progress - checking if complete");
                                
                                // Check if the existing approval is now complete
                                if (existingApproval.Status == ApprovalStatus.Accepted)
                                {
                                    Console.WriteLine($"Existing approval is accepted - proceeding with status transition");
                                }
                                else
                                {
                                    // Approval still in progress - return and wait for other approvers
                                    return Ok(new { 
                                        message = "This step requires approval. An approval request is in progress.",
                                        requiresApproval = true,
                                        approvalId = existingApproval.Id
                                    });
                                }
                            }
                            else
                            {
                                // No existing approval, initiate normal approval process
                                var (requiresApproval, approvalWritingId) = await _workflowService.InitiateApprovalIfRequiredAsync(
                                    moveToStatusDto.DocumentId, step.Id, userId, moveToStatusDto.Comments);
                                    
                                if (requiresApproval)
                                {
                                    var approvalWriting = await _context.ApprovalWritings.FindAsync(approvalWritingId);
                                    if (approvalWriting == null || approvalWriting.Status != ApprovalStatus.Accepted)
                                    {
                                        // Approval needed but not yet granted - return here and don't proceed with the status transition
                                        return Ok(new { 
                                            message = "This step requires approval. An approval request has been initiated.",
                                            requiresApproval = true,
                                            approvalId = approvalWritingId
                                        });
                                    }
                                    
                                    // At this point, approval has been granted, so we can proceed
                                    Console.WriteLine($"Approval has been granted for document {moveToStatusDto.DocumentId}, proceeding with status transition");
                                }
                            }
                        }
                        else
                        {
                            Console.WriteLine($"Auto-approval successful for document {moveToStatusDto.DocumentId}, proceeding with status transition");
                        }
                    }
                    
                    // Approval is not required or has been granted, so proceed with the status transition
                    var success = await _workflowService.MoveToNextStatusAsync(
                        moveToStatusDto.DocumentId,
                        moveToStatusDto.TargetStatusId,
                        userId,
                        moveToStatusDto.Comments);
            
                    if (success)
                    {
                        Console.WriteLine("Document status updated successfully");
                        return Ok(new { 
                            message = "Document status updated successfully.",
                            requiresApproval = false
                        });
                    }
                    else
                    {
                        Console.WriteLine("Failed to update document status");
                        return BadRequest("Failed to update document status.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Exception in auto-approval process: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    
                    // Return with more diagnostic information
                    return StatusCode(500, $"Auto-approval error: {ex.Message}");
                }
            }
            catch (KeyNotFoundException ex)
            {
                Console.WriteLine($"KeyNotFoundException: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"InvalidOperationException: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in MoveToStatus: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("return-to-status")]
        public async Task<IActionResult> ReturnToStatus([FromBody] MoveToStatusDto returnDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to do action.");

            try
            {
                var success = await _workflowService.ReturnToPreviousStatusAsync(
                    returnDto.DocumentId,
                    returnDto.TargetStatusId,
                    userId,
                    returnDto.Comments);

                if (success)
                    return Ok("Document returned to status successfully.");
                else
                    return BadRequest("Failed to return document to status.");
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
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("return-to-previous")]
        public async Task<IActionResult> ReturnToPreviousStatus([FromBody] ReturnToPreviousStatusDto returnDto)
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
                return Unauthorized("User not allowed to perform this action.");

            try
            {
                var success = await _workflowService.ReturnToPreviousStatusAsync(
                    returnDto.DocumentId,
                    userId,
                    returnDto.Comments);

                if (success)
                    return Ok("Document returned to previous status successfully.");
                else
                    return BadRequest("Failed to return document to previous status.");
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
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("complete-status")]
        public async Task<IActionResult> CompleteDocumentStatus([FromBody] CompleteStatusDto completeStatusDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to perform this action.");

            try
            {
                var success = await _workflowService.CompleteDocumentStatusAsync(
                    completeStatusDto.DocumentId,
                    completeStatusDto.StatusId,
                    userId,
                    completeStatusDto.IsComplete,
                    completeStatusDto.Comments);

                if (success)
                    return Ok("Document status updated successfully.");
                else
                    return BadRequest("Failed to update document status.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/current-status")]
        public async Task<ActionResult<DocumentCurrentStatusDto>> GetDocumentCurrentStatus(int documentId)
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

            try
            {
                // Get the document and its current status
                var document = await _context.Documents
                    .Include(d => d.CurrentStatus)
                    .Include(d => d.CurrentStep)
                    .Include(d => d.Circuit)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return NotFound("Document not found.");

                // Create the response object
                var response = new DocumentCurrentStatusDto
                {
                    DocumentId = document.Id,
                    DocumentKey = document.DocumentKey,
                    Title = document.Title,
                    Status = document.Status,
                    StatusText = GetStatusText(document.Status),
                    CircuitId = document.CircuitId,
                    CircuitTitle = document.Circuit?.Title,
                    CurrentStatusId = document.CurrentStatusId,
                    CurrentStatusTitle = document.CurrentStatus?.Title,
                    CurrentStepId = document.CurrentStepId,
                    CurrentStepTitle = document.CurrentStep?.Title,
                    IsCircuitCompleted = document.IsCircuitCompleted,
                    LastUpdated = document.UpdatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/available-transitions")]
        public async Task<ActionResult<IEnumerable<StatusDto>>> GetAvailableTransitions(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            try
            {
                var transitions = await _workflowService.GetAvailableTransitionsAsync(documentId);
                return Ok(transitions);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/document-statuses")]
        public async Task<ActionResult<IEnumerable<DocumentStatusDto>>> GetDocumentStatuses(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            // Get the document and check if it has a current status
            var document = await _context.Documents
                .Include(d => d.Circuit)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                return NotFound("Document not found.");

            if (document.CircuitId == null)
                return NotFound("Document is not assigned to any circuit.");

            // Get statuses for the document's circuit with completion info for this document
            var statuses = await _context.Status
                .Where(s => s.CircuitId == document.CircuitId)
                .OrderBy(s => s.Id)
                .Select(s => new
                {
                    Status = s,
                    DocumentStatus = _context.DocumentStatus
                        .FirstOrDefault(ds => ds.DocumentId == documentId && ds.StatusId == s.Id)
                })
                .ToListAsync();

            var statusDtos = statuses.Select(item => new DocumentStatusDto
            {
                StatusId = item.Status.Id,
                Title = item.Status.Title,
                IsRequired = item.Status.IsRequired,
                IsComplete = item.DocumentStatus?.IsComplete ?? false,
                CompletedBy = item.DocumentStatus != null && item.DocumentStatus.CompletedByUserId.HasValue
                    ? _context.Users
                        .Where(u => u.Id == item.DocumentStatus.CompletedByUserId.Value)
                        .Select(u => u.Username)
                        .FirstOrDefault()
                    : null,
                CompletedAt = item.DocumentStatus?.CompletedAt
            }).ToList();

            return Ok(statusDtos);
        }

        [HttpGet("document/{documentId}/step-statuses")]
        public async Task<ActionResult<IEnumerable<DocumentStepStatusDto>>> GetDocumentStepStatuses(int documentId)
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

            try
            {
                // Get the document and verify it has a circuit
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStatus)
                    .Include(d => d.CurrentStep)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return NotFound("Document not found.");

                if (document.CircuitId == null)
                    return BadRequest("Document is not assigned to any circuit.");

                // Get all steps in the circuit
                var steps = await _context.Steps
                    .Include(s => s.CurrentStatus)
                    .Include(s => s.NextStatus)
                    .Where(s => s.CircuitId == document.CircuitId)
                    .OrderBy(s => s.Id)
                    .ToListAsync();

                if (!steps.Any())
                    return Ok(new List<DocumentStepStatusDto>()); // Return empty list if no steps

                // Get document step history to determine completed steps
                var stepHistory = await _context.DocumentStepHistory
                    .Include(h => h.User)
                    .Where(h => h.DocumentId == documentId)
                    .OrderByDescending(h => h.TransitionDate)
                    .ToListAsync();

                var result = new List<DocumentStepStatusDto>();

                foreach (var step in steps)
                {
                    // Determine if this step is completed
                    var stepCompletion = stepHistory.FirstOrDefault(h => h.StepId == step.Id);

                    // Check if this is the current step
                    bool isCurrentStep = document.CurrentStepId == step.Id;

                    // Check if step is completed
                    // A step is considered completed if:
                    // 1. It has a record in history AND
                    // 2. Either it's not the current step OR the document has moved beyond this step's status
                    bool isCompleted = stepCompletion != null && 
                        (!isCurrentStep || 
                         (document.CurrentStatusId != null && document.CurrentStatusId != step.CurrentStatusId));

                    var stepStatus = new DocumentStepStatusDto
                    {
                        StepId = step.Id,
                        StepKey = step.StepKey,
                        Title = step.Title,
                        Description = step.Descriptif,
                        CurrentStatusId = step.CurrentStatusId,
                        CurrentStatusTitle = step.CurrentStatus?.Title ?? "Unknown",
                        NextStatusId = step.NextStatusId,
                        NextStatusTitle = step.NextStatus?.Title ?? "Unknown",
                        IsCurrentStep = isCurrentStep,
                        IsCompleted = isCompleted,
                        CompletedAt = stepCompletion?.TransitionDate,
                        CompletedBy = stepCompletion?.User?.Username,
                        RequiresApproval = step.RequiresApproval
                    };

                    result.Add(stepStatus);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/history")]
        public async Task<ActionResult<IEnumerable<DocumentHistoryDto>>> GetDocumentHistory(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            try
            {
                var history = await _context.DocumentCircuitHistory
                    .Where(h => h.DocumentId == documentId)
                    .Include(h => h.Step)
                    .Include(h => h.ProcessedBy)
                    .Include(h => h.Action)
                    .Include(h => h.Status)
                    .OrderByDescending(h => h.ProcessedAt)
                    .ToListAsync();

                var historyDtos = history.Select(h => new DocumentHistoryDto
                {
                    Id = h.Id,
                    StepTitle = h.Step?.Title ?? "N/A",
                    ActionTitle = h.Action?.Title ?? "N/A",
                    StatusTitle = h.Status?.Title ?? "N/A",
                    ProcessedBy = h.ProcessedBy?.Username ?? "System",
                    ProcessedAt = h.ProcessedAt,
                    Comments = h.Comments,
                    IsApproved = h.IsApproved
                }).ToList();

                return Ok(historyDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/next-statuses")]
        public async Task<ActionResult<IEnumerable<StatusDto>>> GetNextPossibleStatuses(int documentId)
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

            try
            {
                // Step 1: Get the document and verify it has a current status and is assigned to a circuit
                var document = await _context.Documents
                    .Include(d => d.CurrentStatus)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return NotFound("Document not found.");

                if (document.CircuitId == null)
                    return BadRequest("Document is not assigned to any circuit.");

                if (document.CurrentStatusId == null)
                    return BadRequest("Document does not have a current status.");

                // Step 2: Find all steps in the circuit where the currentStatus matches the document's status
                var matchingSteps = await _context.Steps
                    .Include(s => s.NextStatus)
                    .Where(s => s.CircuitId == document.CircuitId && s.CurrentStatusId == document.CurrentStatusId)
                    .ToListAsync();

                if (!matchingSteps.Any())
                    return Ok(new List<StatusDto>()); // No next statuses available

                // Step 3: Extract the next statuses from the matching steps
                var nextStatusIds = matchingSteps.Select(s => s.NextStatusId).Distinct().ToList();

                var nextStatuses = await _context.Status
                    .Where(s => nextStatusIds.Contains(s.Id))
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

                return Ok(nextStatuses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/workflow-status")]
        public async Task<ActionResult<DocumentWorkflowStatusDto>> GetDocumentWorkflowStatus(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            try
            {
                var workflowStatus = await _workflowService.GetDocumentWorkflowStatusAsync(documentId);
                return Ok(workflowStatus);
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
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("pending-documents")]
        public async Task<ActionResult<IEnumerable<PendingDocumentDto>>> GetPendingDocuments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            try
            {
                // Get documents that are:
                // 1. Assigned to a circuit
                // 2. Not completed
                // 3. Current status is assigned to user's role (if role assignment is enabled)
                var pendingQuery = _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStatus)
                    .Include(d => d.CreatedBy)
                    .Where(d =>
                        d.CircuitId.HasValue &&
                        !d.IsCircuitCompleted &&
                        d.Status == 1 && // In Progress
                        d.CurrentStatusId.HasValue);

                var pendingDocuments = await pendingQuery.ToListAsync();

                var pendingDtos = pendingDocuments.Select(d => new PendingDocumentDto
                {
                    DocumentId = d.Id,
                    DocumentKey = d.DocumentKey,
                    Title = d.Title,
                    CreatedBy = d.CreatedBy?.Username ?? "Unknown",
                    CreatedAt = d.CreatedAt,
                    CircuitId = d.CircuitId!.Value,
                    CircuitTitle = d.Circuit?.Title ?? "Unknown",
                    CurrentStatusId = d.CurrentStatusId!.Value,
                    CurrentStatusTitle = d.CurrentStatus?.Title ?? "Unknown",
                    DaysInCurrentStatus = (int)(DateTime.UtcNow - d.UpdatedAt).TotalDays
                }).ToList();

                return Ok(pendingDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("reinitialize-workflow")]
        public async Task<IActionResult> ReinitializeWorkflow([FromBody] ReinitializeWorkflowDto reinitializeDto)
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

            // Only allow Admin users to reinitialize workflows
            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("Only administrators are allowed to reinitialize document workflows.");

            try
            {
                var success = await _workflowService.ReinitializeWorkflowAsync(
                    reinitializeDto.DocumentId,
                    userId,
                    reinitializeDto.Comments);

                if (success)
                    return Ok("Document workflow reinitialized successfully.");
                else
                    return BadRequest("Failed to reinitialize document workflow.");
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
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // Add this temporary debug endpoint
        [HttpGet("debug/document/{documentId}/steps")]
        public async Task<IActionResult> DebugDocumentSteps(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            try
            {
                // Get the document and its circuit
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStatus)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return NotFound("Document not found.");

                if (document.CircuitId == null)
                    return BadRequest("Document is not assigned to any circuit.");

                // Get all steps in the circuit with their approval configuration
                var steps = await _context.Steps
                    .Include(s => s.CurrentStatus)
                    .Include(s => s.NextStatus)
                    .Include(s => s.Approvator)
                    .ThenInclude(a => a != null ? a.User : null)
                    .Include(s => s.ApprovatorsGroup)
                    .Where(s => s.CircuitId == document.CircuitId)
                    .OrderBy(s => s.Id)
                    .Select(s => new 
                    {
                        StepId = s.Id,
                        StepKey = s.StepKey,
                        Title = s.Title,
                        CurrentStatusId = s.CurrentStatusId,
                        CurrentStatusTitle = s.CurrentStatus!.Title,
                        NextStatusId = s.NextStatusId,
                        NextStatusTitle = s.NextStatus!.Title,
                        RequiresApproval = s.RequiresApproval,
                        HasApprovator = s.ApprovatorId.HasValue,
                        ApprovatorUserId = s.Approvator != null ? s.Approvator.UserId : (int?)null,
                        ApprovatorUsername = s.Approvator != null && s.Approvator.User != null ? s.Approvator.User.Username : null,
                        HasApproversGroup = s.ApprovatorsGroupId.HasValue,
                        ApproversGroupId = s.ApprovatorsGroupId,
                        ApproversGroupName = s.ApprovatorsGroup != null ? s.ApprovatorsGroup.Name : null,
                        IsCurrentDocumentStep = s.CurrentStatusId == document.CurrentStatusId
                    })
                    .ToListAsync();

                var result = new 
                {
                    DocumentId = documentId,
                    DocumentKey = document.DocumentKey,
                    DocumentTitle = document.Title,
                    CircuitId = document.CircuitId,
                    CircuitTitle = document.Circuit?.Title,
                    CurrentStatusId = document.CurrentStatusId,
                    CurrentStatusTitle = document.CurrentStatus?.Title,
                    Steps = steps
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Debug error: {ex.Message}");
            }
        }

        // Add endpoint to enable approval for specific steps
        [HttpPost("configure-step-approval")]
        public async Task<IActionResult> ConfigureStepApproval([FromBody] ConfigureStepApprovalDto dto)
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

            // Only allow Admin or FullUser to configure approvals
            if (user.Role.RoleName != "Admin" && user.Role.RoleName != "FullUser")
                return Forbid("You don't have permission to configure step approvals.");

            try
            {
                var step = await _context.Steps.FirstOrDefaultAsync(s => s.StepKey == dto.StepKey);
                if (step == null)
                    return NotFound($"Step with key '{dto.StepKey}' not found.");

                step.RequiresApproval = dto.RequiresApproval;

                if (dto.RequiresApproval)
                {
                    // If enabling approval, we need either an approver or a group
                    if (dto.ApprovatorId.HasValue)
                    {
                        var approver = await _context.Approvators.FindAsync(dto.ApprovatorId.Value);
                        if (approver == null)
                            return BadRequest($"Approver with ID {dto.ApprovatorId.Value} not found.");
                        
                        step.ApprovatorId = dto.ApprovatorId.Value;
                        step.ApprovatorsGroupId = null; // Clear group if setting individual approver
                    }
                    else if (dto.ApproversGroupId.HasValue)
                    {
                        var group = await _context.ApprovatorsGroups.FindAsync(dto.ApproversGroupId.Value);
                        if (group == null)
                            return BadRequest($"Approvers group with ID {dto.ApproversGroupId.Value} not found.");
                        
                        step.ApprovatorsGroupId = dto.ApproversGroupId.Value;
                        step.ApprovatorId = null; // Clear individual approver if setting group
                    }
                    else
                    {
                        return BadRequest("When enabling approval, you must specify either an approver ID or an approvers group ID.");
                    }
                }
                else
                {
                    // If disabling approval, clear approvers
                    step.ApprovatorId = null;
                    step.ApprovatorsGroupId = null;
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = $"Step '{step.StepKey}' approval configuration updated successfully.",
                    stepKey = step.StepKey,
                    requiresApproval = step.RequiresApproval,
                    approvatorId = step.ApprovatorId,
                    approversGroupId = step.ApprovatorsGroupId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error configuring step approval: {ex.Message}");
            }
        }

        private string GetStatusText(int status)
        {
            return status switch
            {
                0 => "Draft",
                1 => "In Progress",
                2 => "Completed",
                3 => "Rejected",
                _ => "Unknown"
            };
        }
    }
}