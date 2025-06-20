// Services/DocumentWorkflowService.cs
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DocManagementBackend.Services
{
    public class DocumentWorkflowService
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentErpArchivalService _erpArchivalService;
        private readonly ILogger<DocumentWorkflowService> _logger;

        public DocumentWorkflowService(
            ApplicationDbContext context, 
            IDocumentErpArchivalService erpArchivalService,
            ILogger<DocumentWorkflowService> logger)
        {
            _context = context;
            _erpArchivalService = erpArchivalService;
            _logger = logger;
        }

        /// <summary>
        /// Assigns a document to a circuit and initializes its workflow status
        /// </summary>
        public async Task<bool> AssignDocumentToCircuitAsync(int documentId, int circuitId, int userId)
        {
            var document = await _context.Documents.FindAsync(documentId);
            if (document == null)
                throw new KeyNotFoundException("Document not found");

            var circuit = await _context.Circuits
                .Include(c => c.Statuses.Where(s => s.IsInitial))
                .FirstOrDefaultAsync(c => c.Id == circuitId);

            if (circuit == null)
                throw new KeyNotFoundException("Circuit not found");

            if (!circuit.IsActive)
                throw new InvalidOperationException("Circuit is not active");

            // Get the initial status for this circuit
            var initialStatus = circuit.Statuses.FirstOrDefault(s => s.IsInitial);
            if (initialStatus == null)
                throw new InvalidOperationException("Circuit does not have an initial status defined");

            // Update document
            document.CircuitId = circuitId;
            document.CurrentStatusId = initialStatus.Id;
            document.CurrentStepId = null; // Will be set when the first step is processed
            document.Status = 1; // In Progress
            document.IsCircuitCompleted = false;
            document.UpdatedAt = DateTime.UtcNow;
            document.UpdatedByUserId = userId; // Track who assigned the circuit

            // Create DocumentStatus records for all statuses in the circuit
            // The initial status is automatically marked as complete upon assignment
            var statuses = await _context.Status
                .Where(s => s.CircuitId == circuitId)
                .ToListAsync();

            foreach (var status in statuses)
            {
                var documentStatus = new DocumentStatus
                {
                    DocumentId = documentId,
                    StatusId = status.Id,
                    IsComplete = status.IsInitial, // Mark initial status as complete immediately
                    CompletedByUserId = status.IsInitial ? userId : (int?)null,
                    CompletedAt = status.IsInitial ? DateTime.UtcNow : (DateTime?)null
                };

                _context.DocumentStatus.Add(documentStatus);
            }

            // Create a circuit history entry
            var history = new DocumentCircuitHistory
            {
                DocumentId = documentId,
                StatusId = initialStatus.Id,
                ProcessedByUserId = userId,
                ProcessedAt = DateTime.UtcNow,
                Comments = "Document assigned to circuit",
                IsApproved = true
            };

            _context.DocumentCircuitHistory.Add(history);

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Process an action (approve, reject, etc.) on a document
        /// </summary>
        public async Task<bool> ProcessActionAsync(int documentId, int actionId, int userId, string comments, bool isApproved)
        {
            var document = await _context.Documents
                .Include(d => d.CurrentStatus)
                .Include(d => d.CurrentStep)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            if (document.CircuitId == null)
                throw new InvalidOperationException("Document is not assigned to a circuit");

            var action = await _context.Actions.FindAsync(actionId);
            if (action == null)
                throw new KeyNotFoundException("Action not found");

            // Check if the user can perform this action for the current step
            if (document.CurrentStepId.HasValue)
            {
                var currentStep = await _context.Steps.FindAsync(document.CurrentStepId.Value);
                if (currentStep == null)
                    throw new KeyNotFoundException("Current step not found");

                var stepAction = await _context.StepActions
                    .FirstOrDefaultAsync(sa => sa.StepId == currentStep.Id && sa.ActionId == actionId);

                if (stepAction == null)
                    throw new UnauthorizedAccessException("This action is not available for the current step");
            }

            // Record the action in history
            var history = new DocumentCircuitHistory
            {
                DocumentId = documentId,
                StepId = document.CurrentStepId,
                ActionId = actionId,
                StatusId = document.CurrentStatusId,
                ProcessedByUserId = userId,
                ProcessedAt = DateTime.UtcNow,
                Comments = comments,
                IsApproved = isApproved
            };

            _context.DocumentCircuitHistory.Add(history);

            // Check if action has any status effects
            var statusEffects = await _context.ActionStatusEffects
                .Where(ase => 
                    ase.ActionId == actionId && 
                    ase.StepId == document.CurrentStepId)
                .ToListAsync();

            bool documentModified = false;
            foreach (var effect in statusEffects)
            {
                // Update document status if the action sets it complete
                if (effect.SetsComplete)
                {
                    var documentStatus = await _context.DocumentStatus
                        .FirstOrDefaultAsync(ds => 
                            ds.DocumentId == documentId && 
                            ds.StatusId == effect.StatusId);

                    if (documentStatus != null)
                    {
                        documentStatus.IsComplete = true;
                        documentStatus.CompletedByUserId = userId;
                        documentStatus.CompletedAt = DateTime.UtcNow;
                        documentModified = true;
                    }
                }
            }

            // Update document if it was modified through status effects
            if (documentModified)
            {
                document.UpdatedAt = DateTime.UtcNow;
                document.UpdatedByUserId = userId; // Track who performed the action that modified the document
            }

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Validates a circuit's configuration for completeness and consistency
        /// </summary>
        public async Task<CircuitValidationDto> ValidateCircuitAsync(int circuitId)
        {
            var circuit = await _context.Circuits
                .Include(c => c.Statuses)
                .Include(c => c.Steps)
                .FirstOrDefaultAsync(c => c.Id == circuitId);

            if (circuit == null)
                throw new KeyNotFoundException("Circuit not found");

            var validation = new CircuitValidationDto
            {
                CircuitId = circuitId,
                IsValid = true,
                Errors = new List<string>(),
                Warnings = new List<string>()
            };

            // Check if the circuit has at least one status
            if (!circuit.Statuses.Any())
            {
                validation.IsValid = false;
                validation.Errors.Add("Circuit must have at least one status");
            }

            // Check if the circuit has at least one step
            if (!circuit.Steps.Any())
            {
                validation.IsValid = false;
                validation.Errors.Add("Circuit must have at least one step");
            }

            // Check if the circuit has exactly one initial status
            var initialStatusCount = circuit.Statuses.Count(s => s.IsInitial);
            if (initialStatusCount == 0)
            {
                validation.IsValid = false;
                validation.Errors.Add("Circuit must have an initial status");
            }
            else if (initialStatusCount > 1)
            {
                validation.IsValid = false;
                validation.Errors.Add("Circuit cannot have more than one initial status");
            }

            // Check if the circuit has at least one final status
            if (!circuit.Statuses.Any(s => s.IsFinal))
            {
                validation.IsValid = false;
                validation.Errors.Add("Circuit must have at least one final status");
            }

            // Check if all steps reference valid statuses
            foreach (var step in circuit.Steps)
            {
                var currentStatusExists = circuit.Statuses.Any(s => s.Id == step.CurrentStatusId);
                var nextStatusExists = circuit.Statuses.Any(s => s.Id == step.NextStatusId);

                if (!currentStatusExists)
                {
                    validation.IsValid = false;
                    validation.Errors.Add($"Step {step.Title} has an invalid current status");
                }

                if (!nextStatusExists)
                {
                    validation.IsValid = false;
                    validation.Errors.Add($"Step {step.Title} has an invalid next status");
                }
            }

            // Check for steps requiring approval without proper configuration
            var stepsWithApproval = circuit.Steps.Where(s => s.RequiresApproval).ToList();
            foreach (var step in stepsWithApproval)
            {
                var hasApprovator = await _context.Approvators.AnyAsync(a => a.StepId == step.Id);
                var hasApprovatorsGroup = await _context.ApprovatorsGroups.AnyAsync(g => g.StepId == step.Id);

                if (!hasApprovator && !hasApprovatorsGroup)
                {
                    validation.Warnings.Add($"Step {step.Title} requires approval but has no approvers configured");
                }
            }

            return validation;
        }

        /// <summary>
        /// Checks if the step requires approval
        /// </summary>
        public async Task<bool> StepRequiresApprovalAsync(int stepId)
        {
            var step = await _context.Steps.FindAsync(stepId);
            if (step == null)
                throw new KeyNotFoundException("Step not found");

            return step.RequiresApproval;
        }

        /// <summary>
        /// Creates an approval writing record and returns true if step requires approval
        /// </summary>
        public async Task<(bool RequiresApproval, int? ApprovalWritingId)> InitiateApprovalIfRequiredAsync(
            int documentId, int stepId, int processedByUserId, string comments)
        {
            var step = await _context.Steps
                .Include(s => s.Approvator)
                .Include(s => s.ApprovatorsGroup)
                .FirstOrDefaultAsync(s => s.Id == stepId);
            
            if (step == null)
                throw new KeyNotFoundException("Step not found");
                
            if (!step.RequiresApproval)
                return (false, null);
                
            // Check if there's already an open approval writing for this document/step
            var existingApproval = await _context.ApprovalWritings
                .FirstOrDefaultAsync(aw => 
                    aw.DocumentId == documentId && 
                    aw.StepId == stepId && 
                    (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress));
                    
            if (existingApproval != null)
                return (true, existingApproval.Id);
                
            // Determine if we need single approver or a group
            int? approvatorId = null;
            int? approvatorsGroupId = null;
            
            if (step.ApprovatorId.HasValue)
            {
                approvatorId = step.ApprovatorId;
            }
            else if (step.ApprovatorsGroupId.HasValue)
            {
                approvatorsGroupId = step.ApprovatorsGroupId;
            }
            else
            {
                throw new InvalidOperationException("This step requires approval but no approvator or group is configured");
            }
            
            // Create the approval writing
            var approvalWriting = new ApprovalWriting
            {
                DocumentId = documentId,
                StepId = stepId,
                ProcessedByUserId = processedByUserId,
                ApprovatorId = approvatorId,
                ApprovatorsGroupId = approvatorsGroupId,
                Status = ApprovalStatus.Open,
                Comments = comments,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.ApprovalWritings.Add(approvalWriting);
            await _context.SaveChangesAsync();
            
            return (true, approvalWriting.Id);
        }

        /// <summary>
        /// Process a response to an approval request
        /// </summary>
        public async Task<bool> ProcessApprovalResponseAsync(
            int approvalWritingId, int userId, bool isApproved, string comments)
        {
            var approvalWriting = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .FirstOrDefaultAsync(aw => aw.Id == approvalWritingId);
                
            if (approvalWriting == null)
                throw new KeyNotFoundException("Approval writing not found");
                
            if (approvalWriting.Status == ApprovalStatus.Accepted || 
                approvalWriting.Status == ApprovalStatus.Rejected)
                throw new InvalidOperationException("This approval has already been processed");
                
            // Check if the user is authorized to respond
            bool isAuthorized = false;
            
            if (approvalWriting.ApprovatorId.HasValue)
            {
                // Single approver case
                var approvator = await _context.Approvators
                    .FirstOrDefaultAsync(a => a.Id == approvalWriting.ApprovatorId.Value);
                    
                if (approvator == null)
                    throw new KeyNotFoundException("Approvator not found");
                    
                isAuthorized = approvator.UserId == userId;
            }
            else if (approvalWriting.ApprovatorsGroupId.HasValue)
            {
                // Group approver case
                var group = await _context.ApprovatorsGroups
                    .Include(g => g.ApprovatorsGroupUsers)
                    .FirstOrDefaultAsync(g => g.Id == approvalWriting.ApprovatorsGroupId.Value);
                    
                if (group == null)
                    throw new KeyNotFoundException("Approvers group not found");
                    
                // Check if user is in the group
                var groupUser = group.ApprovatorsGroupUsers
                    .FirstOrDefault(gu => gu.UserId == userId);
                    
                if (groupUser == null)
                    isAuthorized = false;
                else
                {
                    // Get the rule for this group
                    var rule = await _context.ApprovatorsGroupRules
                        .FirstOrDefaultAsync(r => r.GroupId == group.Id);
                        
                    if (rule == null)
                        throw new InvalidOperationException("No approval rule found for this group");
                    
                    if (rule.RuleType == RuleType.Sequential)
                    {
                        // For sequential, check if this user is the next in line
                        // Get existing responses
                        var responses = await _context.ApprovalResponses
                            .Where(r => r.ApprovalWritingId == approvalWriting.Id)
                            .ToListAsync();
                            
                        var respondedUserIds = responses.Select(r => r.UserId).ToList();
                        
                        // Get ordered users in the group
                        var orderedUsers = group.ApprovatorsGroupUsers
                            .Where(gu => gu.OrderIndex.HasValue)
                            .OrderBy(gu => gu.OrderIndex!.Value)
                            .ToList();
                            
                        if (orderedUsers.Any())
                        {
                            // If no responses yet, the first user is authorized
                            if (!responses.Any())
                            {
                                isAuthorized = orderedUsers.First().UserId == userId;
                            }
                            else
                            {
                                // Find the next user in sequence
                                var highestRespondedIndex = orderedUsers
                                    .Where(gu => respondedUserIds.Contains(gu.UserId))
                                    .Max(gu => gu.OrderIndex!.Value);
                                    
                                var nextUser = orderedUsers
                                    .FirstOrDefault(gu => gu.OrderIndex!.Value > highestRespondedIndex);
                                    
                                isAuthorized = nextUser?.UserId == userId;
                            }
                        }
                    }
                    else
                    {
                        // For Any or All, any user in the group is authorized
                        isAuthorized = true;
                    }
                }
            }
            
            if (!isAuthorized)
                throw new UnauthorizedAccessException("You are not authorized to approve/reject this request");
                
            // Create the response
            var approvalResponse = new ApprovalResponse
            {
                ApprovalWritingId = approvalWritingId,
                UserId = userId,
                IsApproved = isApproved,
                Comments = comments,
                ResponseDate = DateTime.UtcNow
            };
            
            _context.ApprovalResponses.Add(approvalResponse);
            
            // Update the approval writing status based on the response
            bool approvalCompleted = false;
            if (approvalWriting.ApprovatorId.HasValue)
            {
                // Single approver - the response determines the outcome
                approvalWriting.Status = isApproved ? ApprovalStatus.Accepted : ApprovalStatus.Rejected;
                approvalCompleted = true;
            }
            else if (approvalWriting.ApprovatorsGroupId.HasValue)
            {
                // Group approval - need to check the rule
                var group = await _context.ApprovatorsGroups
                    .Include(g => g.ApprovatorsGroupUsers)
                    .FirstOrDefaultAsync(g => g.Id == approvalWriting.ApprovatorsGroupId.Value);
                    
                if (group == null)
                    throw new KeyNotFoundException("Approvers group not found");
                    
                var rule = await _context.ApprovatorsGroupRules
                    .FirstOrDefaultAsync(r => r.GroupId == group.Id);
                    
                if (rule == null)
                    throw new InvalidOperationException("No approval rule found for this group");
                    
                // Get all responses including the new one
                var responses = await _context.ApprovalResponses
                    .Where(r => r.ApprovalWritingId == approvalWritingId)
                    .ToListAsync();
                    
                // Add the new response to our list
                responses.Add(approvalResponse);
                
                // Check if any response is a rejection
                bool anyRejection = responses.Any(r => !r.IsApproved);
                
                if (anyRejection)
                {
                    // Any rejection means the overall status is rejected
                    approvalWriting.Status = ApprovalStatus.Rejected;
                    approvalCompleted = true;
                }
                else
                {
                    // Handle based on rule type
                    switch (rule.RuleType)
                    {
                        case RuleType.Any:
                            // Any approval is enough
                            approvalWriting.Status = ApprovalStatus.Accepted;
                            approvalCompleted = true;
                            break;
                            
                        case RuleType.All:
                            // Need all users to approve
                            var totalUsers = group.ApprovatorsGroupUsers.Count;
                            var approvedResponses = responses.Count(r => r.IsApproved);
                            
                            if (approvedResponses == totalUsers)
                            {
                                approvalWriting.Status = ApprovalStatus.Accepted;
                                approvalCompleted = true;
                            }
                            else
                                approvalWriting.Status = ApprovalStatus.InProgress;
                            break;
                            
                        case RuleType.Sequential:
                            // Need all users to approve in order
                            var orderedUsers = group.ApprovatorsGroupUsers
                                .Where(gu => gu.OrderIndex.HasValue)
                                .OrderBy(gu => gu.OrderIndex!.Value)
                                .ToList();
                                
                            var approvedUserIds = responses
                                .Where(r => r.IsApproved)
                                .Select(r => r.UserId)
                                .ToList();
                                
                            // Check if all users have approved
                            if (approvedUserIds.Count == orderedUsers.Count)
                            {
                                approvalWriting.Status = ApprovalStatus.Accepted;
                                approvalCompleted = true;
                            }
                            else
                                approvalWriting.Status = ApprovalStatus.InProgress;
                            break;
                    }
                }
            }
            
            await _context.SaveChangesAsync();

            // For sequential approval, check if we need to auto-approve the next user (if they are the original requester)
            if (approvalWriting.ApprovatorsGroupId.HasValue && isApproved && !approvalCompleted)
            {
                var group = await _context.ApprovatorsGroups
                    .Include(g => g.ApprovatorsGroupUsers)
                    .FirstOrDefaultAsync(g => g.Id == approvalWriting.ApprovatorsGroupId.Value);
                    
                if (group != null)
                {
                    var rule = await _context.ApprovatorsGroupRules
                        .FirstOrDefaultAsync(r => r.GroupId == group.Id);
                        
                    if (rule != null && rule.RuleType == RuleType.Sequential)
                    {
                        // Get all current responses
                        var allResponses = await _context.ApprovalResponses
                            .Where(r => r.ApprovalWritingId == approvalWritingId)
                            .ToListAsync();
                            
                        var respondedUserIds = allResponses.Select(r => r.UserId).ToList();
                        
                        // Get ordered users in the group
                        var orderedUsers = group.ApprovatorsGroupUsers
                            .OrderBy(gu => gu.OrderIndex ?? 0)
                            .ToList();
                            
                        // Find the next user in sequence who hasn't responded
                        var nextUser = orderedUsers
                            .FirstOrDefault(gu => !respondedUserIds.Contains(gu.UserId));
                            
                        if (nextUser != null)
                        {
                            // Check if the next user is the original requester (ProcessedByUserId)
                            if (nextUser.UserId == approvalWriting.ProcessedByUserId)
                            {
                                Console.WriteLine($"Auto-approving original requester {nextUser.UserId} as it's their turn in sequence");
                                
                                // Auto-approve the original requester
                                var autoApprovalResponse = new ApprovalResponse
                                {
                                    ApprovalWritingId = approvalWritingId,
                                    UserId = nextUser.UserId,
                                    IsApproved = true,
                                    Comments = "Auto-approved as original requester when their turn arrived in sequence",
                                    ResponseDate = DateTime.UtcNow
                                };
                                
                                _context.ApprovalResponses.Add(autoApprovalResponse);
                                
                                // Check if this completes all approvals
                                var updatedResponses = allResponses.ToList();
                                updatedResponses.Add(autoApprovalResponse);
                                
                                var approvedUserIds = updatedResponses
                                    .Where(r => r.IsApproved)
                                    .Select(r => r.UserId)
                                    .ToList();
                                    
                                if (approvedUserIds.Count == orderedUsers.Count)
                                {
                                    approvalWriting.Status = ApprovalStatus.Accepted;
                                    approvalCompleted = true;
                                    Console.WriteLine($"Sequential approval completed after auto-approving requester");
                                }
                                
                                await _context.SaveChangesAsync();
                            }
                        }
                    }
                }
            }

            // If approval is completed and approved, move the document to the next status
            if (approvalCompleted && approvalWriting.Status == ApprovalStatus.Accepted && 
                approvalWriting.Document != null && approvalWriting.Step != null)
            {
                // Get the target status (next status) from the step
                int targetStatusId = approvalWriting.Step.NextStatusId;
                
                // Move the document to the next status
                await MoveToNextStatusAsync(
                    approvalWriting.DocumentId, 
                    targetStatusId,
                    userId, 
                    $"Automatically moved to next status after approval: {comments}");
            }
            
            return approvalWriting.Status == ApprovalStatus.Accepted;
        }

        /// <summary>
        /// Checks if a document can move to the next status based on approval status
        /// </summary>
        public async Task<bool> CanMoveToNextStatusAsync(int documentId, int stepId)
        {
            var step = await _context.Steps.FindAsync(stepId);
            if (step == null)
                throw new KeyNotFoundException("Step not found");
                
            if (!step.RequiresApproval)
                return true;
                
            // Check if there's an approval and if it's accepted
            var approvalWriting = await _context.ApprovalWritings
                .OrderByDescending(aw => aw.CreatedAt)
                .FirstOrDefaultAsync(aw => 
                    aw.DocumentId == documentId && 
                    aw.StepId == stepId);
                    
            if (approvalWriting == null)
                return false;
                
            return approvalWriting.Status == ApprovalStatus.Accepted;
        }

        /// <summary>
        /// Checks if a direct transition to a specific status is allowed
        /// </summary>
        public async Task<bool> CanMoveToStatusAsync(int documentId, int targetStatusId)
        {
            var document = await _context.Documents
                .Include(d => d.CurrentStatus)
                .Include(d => d.Circuit)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            if (document.CircuitId == null)
                throw new InvalidOperationException("Document is not assigned to a circuit");

            if (document.CurrentStatusId == null)
                throw new InvalidOperationException("Document does not have a current status");

            // Special case: if the target status is the same as the current status, allow it
            if (document.CurrentStatusId == targetStatusId)
                return true;

            // Get target status
            var targetStatus = await _context.Status.FindAsync(targetStatusId);
            if (targetStatus == null)
                throw new KeyNotFoundException("Target status not found");

            // Check if the target status belongs to the document's circuit
            if (targetStatus.CircuitId != document.CircuitId)
                return false;

            // Check if the circuit allows backtracking
            if (document.Circuit.AllowBacktrack)
            {
                return true; // If backtracking is allowed, any status in the circuit is valid
            }

            // If the target status is a "flexible" status, it can be accessed from any other status
            if (targetStatus.IsFlexible)
                return true;

            // Check if there is a step that allows transitioning from current to target status
            var step = await _context.Steps
                .FirstOrDefaultAsync(s => 
                    s.CircuitId == document.CircuitId && 
                    s.CurrentStatusId == document.CurrentStatusId && 
                    s.NextStatusId == targetStatusId);

            return step != null;
        }

        /// <summary>
        /// Moves a document to the next status if allowed
        /// </summary>
        public async Task<bool> MoveToNextStatusAsync(int documentId, int targetStatusId, int userId, string comments)
        {
            var document = await _context.Documents
                .Include(d => d.CurrentStatus)
                .Include(d => d.CurrentStep)
                .Include(d => d.Circuit)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            if (document.CircuitId == null)
                throw new InvalidOperationException("Document is not assigned to a circuit");

            if (document.CurrentStatusId == null)
                throw new InvalidOperationException("Document does not have a current status");

            // Get the target status
            var targetStatus = await _context.Status.FindAsync(targetStatusId);
            if (targetStatus == null)
                throw new KeyNotFoundException("Target status not found");

            // Check if the target status belongs to the document's circuit
            if (targetStatus.CircuitId != document.CircuitId)
                throw new InvalidOperationException("Target status does not belong to the document's circuit");

            // Find the step for transitioning from current status to target status
            var step = await _context.Steps
                .FirstOrDefaultAsync(s => 
                    s.CircuitId == document.CircuitId && 
                    s.CurrentStatusId == document.CurrentStatusId && 
                    s.NextStatusId == targetStatusId);

            // If no direct step exists, check if it's a flexible status or if backtracking is allowed
            bool isSpecialTransition = false;
            if (step == null)
            {
                if (targetStatus.IsFlexible || document.Circuit.AllowBacktrack)
                {
                    isSpecialTransition = true;
                }
                else
                {
                    throw new InvalidOperationException("Invalid status transition");
                }
            }

            // Check if step requires approval
            if (!isSpecialTransition && step != null && step.RequiresApproval)
            {
                // First check if there's an existing approved approval writing
                var existingApproval = await _context.ApprovalWritings
                    .OrderByDescending(aw => aw.CreatedAt)
                    .FirstOrDefaultAsync(aw => 
                        aw.DocumentId == documentId && 
                        aw.StepId == step.Id);
                
                // If there's an existing approval that's not accepted, we can't proceed
                if (existingApproval != null && existingApproval.Status != ApprovalStatus.Accepted)
                {
                    return false;
                }
                
                // If there's no existing approval at all, or the most recent one isn't for the current step
                if (existingApproval == null)
                {
                    // Get user information for auto-approval check
                    var user = await _context.Users.FindAsync(userId);
                    if (user == null)
                        throw new KeyNotFoundException("User not found");
                    
                    bool isAutoApproved = false;
                    
                    // Check if this is a single approver setup
                    if (step.ApprovatorId.HasValue)
                    {
                        var approvator = await _context.Approvators
                            .FirstOrDefaultAsync(a => a.Id == step.ApprovatorId.Value);
                            
                        if (approvator != null && approvator.UserId == userId)
                        {
                            // The user is the approver - auto-approve
                            isAutoApproved = true;
                        }
                    }
                    // Check if this is a group approver setup
                    else if (step.ApprovatorsGroupId.HasValue)
                    {
                        var group = await _context.ApprovatorsGroups
                            .Include(g => g.ApprovatorsGroupUsers)
                            .FirstOrDefaultAsync(g => g.Id == step.ApprovatorsGroupId.Value);
                            
                        if (group != null)
                        {
                            // Check if user is in the group
                            var groupUser = group.ApprovatorsGroupUsers
                                .FirstOrDefault(gu => gu.UserId == userId);
                                
                            if (groupUser != null)
                            {
                                // Get the group approval rule
                                var rule = await _context.ApprovatorsGroupRules
                                    .FirstOrDefaultAsync(r => r.GroupId == group.Id);
                                    
                                if (rule != null && rule.RuleType == RuleType.Any)
                                {
                                    // For 'Any' rule, a single group member's approval is sufficient
                                    isAutoApproved = true;
                                }
                            }
                        }
                    }
                    
                    if (isAutoApproved)
                    {
                        // Create pre-approved approval writing
                        var approvalWriting = new ApprovalWriting
                        {
                            DocumentId = documentId,
                            StepId = step.Id,
                            ProcessedByUserId = userId,
                            ApprovatorId = step.ApprovatorId,
                            ApprovatorsGroupId = step.ApprovatorsGroupId,
                            Status = ApprovalStatus.Accepted,
                            Comments = $"Auto-approved by initiator: {comments}",
                            CreatedAt = DateTime.UtcNow
                        };
                        
                        _context.ApprovalWritings.Add(approvalWriting);
                        
                        // Create auto-approval response
                        var approvalResponse = new ApprovalResponse
                        {
                            ApprovalWritingId = approvalWriting.Id,
                            UserId = userId,
                            IsApproved = true,
                            Comments = "Auto-approved as initiator is an eligible approver",
                            ResponseDate = DateTime.UtcNow
                        };
                        
                        _context.ApprovalResponses.Add(approvalResponse);
                        
                        // Save the approval records - we'll continue with the document movement
                        // since it's auto-approved
                        await _context.SaveChangesAsync();
                    }
                    else
                    {
                        // Initiate normal approval process
                        var (requiresApproval, approvalWritingId) = await InitiateApprovalIfRequiredAsync(
                            documentId, step.Id, userId, comments);

                        if (requiresApproval)
                        {
                            var approvalWriting = await _context.ApprovalWritings.FindAsync(approvalWritingId);
                            if (approvalWriting == null || approvalWriting.Status != ApprovalStatus.Accepted)
                            {
                                // Approval not yet granted - return false to indicate transition is pending
                                return false;
                            }
                        }
                    }
                }
            }

            // Update the document status
            document.CurrentStatusId = targetStatusId;
            document.CurrentStepId = isSpecialTransition ? null : step?.Id;
            document.UpdatedAt = DateTime.UtcNow;
            document.UpdatedByUserId = userId; // Track who moved the document to the next status

            // Mark the status as complete in DocumentStatus
            var documentStatus = await _context.DocumentStatus
                .FirstOrDefaultAsync(ds => ds.DocumentId == documentId && ds.StatusId == targetStatusId);

            if (documentStatus != null)
            {
                documentStatus.IsComplete = true;
                documentStatus.CompletedByUserId = userId;
                documentStatus.CompletedAt = DateTime.UtcNow;
            }

            // Check if the target status is final and mark document as circuit completed
            if (targetStatus.IsFinal)
            {
                document.IsCircuitCompleted = true;
                document.Status = 2; // Completed status
                document.UpdatedAt = DateTime.UtcNow;
                document.UpdatedByUserId = userId; // Track who completed the circuit
                
                // Trigger ERP archival asynchronously
                _ = Task.Run(async () =>
                {
                    try
                    {
                        _logger.LogInformation("Document {DocumentId} reached final status. Triggering ERP archival.", documentId);
                        var archivalSuccess = await _erpArchivalService.ArchiveDocumentToErpAsync(documentId);
                        
                        if (archivalSuccess)
                        {
                            _logger.LogInformation("Document {DocumentId} successfully archived to ERP", documentId);
                        }
                        else
                        {
                            _logger.LogWarning("Failed to archive document {DocumentId} to ERP", documentId);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error during ERP archival for document {DocumentId}: {Error}", documentId, ex.Message);
                    }
                });
            }

            // Create history entry
            var history = new DocumentCircuitHistory
            {
                DocumentId = documentId,
                StepId = isSpecialTransition ? null : step?.Id,
                StatusId = targetStatusId,
                ProcessedByUserId = userId,
                ProcessedAt = DateTime.UtcNow,
                Comments = comments,
                IsApproved = true
            };

            _context.DocumentCircuitHistory.Add(history);

            // If it's not a special transition, create a step history entry
            if (!isSpecialTransition && step != null)
            {
                var stepHistory = new DocumentStepHistory
                {
                    DocumentId = documentId,
                    StepId = step.Id,
                    UserId = userId,
                    TransitionDate = DateTime.UtcNow,
                    Comments = comments
                };

                _context.DocumentStepHistory.Add(stepHistory);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Returns a document to a previous status
        /// </summary>
        public async Task<bool> ReturnToPreviousStatusAsync(int documentId, int targetStatusId, int userId, string comments)
        {
            var document = await _context.Documents
                .Include(d => d.Circuit)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            if (document.CircuitId == null)
                throw new InvalidOperationException("Document is not assigned to a circuit");

            // Check if the circuit allows backtracking
            var circuit = await _context.Circuits.FindAsync(document.CircuitId);
            if (circuit == null)
                throw new KeyNotFoundException("Circuit not found");

            if (!circuit.AllowBacktrack)
                throw new InvalidOperationException("This circuit does not allow backtracking");

            // Get the target status
            var targetStatus = await _context.Status.FindAsync(targetStatusId);
            if (targetStatus == null)
                throw new KeyNotFoundException("Target status not found");

            // Check if the target status belongs to the document's circuit
            if (targetStatus.CircuitId != document.CircuitId)
                throw new InvalidOperationException("Target status does not belong to the document's circuit");

            // Update document
            document.CurrentStatusId = targetStatusId;
            document.CurrentStepId = null; // Reset step when backtracking
            document.UpdatedAt = DateTime.UtcNow;
            document.UpdatedByUserId = userId; // Track who returned the document to previous status
            document.IsCircuitCompleted = false; // Reopen the document if it was completed
            document.Status = 1; // In Progress

            // Create history entry
            var history = new DocumentCircuitHistory
            {
                DocumentId = documentId,
                StatusId = targetStatusId,
                ProcessedByUserId = userId,
                ProcessedAt = DateTime.UtcNow,
                Comments = comments,
                IsApproved = true
            };

            _context.DocumentCircuitHistory.Add(history);

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Returns a document to its most recent previous status
        /// </summary>
        public async Task<bool> ReturnToPreviousStatusAsync(int documentId, int userId, string comments)
        {
            var document = await _context.Documents
                .Include(d => d.Circuit)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            if (document.CircuitId == null)
                throw new InvalidOperationException("Document is not assigned to a circuit");

            // Check if the circuit allows backtracking
            var circuit = await _context.Circuits.FindAsync(document.CircuitId);
            if (circuit == null)
                throw new KeyNotFoundException("Circuit not found");

            if (!circuit.AllowBacktrack)
                throw new InvalidOperationException("This circuit does not allow backtracking");

            // Get the previous status from the document history
            var previousHistory = await _context.DocumentCircuitHistory
                .Where(h => h.DocumentId == documentId && h.StatusId.HasValue)
                .OrderByDescending(h => h.ProcessedAt)
                .Skip(1) // Skip the current status
                .FirstOrDefaultAsync();

            if (previousHistory == null || !previousHistory.StatusId.HasValue)
                throw new InvalidOperationException("No previous status found in the document history");

            return await ReturnToPreviousStatusAsync(documentId, previousHistory.StatusId.Value, userId, comments);
        }

        /// <summary>
        /// Updates a document's status completion flag
        /// </summary>
        public async Task<bool> CompleteDocumentStatusAsync(
            int documentId, int statusId, int userId, bool isComplete, string comments)
        {
            var documentStatus = await _context.DocumentStatus
                .Include(ds => ds.Status)
                .FirstOrDefaultAsync(ds => ds.DocumentId == documentId && ds.StatusId == statusId);

            if (documentStatus == null)
                throw new KeyNotFoundException("Document status not found");

            // Get the document to potentially update circuit completion
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            // Update completion status
            documentStatus.IsComplete = isComplete;
            
            if (isComplete)
            {
                documentStatus.CompletedByUserId = userId;
                documentStatus.CompletedAt = DateTime.UtcNow;

                // Check if this is a final status being completed
                if (documentStatus.Status?.IsFinal == true)
                {
                    document.IsCircuitCompleted = true;
                    document.Status = 2; // Completed status
                    document.UpdatedAt = DateTime.UtcNow;
                    document.UpdatedByUserId = userId; // Track who completed the circuit
                    
                    // Trigger ERP archival asynchronously
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            _logger.LogInformation("Document {DocumentId} final status completed. Triggering ERP archival.", documentId);
                            var archivalSuccess = await _erpArchivalService.ArchiveDocumentToErpAsync(documentId);
                            
                            if (archivalSuccess)
                            {
                                _logger.LogInformation("Document {DocumentId} successfully archived to ERP", documentId);
                            }
                            else
                            {
                                _logger.LogWarning("Failed to archive document {DocumentId} to ERP", documentId);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error during ERP archival for document {DocumentId}: {Error}", documentId, ex.Message);
                        }
                    });
                }
            }
            else
            {
                documentStatus.CompletedByUserId = null;
                documentStatus.CompletedAt = null;

                // If uncompleting a final status, reopen the circuit
                if (documentStatus.Status?.IsFinal == true)
                {
                    document.IsCircuitCompleted = false;
                    document.Status = 1; // In Progress
                    document.UpdatedAt = DateTime.UtcNow;
                    document.UpdatedByUserId = userId; // Track who reopened the circuit
                }
            }

            // Create history entry
            var history = new DocumentCircuitHistory
            {
                DocumentId = documentId,
                StatusId = statusId,
                ProcessedByUserId = userId,
                ProcessedAt = DateTime.UtcNow,
                Comments = comments,
                IsApproved = isComplete
            };

            _context.DocumentCircuitHistory.Add(history);

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Gets the available transitions for a document
        /// </summary>
        public async Task<List<StatusDto>> GetAvailableTransitionsAsync(int documentId)
        {
            var document = await _context.Documents
                .Include(d => d.CurrentStatus)
                .Include(d => d.Circuit)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            if (document.CircuitId == null)
                throw new InvalidOperationException("Document is not assigned to a circuit");

            if (document.CurrentStatusId == null)
                throw new InvalidOperationException("Document does not have a current status");

            var availableStatuses = new List<StatusDto>();

            // Get the circuit
            var circuit = await _context.Circuits.FindAsync(document.CircuitId);
            if (circuit == null)
                throw new KeyNotFoundException("Circuit not found");

            // If backtracking is allowed, all statuses in the circuit are available
            if (circuit.AllowBacktrack)
            {
                var allStatuses = await _context.Status
                    .Where(s => s.CircuitId == document.CircuitId)
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

                return allStatuses;
            }

            // Get all flexible statuses
            var flexibleStatuses = await _context.Status
                .Where(s => s.CircuitId == document.CircuitId && s.IsFlexible)
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

            availableStatuses.AddRange(flexibleStatuses);

            // Get next statuses from available steps
            var nextStatuses = await _context.Steps
                .Where(s => s.CircuitId == document.CircuitId && s.CurrentStatusId == document.CurrentStatusId)
                .Include(s => s.NextStatus)
                .Select(s => new StatusDto
                {
                    StatusId = s.NextStatus!.Id,
                    StatusKey = s.NextStatus.StatusKey,
                    Title = s.NextStatus.Title,
                    Description = s.NextStatus.Description,
                    IsRequired = s.NextStatus.IsRequired,
                    IsInitial = s.NextStatus.IsInitial,
                    IsFinal = s.NextStatus.IsFinal,
                    IsFlexible = s.NextStatus.IsFlexible,
                    CircuitId = s.NextStatus.CircuitId
                })
                .ToListAsync();

            // Add next statuses and remove duplicates
            foreach (var status in nextStatuses)
            {
                if (!availableStatuses.Any(s => s.StatusId == status.StatusId))
                {
                    availableStatuses.Add(status);
                }
            }

            return availableStatuses;
        }

        /// <summary>
        /// Gets the workflow status of a document
        /// </summary>
        public async Task<DocumentWorkflowStatusDto> GetDocumentWorkflowStatusAsync(int documentId)
        {
            var document = await _context.Documents
                .Include(d => d.Circuit)
                .Include(d => d.CurrentStatus)
                .Include(d => d.CurrentStep)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            if (document.CircuitId == null)
                throw new InvalidOperationException("Document is not assigned to a circuit");

            // Get statuses for this document
            var documentStatuses = await _context.DocumentStatus
                .Include(ds => ds.Status)
                .Include(ds => ds.CompletedBy)
                .Where(ds => ds.DocumentId == documentId)
                .ToListAsync();

            // Get steps with their status (completed or current)
            var docStepHistory = await _context.DocumentStepHistory
                .Include(dsh => dsh.Step)
                .Include(dsh => dsh.User)
                .Where(dsh => dsh.DocumentId == documentId)
                .OrderByDescending(dsh => dsh.TransitionDate)
                .ToListAsync();

            var workflowStatus = new DocumentWorkflowStatusDto
            {
                DocumentId = document.Id,
                DocumentKey = document.DocumentKey,
                DocumentTitle = document.Title,
                CircuitId = document.CircuitId.Value,
                CircuitTitle = document.Circuit?.Title ?? string.Empty,
                CurrentStatusId = document.CurrentStatusId,
                CurrentStatusTitle = document.CurrentStatus?.Title ?? string.Empty,
                CurrentStepId = document.CurrentStepId,
                CurrentStepTitle = document.CurrentStep?.Title ?? string.Empty,
                IsCircuitCompleted = document.IsCircuitCompleted,
                Statuses = documentStatuses.Select(ds => new DocumentStatusItemDto
                {
                    StatusId = ds.StatusId,
                    Title = ds.Status?.Title ?? string.Empty,
                    IsRequired = ds.Status?.IsRequired ?? false,
                    IsComplete = ds.IsComplete,
                    CompletedBy = ds.CompletedBy?.Username,
                    CompletedAt = ds.CompletedAt
                }).ToList(),
                StepHistory = docStepHistory.Select(dsh => new DocumentStepHistoryItemDto
                {
                    StepId = dsh.StepId,
                    Title = dsh.Step?.Title ?? string.Empty,
                    TransitionDate = dsh.TransitionDate,
                    UserId = dsh.UserId,
                    Username = dsh.User?.Username ?? string.Empty,
                    Comments = dsh.Comments
                }).ToList()
            };

            // Calculate progress percentage
            int totalRequiredStatuses = documentStatuses.Count(ds => ds.Status?.IsRequired ?? false);
            int completedRequiredStatuses = documentStatuses.Count(ds => 
                (ds.Status?.IsRequired ?? false) && ds.IsComplete);

            if (totalRequiredStatuses > 0)
            {
                workflowStatus.ProgressPercentage = (int)((float)completedRequiredStatuses / totalRequiredStatuses * 100);
            }
            else
            {
                workflowStatus.ProgressPercentage = document.IsCircuitCompleted ? 100 : 0;
            }

            return workflowStatus;
        }

        /// <summary>
        /// Reinitializes a document's workflow
        /// </summary>
        public async Task<bool> ReinitializeWorkflowAsync(int documentId, int userId, string comments)
        {
            var document = await _context.Documents
                .Include(d => d.Circuit)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                throw new KeyNotFoundException("Document not found");

            if (document.CircuitId == null)
                throw new InvalidOperationException("Document is not assigned to a circuit");

            // Get the initial status for this circuit
            var initialStatus = await _context.Status
                .FirstOrDefaultAsync(s => s.CircuitId == document.CircuitId && s.IsInitial);

            if (initialStatus == null)
                throw new InvalidOperationException("Circuit does not have an initial status defined");

            // Update document
            document.CurrentStatusId = initialStatus.Id;
            document.CurrentStepId = null;
            document.IsCircuitCompleted = false;
            document.Status = 1; // In Progress
            document.UpdatedAt = DateTime.UtcNow;
            document.UpdatedByUserId = userId; // Track who reinitialized the workflow

            // Reset all status completions
            var documentStatuses = await _context.DocumentStatus
                .Where(ds => ds.DocumentId == documentId)
                .ToListAsync();

            foreach (var status in documentStatuses)
            {
                status.IsComplete = false;
                status.CompletedByUserId = null;
                status.CompletedAt = null;
            }

            // Mark the initial status as complete
            var initialDocumentStatus = documentStatuses
                .FirstOrDefault(ds => ds.StatusId == initialStatus.Id);

            if (initialDocumentStatus != null)
            {
                initialDocumentStatus.IsComplete = true;
                initialDocumentStatus.CompletedByUserId = userId;
                initialDocumentStatus.CompletedAt = DateTime.UtcNow;
            }

            // Create history entry
            var history = new DocumentCircuitHistory
            {
                DocumentId = documentId,
                StatusId = initialStatus.Id,
                ProcessedByUserId = userId,
                ProcessedAt = DateTime.UtcNow,
                Comments = $"Workflow reinitialized: {comments}",
                IsApproved = true
            };

            _context.DocumentCircuitHistory.Add(history);

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Deletes multiple documents efficiently with proper counter management
        /// </summary>
        public async Task<(int SuccessCount, List<int> FailedIds)> DeleteMultipleDocumentsAsync(List<int> documentIds)
        {
            var successCount = 0;
            var failedIds = new List<int>();

            if (!documentIds.Any())
                return (0, failedIds);

            // Use a single transaction for all deletions to prevent counter inconsistencies
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Get all documents to delete and group by TypeId for efficient counter updates
                var documentsToDelete = await _context.Documents
                    .Where(d => documentIds.Contains(d.Id))
                    .Select(d => new { d.Id, d.TypeId })
                    .ToListAsync();

                if (!documentsToDelete.Any())
                {
                    await transaction.RollbackAsync();
                    return (0, documentIds);
                }

                // Group documents by TypeId to batch counter updates
                var documentsByType = documentsToDelete.GroupBy(d => d.TypeId);

                // Update document type counters in batch
                foreach (var typeGroup in documentsByType)
                {
                    var typeId = typeGroup.Key;
                    var documentsCount = typeGroup.Count();
                    
                    var docType = await _context.DocumentTypes.FindAsync(typeId);
                    if (docType != null)
                    {
                        // Ensure counter doesn't go negative
                        docType.DocumentCounter = Math.Max(0, docType.DocumentCounter - documentsCount);
                    }
                }

                // Delete all related records for these documents
                var documentIdsArray = documentsToDelete.Select(d => d.Id).ToArray();

                // Delete document statuses
                var documentStatuses = await _context.DocumentStatus
                    .Where(ds => documentIdsArray.Contains(ds.DocumentId))
                    .ToListAsync();
                _context.DocumentStatus.RemoveRange(documentStatuses);

                // Delete circuit history
                var circuitHistory = await _context.DocumentCircuitHistory
                    .Where(h => documentIdsArray.Contains(h.DocumentId))
                    .ToListAsync();
                _context.DocumentCircuitHistory.RemoveRange(circuitHistory);

                // Delete step history
                var stepHistory = await _context.DocumentStepHistory
                    .Where(h => documentIdsArray.Contains(h.DocumentId))
                    .ToListAsync();
                _context.DocumentStepHistory.RemoveRange(stepHistory);

                // Delete approval writings and responses
                var approvalWritings = await _context.ApprovalWritings
                    .Where(aw => documentIdsArray.Contains(aw.DocumentId))
                    .ToListAsync();
                
                if (approvalWritings.Any())
                {
                    var writingIds = approvalWritings.Select(aw => aw.Id).ToArray();
                    var responses = await _context.ApprovalResponses
                        .Where(ar => writingIds.Contains(ar.ApprovalWritingId))
                        .ToListAsync();
                    _context.ApprovalResponses.RemoveRange(responses);
                    _context.ApprovalWritings.RemoveRange(approvalWritings);
                }

                // Delete sous lignes
                var ligneIds = await _context.Lignes
                    .Where(l => documentIdsArray.Contains(l.DocumentId))
                    .Select(l => l.Id)
                    .ToArrayAsync();

                if (ligneIds.Any())
                {
                    var sousLignes = await _context.SousLignes
                        .Where(sl => ligneIds.Contains(sl.LigneId))
                        .ToListAsync();
                    _context.SousLignes.RemoveRange(sousLignes);
                }

                // Delete lignes
                var lignes = await _context.Lignes
                    .Where(l => documentIdsArray.Contains(l.DocumentId))
                    .ToListAsync();
                _context.Lignes.RemoveRange(lignes);

                // Delete the documents
                var documents = await _context.Documents
                    .Where(d => documentIdsArray.Contains(d.Id))
                    .ToListAsync();
                _context.Documents.RemoveRange(documents);
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                successCount = documents.Count;
                
                // Identify any documents that weren't found
                var foundIds = documents.Select(d => d.Id).ToHashSet();
                failedIds = documentIds.Where(id => !foundIds.Contains(id)).ToList();
                
                return (successCount, failedIds);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                
                // If bulk operation fails, try individual deletions as fallback
                foreach (var docId in documentIds)
                {
                    try
                    {
                        var success = await DeleteDocumentAsync(docId);
                        if (success)
                            successCount++;
                        else
                            failedIds.Add(docId);
                    }
                    catch
                    {
                        failedIds.Add(docId);
                    }
                }
                
                return (successCount, failedIds);
            }
        }

        /// <summary>
        /// Deletes a document and all related records
        /// </summary>
        public async Task<bool> DeleteDocumentAsync(int documentId)
        {
            // Use a transaction to ensure data consistency
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Get the document first to access its TypeId for counter decrement
                var document = await _context.Documents.FindAsync(documentId);
                if (document == null)
                    return false; // Document not found
                
                // Update the document type counter first (within transaction)
                // Refresh the entity to get the latest counter value to prevent lost updates
                var type = await _context.DocumentTypes.FindAsync(document.TypeId);
                if (type != null)
                {
                    // Refresh the entity to get the latest value from database
                    await _context.Entry(type).ReloadAsync();
                    
                    if (type.DocumentCounter > 0)
                    {
                        type.DocumentCounter--;
                    }
                }

                // Delete document status records
                var documentStatuses = await _context.DocumentStatus
                    .Where(ds => ds.DocumentId == documentId)
                    .ToListAsync();
                _context.DocumentStatus.RemoveRange(documentStatuses);

                // Delete circuit history
                var circuitHistory = await _context.DocumentCircuitHistory
                    .Where(h => h.DocumentId == documentId)
                    .ToListAsync();
                _context.DocumentCircuitHistory.RemoveRange(circuitHistory);

                // Delete step history
                var stepHistory = await _context.DocumentStepHistory
                    .Where(h => h.DocumentId == documentId)
                    .ToListAsync();
                _context.DocumentStepHistory.RemoveRange(stepHistory);

                // Delete approval writings and responses
                var approvalWritings = await _context.ApprovalWritings
                    .Where(aw => aw.DocumentId == documentId)
                    .ToListAsync();
                
                foreach (var writing in approvalWritings)
                {
                    var responses = await _context.ApprovalResponses
                        .Where(ar => ar.ApprovalWritingId == writing.Id)
                        .ToListAsync();
                    _context.ApprovalResponses.RemoveRange(responses);
                }
                
                _context.ApprovalWritings.RemoveRange(approvalWritings);

                // Delete sous lignes
                var sousLignes = await _context.SousLignes
                    .Where(sl => _context.Lignes
                        .Where(l => l.DocumentId == documentId)
                        .Select(l => l.Id)
                        .Contains(sl.LigneId))
                    .ToListAsync();
                _context.SousLignes.RemoveRange(sousLignes);

                // Delete lignes
                var lignes = await _context.Lignes
                    .Where(l => l.DocumentId == documentId)
                    .ToListAsync();
                _context.Lignes.RemoveRange(lignes);

                // Delete the document
                _context.Documents.Remove(document);
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

}