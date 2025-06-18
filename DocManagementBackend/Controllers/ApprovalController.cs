// Controllers/ApprovalController.cs
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
    public class ApprovalController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly DocumentWorkflowService _workflowService;
        private readonly UserAuthorizationService _authService;

        public ApprovalController(
            ApplicationDbContext context, 
            DocumentWorkflowService workflowService,
            UserAuthorizationService authService)
        {
            _context = context;
            _workflowService = workflowService;
            _authService = authService;
        }

        // CORE APPROVAL WORKFLOW APIS

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<PendingApprovalDto>>> GetPendingApprovals()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            // Get all pending approvals for this user
            var pendingApprovals = new List<PendingApprovalDto>();

            // 1. Get single-user approvals
            var singleApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Where(aw => 
                    aw.ApprovatorId.HasValue && 
                    aw.Status == ApprovalStatus.Open &&
                    _context.Approvators
                        .Any(a => a.Id == aw.ApprovatorId && a.UserId == userId))
                .ToListAsync();

            foreach (var approval in singleApprovals)
            {
                pendingApprovals.Add(new PendingApprovalDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = approval.DocumentId,
                    DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                    DocumentTitle = approval.Document?.Title ?? string.Empty,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    ApprovalType = "Single"
                });
            }

            // 2. Get group approvals
            var groupApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Where(aw => 
                    aw.ApprovatorsGroupId.HasValue && 
                    (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress) &&
                    _context.ApprovatorsGroupUsers
                        .Any(gu => gu.GroupId == aw.ApprovatorsGroupId && gu.UserId == userId))
                .ToListAsync();

            foreach (var approval in groupApprovals)
            {
                // Check if user has already responded
                bool hasResponded = await _context.ApprovalResponses
                    .AnyAsync(ar => ar.ApprovalWritingId == approval.Id && ar.UserId == userId);

                if (hasResponded)
                    continue;

                // For sequential rule, check if it's this user's turn
                var group = await _context.ApprovatorsGroups
                    .Include(g => g.ApprovatorsGroupUsers)
                    .FirstOrDefaultAsync(g => g.Id == approval.ApprovatorsGroupId);

                var rule = await _context.ApprovatorsGroupRules
                    .FirstOrDefaultAsync(r => r.GroupId == approval.ApprovatorsGroupId);

                if (rule?.RuleType == RuleType.Sequential && group != null)
                {
                    // Get existing responses
                    var responses = await _context.ApprovalResponses
                        .Where(r => r.ApprovalWritingId == approval.Id)
                        .ToListAsync();

                    var respondedUserIds = responses.Select(r => r.UserId).ToList();

                    // Get ordered users in the group
                    var orderedUsers = group.ApprovatorsGroupUsers
                        .Where(gu => gu.OrderIndex.HasValue)
                        .OrderBy(gu => gu.OrderIndex!.Value)
                        .ToList();

                    // If no responses yet, only first user can approve
                    if (!responses.Any() && orderedUsers.Any())
                    {
                        if (orderedUsers.First().UserId != userId)
                            continue;
                    }
                    else if (orderedUsers.Any() && respondedUserIds.Any())
                    {
                        // Find the next user in sequence
                        var highestRespondedIndex = orderedUsers
                            .Where(gu => respondedUserIds.Contains(gu.UserId))
                            .Max(gu => gu.OrderIndex!.Value);

                        var nextUser = orderedUsers
                            .FirstOrDefault(gu => gu.OrderIndex!.Value > highestRespondedIndex);

                        if (nextUser?.UserId != userId)
                            continue;
                    }
                }

                pendingApprovals.Add(new PendingApprovalDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = approval.DocumentId,
                    DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                    DocumentTitle = approval.Document?.Title ?? string.Empty,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    ApprovalType = rule?.RuleType == RuleType.Sequential ? "Sequential" :
                                 rule?.RuleType == RuleType.All ? "All" : "Any"
                });
            }

            return Ok(pendingApprovals);
        }

        [HttpGet("pending/user/{userId}")]
        public async Task<ActionResult<IEnumerable<PendingApprovalDto>>> GetPendingApprovalsByUser(int userId)
        {
            // Admin users can view pending approvals for any user
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Verify the specified user exists
            var targetUser = await _context.Users.FindAsync(userId);
            if (targetUser == null)
                return NotFound($"User with ID {userId} not found.");

            // Get all pending approvals for the specified user
            var pendingApprovals = new List<PendingApprovalDto>();

            // 1. Get single-user approvals
            var singleApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Where(aw => 
                    aw.ApprovatorId.HasValue && 
                    aw.Status == ApprovalStatus.Open &&
                    _context.Approvators
                        .Any(a => a.Id == aw.ApprovatorId && a.UserId == userId))
                .ToListAsync();

            foreach (var approval in singleApprovals)
            {
                pendingApprovals.Add(new PendingApprovalDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = approval.DocumentId,
                    DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                    DocumentTitle = approval.Document?.Title ?? string.Empty,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    ApprovalType = "Single"
                });
            }

            // 2. Get group approvals
            var groupApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Where(aw => 
                    aw.ApprovatorsGroupId.HasValue && 
                    (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress) &&
                    _context.ApprovatorsGroupUsers
                        .Any(gu => gu.GroupId == aw.ApprovatorsGroupId && gu.UserId == userId))
                .ToListAsync();

            foreach (var approval in groupApprovals)
            {
                // Check if user has already responded
                bool hasResponded = await _context.ApprovalResponses
                    .AnyAsync(ar => ar.ApprovalWritingId == approval.Id && ar.UserId == userId);

                if (hasResponded)
                    continue;

                // For sequential rule, check if it's this user's turn
                var group = await _context.ApprovatorsGroups
                    .Include(g => g.ApprovatorsGroupUsers)
                    .FirstOrDefaultAsync(g => g.Id == approval.ApprovatorsGroupId);

                var rule = await _context.ApprovatorsGroupRules
                    .FirstOrDefaultAsync(r => r.GroupId == approval.ApprovatorsGroupId);

                if (rule?.RuleType == RuleType.Sequential && group != null)
                {
                    // Get existing responses
                    var responses = await _context.ApprovalResponses
                        .Where(r => r.ApprovalWritingId == approval.Id)
                        .ToListAsync();

                    var respondedUserIds = responses.Select(r => r.UserId).ToList();

                    // Get ordered users in the group
                    var orderedUsers = group.ApprovatorsGroupUsers
                        .Where(gu => gu.OrderIndex.HasValue)
                        .OrderBy(gu => gu.OrderIndex!.Value)
                        .ToList();

                    // If no responses yet, only first user can approve
                    if (!responses.Any() && orderedUsers.Any())
                    {
                        if (orderedUsers.First().UserId != userId)
                            continue;
                    }
                    else if (orderedUsers.Any() && respondedUserIds.Any())
                    {
                        // Find the next user in sequence
                        var highestRespondedIndex = orderedUsers
                            .Where(gu => respondedUserIds.Contains(gu.UserId))
                            .Max(gu => gu.OrderIndex!.Value);

                        var nextUser = orderedUsers
                            .FirstOrDefault(gu => gu.OrderIndex!.Value > highestRespondedIndex);

                        if (nextUser?.UserId != userId)
                            continue;
                    }
                }

                pendingApprovals.Add(new PendingApprovalDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = approval.DocumentId,
                    DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                    DocumentTitle = approval.Document?.Title ?? string.Empty,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    ApprovalType = rule?.RuleType == RuleType.Sequential ? "Sequential" :
                                 rule?.RuleType == RuleType.All ? "All" : "Any"
                });
            }

            return Ok(pendingApprovals);
        }

        [HttpPost("{approvalId}/respond")]
        public async Task<IActionResult> RespondToApproval(int approvalId, [FromBody] ApprovalResponseDto response)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

            try
            {
                bool result = await _workflowService.ProcessApprovalResponseAsync(
                    approvalId, userId, response.IsApproved, response.Comments);

                return Ok(new { IsApproved = response.IsApproved, Result = result });
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

        [HttpGet("history/{documentId}")]
        public async Task<ActionResult<IEnumerable<ApprovalHistoryDto>>> GetApprovalHistory(int documentId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            // Retrieve the approval history for the document
            var histories = await _context.ApprovalWritings
                .Include(a => a.ProcessedBy)
                .Include(a => a.Step)
                .Include(a => a.Document)
                .Include(a => a.Approvator)
                .Include(a => a.ApprovatorsGroup)
                .Where(a => a.DocumentId == documentId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            var approvalHistory = new List<ApprovalHistoryDto>();

            foreach (var writing in histories)
            {
                var historyItem = new ApprovalHistoryDto
                {
                    ApprovalId = writing.Id,
                    StepTitle = writing.Step?.Title ?? string.Empty,
                    RequestedBy = writing.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = writing.CreatedAt,
                    Status = writing.Status.ToString(),
                    Comments = writing.Comments,
                    Responses = new List<ApprovalResponseHistoryDto>()
                };

                // Get responses for this approval
                var responses = await _context.ApprovalResponses
                    .Include(r => r.User)
                    .Where(r => r.ApprovalWritingId == writing.Id)
                    .OrderBy(r => r.ResponseDate)
                    .ToListAsync();

                foreach (var response in responses)
                {
                    historyItem.Responses.Add(new ApprovalResponseHistoryDto
                    {
                        ResponderName = response.User?.Username ?? string.Empty,
                        ResponseDate = response.ResponseDate,
                        IsApproved = response.IsApproved,
                        Comments = response.Comments
                    });
                }

                approvalHistory.Add(historyItem);
            }

            return Ok(approvalHistory);
        }

        [HttpGet("history/user/{userId}")]
        public async Task<ActionResult<IEnumerable<UserApprovalHistoryDto>>> GetUserApprovalHistory(int userId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Verify the specified user exists
            var targetUser = await _context.Users.FindAsync(userId);
            if (targetUser == null)
                return NotFound($"User with ID {userId} not found.");

            var userApprovalHistory = new List<UserApprovalHistoryDto>();

            // Get all approval responses by this user
            var responses = await _context.ApprovalResponses
                .Include(r => r.ApprovalWriting)
                    .ThenInclude(aw => aw.Document)
                .Include(r => r.ApprovalWriting)
                    .ThenInclude(aw => aw.Step)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.ResponseDate)
                .ToListAsync();

            foreach (var response in responses)
            {
                if (response.ApprovalWriting?.Document != null)
                {
                    userApprovalHistory.Add(new UserApprovalHistoryDto
                    {
                        ApprovalId = response.ApprovalWritingId,
                        DocumentId = response.ApprovalWriting.DocumentId,
                        DocumentKey = response.ApprovalWriting.Document.DocumentKey,
                        DocumentTitle = response.ApprovalWriting.Document.Title,
                        StepTitle = response.ApprovalWriting.Step?.Title ?? string.Empty,
                        Status = response.ApprovalWriting.Status.ToString(),
                        Approved = response.IsApproved,
                        RespondedAt = response.ResponseDate,
                        ProcessedBy = targetUser.Username,
                        Comments = response.Comments,
                        RequestedBy = response.ApprovalWriting.ProcessedBy?.Username ?? string.Empty,
                        RequestDate = response.ApprovalWriting.CreatedAt
                    });
                }
            }

            // Also get all approvals assigned to this user (including pending ones)
            var assignedApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Where(aw => 
                    (aw.ApprovatorId.HasValue && 
                     _context.Approvators.Any(a => a.Id == aw.ApprovatorId && a.UserId == userId)) ||
                    (aw.ApprovatorsGroupId.HasValue && 
                     _context.ApprovatorsGroupUsers.Any(gu => gu.GroupId == aw.ApprovatorsGroupId && gu.UserId == userId)))
                .OrderByDescending(aw => aw.CreatedAt)
                .ToListAsync();

            foreach (var approval in assignedApprovals)
            {
                // Skip if we already have a response from this user for this approval
                if (userApprovalHistory.Any(h => h.ApprovalId == approval.Id))
                    continue;

                if (approval.Document != null)
                {
                    userApprovalHistory.Add(new UserApprovalHistoryDto
                    {
                        ApprovalId = approval.Id,
                        DocumentId = approval.DocumentId,
                        DocumentKey = approval.Document.DocumentKey,
                        DocumentTitle = approval.Document.Title,
                        StepTitle = approval.Step?.Title ?? string.Empty,
                        Status = approval.Status.ToString(),
                        Approved = null, // No response yet
                        RespondedAt = null,
                        ProcessedBy = null,
                        Comments = approval.Comments,
                        RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                        RequestDate = approval.CreatedAt
                    });
                }
            }

            // Sort by date descending
            userApprovalHistory = userApprovalHistory
                .OrderByDescending(h => h.RespondedAt ?? h.RequestDate)
                .ToList();

            return Ok(userApprovalHistory);
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<UserApprovalHistoryDto>>> GetGeneralApprovalHistory()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var generalApprovalHistory = new List<UserApprovalHistoryDto>();

            // Get all approval writings (all documents, all users)
            var allApprovalWritings = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Include(aw => aw.Approvator)
                    .ThenInclude(a => a.User)
                .Include(aw => aw.ApprovatorsGroup)
                .OrderByDescending(aw => aw.CreatedAt)
                .ToListAsync();

            foreach (var approval in allApprovalWritings)
            {
                // For individual approvals
                if (approval.ApprovatorId.HasValue && approval.Approvator != null)
                {
                    // Check for responses
                    var response = await _context.ApprovalResponses
                        .Include(ar => ar.User)
                        .FirstOrDefaultAsync(ar => ar.ApprovalWritingId == approval.Id);

                    generalApprovalHistory.Add(new UserApprovalHistoryDto
                    {
                        ApprovalId = approval.Id,
                        DocumentId = approval.DocumentId,
                        DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                        DocumentTitle = approval.Document?.Title ?? string.Empty,
                        StepTitle = approval.Step?.Title ?? string.Empty,
                        Status = approval.Status.ToString(),
                        Approved = response?.IsApproved,
                        RespondedAt = response?.ResponseDate,
                        ProcessedBy = response?.User?.Username,
                        Comments = response?.Comments ?? approval.Comments,
                        RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                        RequestDate = approval.CreatedAt
                    });
                }
                // For group approvals
                else if (approval.ApprovatorsGroupId.HasValue)
                {
                    // Get all responses for this group approval
                    var responses = await _context.ApprovalResponses
                        .Include(ar => ar.User)
                        .Where(ar => ar.ApprovalWritingId == approval.Id)
                        .ToListAsync();

                    if (responses.Any())
                    {
                        // Create entries for each responder
                        foreach (var response in responses)
                        {
                            generalApprovalHistory.Add(new UserApprovalHistoryDto
                            {
                                ApprovalId = approval.Id,
                                DocumentId = approval.DocumentId,
                                DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                                DocumentTitle = approval.Document?.Title ?? string.Empty,
                                StepTitle = approval.Step?.Title ?? string.Empty,
                                Status = approval.Status.ToString(),
                                Approved = response.IsApproved,
                                RespondedAt = response.ResponseDate,
                                ProcessedBy = response.User?.Username,
                                Comments = response.Comments,
                                RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                                RequestDate = approval.CreatedAt
                            });
                        }
                    }
                    else
                    {
                        // No responses yet for group approval
                        generalApprovalHistory.Add(new UserApprovalHistoryDto
                        {
                            ApprovalId = approval.Id,
                            DocumentId = approval.DocumentId,
                            DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                            DocumentTitle = approval.Document?.Title ?? string.Empty,
                            StepTitle = approval.Step?.Title ?? string.Empty,
                            Status = approval.Status.ToString(),
                            Approved = null,
                            RespondedAt = null,
                            ProcessedBy = null,
                            Comments = approval.Comments,
                            RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                            RequestDate = approval.CreatedAt
                        });
                    }
                }
            }

            return Ok(generalApprovalHistory);
        }

        [HttpGet("history/waiting")]
        public async Task<ActionResult<IEnumerable<ApprovalHistoryDetailDto>>> GetWaitingApprovals()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var waitingApprovals = new List<ApprovalHistoryDetailDto>();

            // Get all approval writings with status Open or InProgress
            var approvalWritings = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Include(aw => aw.Approvator)
                    .ThenInclude(a => a.User)
                .Include(aw => aw.ApprovatorsGroup)
                .Where(aw => aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress)
                .OrderByDescending(aw => aw.CreatedAt)
                .ToListAsync();

            foreach (var approval in approvalWritings)
            {
                var approvalDetail = new ApprovalHistoryDetailDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = approval.DocumentId,
                    DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                    DocumentTitle = approval.Document?.Title ?? string.Empty,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    Status = approval.Status.ToString(),
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    Approvers = new List<ApproverDetailDto>(),
                    Responses = new List<ApprovalResponseDetailDto>()
                };

                // Add approver information
                if (approval.ApprovatorId.HasValue && approval.Approvator?.User != null)
                {
                    approvalDetail.Approvers.Add(new ApproverDetailDto
                    {
                        UserId = approval.Approvator.User.Id,
                        Username = approval.Approvator.User.Username,
                        Type = "Individual"
                    });
                }
                else if (approval.ApprovatorsGroupId.HasValue)
                {
                    var groupUsers = await _context.ApprovatorsGroupUsers
                        .Include(gu => gu.User)
                        .Where(gu => gu.GroupId == approval.ApprovatorsGroupId)
                        .OrderBy(gu => gu.OrderIndex ?? 0)
                        .ToListAsync();

                    foreach (var groupUser in groupUsers)
                    {
                        if (groupUser.User != null)
                        {
                            approvalDetail.Approvers.Add(new ApproverDetailDto
                            {
                                UserId = groupUser.User.Id,
                                Username = groupUser.User.Username,
                                Type = "Group",
                                OrderIndex = groupUser.OrderIndex
                            });
                        }
                    }
                }

                // Add response information (for InProgress status)
                if (approval.Status == ApprovalStatus.InProgress)
                {
                    var responses = await _context.ApprovalResponses
                        .Include(ar => ar.User)
                        .Where(ar => ar.ApprovalWritingId == approval.Id)
                        .OrderBy(ar => ar.ResponseDate)
                        .ToListAsync();

                    foreach (var response in responses)
                    {
                        if (response.User != null)
                        {
                            approvalDetail.Responses.Add(new ApprovalResponseDetailDto
                            {
                                UserId = response.User.Id,
                                Username = response.User.Username,
                                IsApproved = response.IsApproved,
                                ResponseDate = response.ResponseDate,
                                Comments = response.Comments
                            });
                        }
                    }
                }

                waitingApprovals.Add(approvalDetail);
            }

            return Ok(waitingApprovals);
        }

        [HttpGet("history/accepted")]
        public async Task<ActionResult<IEnumerable<ApprovalHistoryDetailDto>>> GetAcceptedApprovals()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var acceptedApprovals = new List<ApprovalHistoryDetailDto>();

            // Get all approval writings with status Accepted
            var approvalWritings = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Include(aw => aw.Approvator)
                    .ThenInclude(a => a.User)
                .Include(aw => aw.ApprovatorsGroup)
                .Where(aw => aw.Status == ApprovalStatus.Accepted)
                .OrderByDescending(aw => aw.CreatedAt)
                .ToListAsync();

            foreach (var approval in approvalWritings)
            {
                var approvalDetail = new ApprovalHistoryDetailDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = approval.DocumentId,
                    DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                    DocumentTitle = approval.Document?.Title ?? string.Empty,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    Status = approval.Status.ToString(),
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    Approvers = new List<ApproverDetailDto>(),
                    Responses = new List<ApprovalResponseDetailDto>()
                };

                // Add approver information
                if (approval.ApprovatorId.HasValue && approval.Approvator?.User != null)
                {
                    approvalDetail.Approvers.Add(new ApproverDetailDto
                    {
                        UserId = approval.Approvator.User.Id,
                        Username = approval.Approvator.User.Username,
                        Type = "Individual"
                    });
                }
                else if (approval.ApprovatorsGroupId.HasValue)
                {
                    var groupUsers = await _context.ApprovatorsGroupUsers
                        .Include(gu => gu.User)
                        .Where(gu => gu.GroupId == approval.ApprovatorsGroupId)
                        .OrderBy(gu => gu.OrderIndex ?? 0)
                        .ToListAsync();

                    foreach (var groupUser in groupUsers)
                    {
                        if (groupUser.User != null)
                        {
                            approvalDetail.Approvers.Add(new ApproverDetailDto
                            {
                                UserId = groupUser.User.Id,
                                Username = groupUser.User.Username,
                                Type = "Group",
                                OrderIndex = groupUser.OrderIndex
                            });
                        }
                    }
                }

                // Add response information (who approved)
                var responses = await _context.ApprovalResponses
                    .Include(ar => ar.User)
                    .Where(ar => ar.ApprovalWritingId == approval.Id)
                    .OrderBy(ar => ar.ResponseDate)
                    .ToListAsync();

                foreach (var response in responses)
                {
                    if (response.User != null)
                    {
                        approvalDetail.Responses.Add(new ApprovalResponseDetailDto
                        {
                            UserId = response.User.Id,
                            Username = response.User.Username,
                            IsApproved = response.IsApproved,
                            ResponseDate = response.ResponseDate,
                            Comments = response.Comments
                        });
                    }
                }

                acceptedApprovals.Add(approvalDetail);
            }

            return Ok(acceptedApprovals);
        }

        [HttpGet("history/rejected")]
        public async Task<ActionResult<IEnumerable<ApprovalHistoryDetailDto>>> GetRejectedApprovals()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var rejectedApprovals = new List<ApprovalHistoryDetailDto>();

            // Get all approval writings with status Rejected
            var approvalWritings = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Include(aw => aw.Approvator)
                    .ThenInclude(a => a.User)
                .Include(aw => aw.ApprovatorsGroup)
                .Where(aw => aw.Status == ApprovalStatus.Rejected)
                .OrderByDescending(aw => aw.CreatedAt)
                .ToListAsync();

            foreach (var approval in approvalWritings)
            {
                var approvalDetail = new ApprovalHistoryDetailDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = approval.DocumentId,
                    DocumentKey = approval.Document?.DocumentKey ?? string.Empty,
                    DocumentTitle = approval.Document?.Title ?? string.Empty,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    Status = approval.Status.ToString(),
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    Approvers = new List<ApproverDetailDto>(),
                    Responses = new List<ApprovalResponseDetailDto>()
                };

                // Add approver information
                if (approval.ApprovatorId.HasValue && approval.Approvator?.User != null)
                {
                    approvalDetail.Approvers.Add(new ApproverDetailDto
                    {
                        UserId = approval.Approvator.User.Id,
                        Username = approval.Approvator.User.Username,
                        Type = "Individual"
                    });
                }
                else if (approval.ApprovatorsGroupId.HasValue)
                {
                    var groupUsers = await _context.ApprovatorsGroupUsers
                        .Include(gu => gu.User)
                        .Where(gu => gu.GroupId == approval.ApprovatorsGroupId)
                        .OrderBy(gu => gu.OrderIndex ?? 0)
                        .ToListAsync();

                    foreach (var groupUser in groupUsers)
                    {
                        if (groupUser.User != null)
                        {
                            approvalDetail.Approvers.Add(new ApproverDetailDto
                            {
                                UserId = groupUser.User.Id,
                                Username = groupUser.User.Username,
                                Type = "Group",
                                OrderIndex = groupUser.OrderIndex
                            });
                        }
                    }
                }

                // Add response information (both approved and rejected responses)
                var responses = await _context.ApprovalResponses
                    .Include(ar => ar.User)
                    .Where(ar => ar.ApprovalWritingId == approval.Id)
                    .OrderBy(ar => ar.ResponseDate)
                    .ToListAsync();

                foreach (var response in responses)
                {
                    if (response.User != null)
                    {
                        approvalDetail.Responses.Add(new ApprovalResponseDetailDto
                        {
                            UserId = response.User.Id,
                            Username = response.User.Username,
                            IsApproved = response.IsApproved,
                            ResponseDate = response.ResponseDate,
                            Comments = response.Comments
                        });
                    }
                }

                rejectedApprovals.Add(approvalDetail);
            }

            return Ok(rejectedApprovals);
        }

        [HttpGet("documents-to-approve")]
        public async Task<ActionResult<IEnumerable<DocumentToApproveDto>>> GetDocumentsToApprove()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

            // Get all documents waiting for this user's approval
            var documentsToApprove = new List<DocumentToApproveDto>();

            // 1. Get documents requiring individual approval
            var individualApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                    .ThenInclude(d => d.DocumentType)
                .Include(aw => aw.Document)
                    .ThenInclude(d => d.SubType)
                .Include(aw => aw.Document)
                    .ThenInclude(d => d.CreatedBy)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Where(aw => 
                    aw.Status == ApprovalStatus.Open &&
                    aw.ApprovatorId.HasValue && 
                    _context.Approvators.Any(a => a.Id == aw.ApprovatorId && a.UserId == userId))
                .ToListAsync();

            foreach (var approval in individualApprovals)
            {
                if (approval.Document != null)
                {
                    documentsToApprove.Add(new DocumentToApproveDto
                    {
                        DocumentId = approval.DocumentId,
                        ApprovalId = approval.Id,
                        DocumentKey = approval.Document.DocumentKey,
                        Title = approval.Document.Title,
                        DocumentType = approval.Document.DocumentType?.TypeName ?? "",
                        SubType = approval.Document.SubType?.Name ?? "",
                        CreatedBy = approval.Document.CreatedBy?.Username ?? "",
                        CreatedAt = approval.Document.CreatedAt,
                        CurrentStep = approval.Step?.Title ?? "",
                        ApprovalType = "Individual",
                        Status = "Pending",
                        RequestedBy = approval.ProcessedBy?.Username ?? "",
                        RequestDate = approval.CreatedAt
                    });
                }
            }

            // 2. Get documents requiring group approval
            var groupApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Document)
                    .ThenInclude(d => d.DocumentType)
                .Include(aw => aw.Document)
                    .ThenInclude(d => d.SubType)
                .Include(aw => aw.Document)
                    .ThenInclude(d => d.CreatedBy)
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Where(aw => 
                    (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress) &&
                    aw.ApprovatorsGroupId.HasValue && 
                    _context.ApprovatorsGroupUsers.Any(gu => gu.GroupId == aw.ApprovatorsGroupId && gu.UserId == userId))
                .ToListAsync();

            foreach (var approval in groupApprovals)
            {
                // Skip if user has already responded
                bool hasResponded = await _context.ApprovalResponses
                    .AnyAsync(ar => ar.ApprovalWritingId == approval.Id && ar.UserId == userId);

                if (hasResponded)
                    continue;

                // For sequential approvals, check if it's this user's turn
                var group = await _context.ApprovatorsGroups
                    .Include(g => g.ApprovatorsGroupUsers)
                    .FirstOrDefaultAsync(g => g.Id == approval.ApprovatorsGroupId);

                var rule = await _context.ApprovatorsGroupRules
                    .FirstOrDefaultAsync(r => r.GroupId == approval.ApprovatorsGroupId);

                // Skip if it's not this user's turn in a sequential approval
                if (rule?.RuleType == RuleType.Sequential && group != null)
                {
                    var responses = await _context.ApprovalResponses
                        .Where(r => r.ApprovalWritingId == approval.Id)
                        .ToListAsync();

                    var respondedUserIds = responses.Select(r => r.UserId).ToList();
                    
                    var orderedUsers = group.ApprovatorsGroupUsers
                        .Where(gu => gu.OrderIndex.HasValue)
                        .OrderBy(gu => gu.OrderIndex!.Value)
                        .ToList();

                    // If no responses yet, only first user can approve
                    if (!responses.Any() && orderedUsers.Any())
                    {
                        if (orderedUsers.First().UserId != userId)
                            continue;
                    }
                    else if (orderedUsers.Any() && respondedUserIds.Any())
                    {
                        // Find the next user in sequence
                        var highestRespondedIndex = orderedUsers
                            .Where(gu => respondedUserIds.Contains(gu.UserId))
                            .Max(gu => gu.OrderIndex!.Value);

                        var nextUser = orderedUsers
                            .FirstOrDefault(gu => gu.OrderIndex!.Value > highestRespondedIndex);

                        if (nextUser?.UserId != userId)
                            continue;
                    }
                }

                if (approval.Document != null)
                {
                    documentsToApprove.Add(new DocumentToApproveDto
                    {
                        DocumentId = approval.DocumentId,
                        ApprovalId = approval.Id,
                        DocumentKey = approval.Document.DocumentKey,
                        Title = approval.Document.Title,
                        DocumentType = approval.Document.DocumentType?.TypeName ?? "",
                        SubType = approval.Document.SubType?.Name ?? "",
                        CreatedBy = approval.Document.CreatedBy?.Username ?? "",
                        CreatedAt = approval.Document.CreatedAt,
                        CurrentStep = approval.Step?.Title ?? "",
                        ApprovalType = rule?.RuleType == RuleType.Sequential ? "Sequential" :
                                    rule?.RuleType == RuleType.All ? "All" : "Any",
                        Status = "Pending",
                        RequestedBy = approval.ProcessedBy?.Username ?? "",
                        RequestDate = approval.CreatedAt
                    });
                }
            }

            return Ok(documentsToApprove);
        }

        /// <summary>
        /// Get pending approvals for a specific document
        /// </summary>
        /// <param name="documentId">The document ID</param>
        /// <returns>List of pending approvals for the document</returns>
        [HttpGet("document/{documentId}")]
        public async Task<ActionResult<IEnumerable<PendingApprovalDto>>> GetDocumentApprovals(int documentId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Check if document exists
            var document = await _context.Documents.FindAsync(documentId);
            if (document == null)
                return NotFound($"Document with ID {documentId} not found");

            // Get all pending approvals for this document
            var pendingApprovals = new List<PendingApprovalDto>();

            // 1. Get individual approvals for this document
            var individualApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Include(aw => aw.Approvator)
                    .ThenInclude(a => a.User)
                .Where(aw => 
                    aw.DocumentId == documentId &&
                    (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress) &&
                    aw.ApprovatorId.HasValue)
                .ToListAsync();

            foreach (var approval in individualApprovals)
            {
                pendingApprovals.Add(new PendingApprovalDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = documentId,
                    DocumentKey = document.DocumentKey,
                    DocumentTitle = document.Title,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    ApprovalType = "Individual",
                    Status = approval.Status.ToString(),
                    AssignedTo = approval.Approvator?.User?.Username ?? "Unknown Approver"
                });
            }

            // 2. Get group approvals for this document
            var groupApprovals = await _context.ApprovalWritings
                .Include(aw => aw.Step)
                .Include(aw => aw.ProcessedBy)
                .Include(aw => aw.ApprovatorsGroup)
                .Where(aw => 
                    aw.DocumentId == documentId &&
                    (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress) &&
                    aw.ApprovatorsGroupId.HasValue)
                .ToListAsync();

            foreach (var approval in groupApprovals)
            {
                // Get rule type for the group
                var rule = await _context.ApprovatorsGroupRules
                    .FirstOrDefaultAsync(r => r.GroupId == approval.ApprovatorsGroupId);
                
                string approvalType = "Group";
                if (rule != null)
                {
                    approvalType = rule.RuleType switch
                    {
                        RuleType.Sequential => "Sequential",
                        RuleType.All => "All",
                        RuleType.Any => "Any",
                        _ => "Group"
                    };
                }

                pendingApprovals.Add(new PendingApprovalDto
                {
                    ApprovalId = approval.Id,
                    DocumentId = documentId,
                    StepId = approval.StepId,
                    DocumentKey = document.DocumentKey,
                    DocumentTitle = document.Title,
                    StepTitle = approval.Step?.Title ?? string.Empty,
                    RequestedBy = approval.ProcessedBy?.Username ?? string.Empty,
                    RequestDate = approval.CreatedAt,
                    Comments = approval.Comments,
                    ApprovalType = approvalType,
                    Status = approval.Status.ToString(),
                    AssignedToGroup = approval.ApprovatorsGroup?.Name != null ? 
                        $"{approval.ApprovatorsGroup.Name} (ID: {approval.ApprovatorsGroupId})" : 
                        $"Group ID: {approval.ApprovatorsGroupId}"
                });
            }

            return Ok(pendingApprovals);
        }

        // STEP CONFIGURATION APIS

        [HttpGet("configure/steps")]
        public async Task<ActionResult<IEnumerable<StepWithApprovalDto>>> GetStepsWithApproval()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var steps = await _context.Steps
                .Include(s => s.Circuit)
                .Include(s => s.CurrentStatus)
                .Include(s => s.NextStatus)
                .OrderBy(s => s.CircuitId)
                .ThenBy(s => s.Id)
                .ToListAsync();

            var stepWithApprovalDtos = steps.Select(s => new StepWithApprovalDto
            {
                StepId = s.Id,
                StepKey = s.StepKey,
                CircuitId = s.CircuitId,
                CircuitTitle = s.Circuit!.Title,
                Title = s.Title,
                Descriptif = s.Descriptif,
                CurrentStatusId = s.CurrentStatusId,
                CurrentStatusTitle = s.CurrentStatus!.Title,
                NextStatusId = s.NextStatusId,
                NextStatusTitle = s.NextStatus!.Title,
                RequiresApproval = s.RequiresApproval
            }).ToList();

            return Ok(stepWithApprovalDtos);
        }

        [HttpPost("configure/step/{stepId}")]
        public async Task<IActionResult> ConfigureStepApproval(
            int stepId, [FromBody] StepApprovalConfigDto config)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            
            var step = await _context.Steps.FindAsync(stepId);
            if (step == null)
                return NotFound("Step not found.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Update the step's RequiresApproval flag
                step.RequiresApproval = true;
                
                if (step.RequiresApproval)
                {
                    // Clear existing approvators and groups
                    step.ApprovatorId = null;
                    step.ApprovatorsGroupId = null;
                    
                    // Add new configuration based on the approval type
                    if (config.SingleApproverId.HasValue && config.SingleApproverId.Value != 0)
                    {
                        // Find the existing approvator by ID
                        var approvator = await _context.Approvators
                            .FindAsync(config.SingleApproverId.Value);
                            
                        if (approvator == null)
                            return NotFound($"Approvator with ID {config.SingleApproverId.Value} not found.");
                        
                        step.ApprovatorId = approvator.Id;
                        step.ApprovatorsGroupId = null; // Ensure only one approval method is set
                    }
                    else if (config.ApprovatorsGroupId.HasValue && config.ApprovatorsGroupId.Value != 0)
                    {
                        // Find the existing approvers group
                        var group = await _context.ApprovatorsGroups
                            .FindAsync(config.ApprovatorsGroupId.Value);
                            
                        if (group == null)
                            return NotFound($"Approvers group with ID {config.ApprovatorsGroupId.Value} not found.");
                        
                        step.ApprovatorsGroupId = group.Id;
                        step.ApprovatorId = null; // Ensure only one approval method is set
                    }
                    else
                    {
                        return BadRequest("Invalid approval configuration. Must specify either a single approver or a group.");
                    }
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return Ok("Step approval configuration updated successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("configure/step/{stepId}")]
        public async Task<ActionResult<StepApprovalConfigDetailDto>> GetStepApprovalConfig(int stepId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var step = await _context.Steps
                .Include(s => s.Circuit)
                .Include(s => s.CurrentStatus)
                .Include(s => s.NextStatus)
                .Include(s => s.Approvator)
                .ThenInclude(a => a != null ? a.User : null)
                .Include(s => s.ApprovatorsGroup)
                .FirstOrDefaultAsync(s => s.Id == stepId);
                
            if (step == null)
                return NotFound("Step not found.");
                
            var config = new StepApprovalConfigDetailDto
            {
                StepId = step.Id,
                StepKey = step.StepKey,
                CircuitId = step.CircuitId,
                CircuitTitle = step.Circuit?.Title ?? string.Empty,
                Title = step.Title,
                Descriptif = step.Descriptif,
                CurrentStatusId = step.CurrentStatusId,
                CurrentStatusTitle = step.CurrentStatus?.Title ?? string.Empty,
                NextStatusId = step.NextStatusId,
                NextStatusTitle = step.NextStatus?.Title ?? string.Empty,
                RequiresApproval = step.RequiresApproval,
                ApprovalType = "None",
                Comment = string.Empty
            };
            
            if (step.RequiresApproval)
            {
                // A step can only have either an approvator or a group, not both
                if (step.ApprovatorId.HasValue && step.Approvator != null)
                {
                    config.ApprovalType = "Single";
                    config.SingleApproverId = step.ApprovatorId;
                    config.SingleApproverName = step.Approvator.User?.Username ?? string.Empty;
                    config.Comment = step.Approvator.Comment;
                }
                else if (step.ApprovatorsGroupId.HasValue && step.ApprovatorsGroup != null)
                {
                    // Check for group
                    config.ApprovalType = "Group";
                    config.ApprovatorsGroupId = step.ApprovatorsGroupId;
                    config.GroupName = step.ApprovatorsGroup.Name;
                    config.Comment = step.ApprovatorsGroup.Comment;
                    
                    // Get group users
                    var groupUsers = await _context.ApprovatorsGroupUsers
                        .Include(gu => gu.User)
                        .Where(gu => gu.GroupId == step.ApprovatorsGroupId.Value)
                        .OrderBy(gu => gu.OrderIndex)
                        .ToListAsync();
                        
                    config.GroupApprovers = groupUsers.Select(gu => new ApproverInfoDto
                    {
                        UserId = gu.UserId,
                        Username = gu.User?.Username ?? string.Empty,
                        OrderIndex = gu.OrderIndex
                    }).ToList();
                    
                    // Get rule
                    var rule = await _context.ApprovatorsGroupRules
                        .FirstOrDefaultAsync(r => r.GroupId == step.ApprovatorsGroupId.Value);
                        
                    if (rule != null)
                    {
                        config.RuleType = rule.RuleType.ToString();
                    }
                }
            }
            
            return Ok(config);
        }

        // APPROVER MANAGEMENT APIS

        [HttpGet("eligible-approvers")]
        public async Task<ActionResult<IEnumerable<ApproverInfoDto>>> GetEligibleApprovers()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Get all users with Admin or FullUser roles
            var eligibleUsers = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.IsActive && (u.Role!.RoleName == "Admin" || u.Role.RoleName == "FullUser"))
                .OrderBy(u => u.Username)
                .Select(u => new ApproverInfoDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    Role = u.Role!.RoleName
                })
                .ToListAsync();

            return Ok(eligibleUsers);
        }

        [HttpGet("available-approvers")]
        public async Task<ActionResult<IEnumerable<ApproverInfoDto>>> GetAvailableApprovers()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Get all users with Admin or FullUser roles who are NOT already in the Approvators table
            var availableUsers = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.IsActive && 
                        (u.Role!.RoleName == "Admin" || u.Role.RoleName == "FullUser") &&
                        !_context.Approvators.Any(a => a.UserId == u.Id))
                .OrderBy(u => u.Username)
                .Select(u => new ApproverInfoDto
                {
                    UserId = u.Id,
                    Username = u.Username,
                    Role = u.Role!.RoleName
                })
                .ToListAsync();

            return Ok(availableUsers);
        }

        [HttpPost("groups")]
        public async Task<IActionResult> CreateApprovatorsGroup([FromBody] CreateApprovatorsGroupDto request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create group
                var group = new ApprovatorsGroup
                {
                    Name = request.Name,
                    Comment = request.Comment ?? string.Empty
                };
                
                _context.ApprovatorsGroups.Add(group);
                await _context.SaveChangesAsync(); // Save to get group ID
                
                // Add users to group
                for (int i = 0; i < request.UserIds.Count; i++)
                {
                    var groupUser = new ApprovatorsGroupUser
                    {
                        GroupId = group.Id,
                        UserId = request.UserIds[i],
                        OrderIndex = request.RuleType == "Sequential" ? i : null
                    };
                    
                    _context.ApprovatorsGroupUsers.Add(groupUser);
                }
                
                // Create rule
                RuleType ruleType;
                switch (request.RuleType)
                {
                    case "All":
                        ruleType = RuleType.All;
                        break;
                    case "Sequential":
                        ruleType = RuleType.Sequential;
                        break;
                    default:
                        ruleType = RuleType.Any;
                        break;
                }
                
                var rule = new ApprovatorsGroupRule
                {
                    GroupId = group.Id,
                    RuleType = ruleType
                };
                
                _context.ApprovatorsGroupRules.Add(rule);
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return CreatedAtAction(nameof(GetApprovatorsGroup), new { id = group.Id }, new
                {
                    group.Id,
                    group.Name,
                    group.Comment,
                    RuleType = rule.RuleType.ToString(),
                    UserIds = request.UserIds
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("groups/{id}")]
        public async Task<ActionResult<ApprovatorsGroupDetailDto>> GetApprovatorsGroup(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var group = await _context.ApprovatorsGroups
                .FirstOrDefaultAsync(g => g.Id == id);
                
            if (group == null)
                return NotFound("Approvers group not found.");
                
            var rule = await _context.ApprovatorsGroupRules
                .FirstOrDefaultAsync(r => r.GroupId == id);
                
            var users = await _context.ApprovatorsGroupUsers
                .Include(gu => gu.User)
                .Where(gu => gu.GroupId == id)
                .OrderBy(gu => gu.OrderIndex)
                .ToListAsync();
                
            var result = new ApprovatorsGroupDetailDto
            {
                Id = group.Id,
                Name = group.Name,
                Comment = group.Comment,
                RuleType = rule?.RuleType.ToString() ?? "All",
                Approvers = users.Select(u => new ApproverInfoDto
                {
                    UserId = u.UserId,
                    Username = u.User?.Username ?? string.Empty,
                    OrderIndex = u.OrderIndex
                }).ToList()
            };
            
            return Ok(result);
        }

        [HttpGet("groups")]
        public async Task<ActionResult<IEnumerable<ApprovatorsGroupDetailDto>>> GetAllApprovatorsGroups()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var groups = await _context.ApprovatorsGroups.ToListAsync();
            var result = new List<ApprovatorsGroupDetailDto>();

            foreach (var group in groups)
            {
                var rule = await _context.ApprovatorsGroupRules
                    .FirstOrDefaultAsync(r => r.GroupId == group.Id);

                var users = await _context.ApprovatorsGroupUsers
                    .Include(gu => gu.User)
                    .Where(gu => gu.GroupId == group.Id)
                    .OrderBy(gu => gu.OrderIndex)
                    .ToListAsync();

                result.Add(new ApprovatorsGroupDetailDto
                {
                    Id = group.Id,
                    Name = group.Name,
                    Comment = group.Comment,
                    RuleType = rule?.RuleType.ToString() ?? "All",
                    Approvers = users.Select(u => new ApproverInfoDto
                    {
                        UserId = u.UserId,
                        Username = u.User?.Username ?? string.Empty,
                        OrderIndex = u.OrderIndex
                    }).ToList()
                });
            }

            return Ok(result);
        }

        [HttpDelete("groups/{id}")]
        public async Task<IActionResult> DeleteApprovatorsGroup(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var group = await _context.ApprovatorsGroups.FindAsync(id);
            if (group == null)
                return NotFound("Approvers group not found.");
            
            // Check if group is in use by steps
            var stepsUsingGroup = await _context.Steps
                .Where(s => s.ApprovatorsGroupId == id)
                .ToListAsync();
                       
            if (stepsUsingGroup.Any())
                return BadRequest($"Cannot delete approvers group that is associated with {stepsUsingGroup.Count} step(s). Remove the group from these steps first.");
            
            // Check if group is in use by approval writings
            var groupInUse = await _context.ApprovalWritings
                .AnyAsync(aw => aw.ApprovatorsGroupId == id && 
                              (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress));
                       
            if (groupInUse)
                return BadRequest("Cannot delete approvers group that is being used in active approvals.");
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Remove group users
                var groupUsers = await _context.ApprovatorsGroupUsers
                    .Where(gu => gu.GroupId == id)
                    .ToListAsync();
                _context.ApprovatorsGroupUsers.RemoveRange(groupUsers);
                
                // Remove group rules
                var groupRules = await _context.ApprovatorsGroupRules
                    .Where(gr => gr.GroupId == id)
                    .ToListAsync();
                _context.ApprovatorsGroupRules.RemoveRange(groupRules);
                
                // Remove group
                _context.ApprovatorsGroups.Remove(group);
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return Ok("Approvers group deleted successfully.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // GROUP USER MANAGEMENT APIS

        [HttpPost("groups/{groupId}/users")]
        public async Task<IActionResult> AddUserToGroup(int groupId, [FromBody] AddUserToGroupDto request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Validate the group exists
            var group = await _context.ApprovatorsGroups
                .Include(g => g.ApprovatorsGroupUsers)
                .FirstOrDefaultAsync(g => g.Id == groupId);
                
            if (group == null)
                return NotFound("Approvers group not found.");

            // Validate the user exists
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound("User not found.");

            // Check if user is already in the group
            var existingUser = await _context.ApprovatorsGroupUsers
                .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == request.UserId);
                
            if (existingUser != null)
                return BadRequest("User is already a member of this group.");

            // Get group rule to determine if we need to handle sequential ordering
            var rule = await _context.ApprovatorsGroupRules
                .FirstOrDefaultAsync(r => r.GroupId == groupId);
                
            bool isSequential = rule?.RuleType == RuleType.Sequential;
            
            // For sequential groups, handle order index
            int? orderIndex = null;
            
            if (isSequential)
            {
                // If order index is provided, verify it's valid
                if (request.OrderIndex.HasValue)
                {
                    // Check if that position is already taken
                    var existingUserAtIndex = await _context.ApprovatorsGroupUsers
                        .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.OrderIndex == request.OrderIndex.Value);
                        
                    if (existingUserAtIndex != null)
                        return BadRequest($"Order index {request.OrderIndex.Value} is already assigned to another user.");
                        
                    orderIndex = request.OrderIndex.Value;
                }
                else
                {
                    // If no order index is provided, append to the end
                    var maxIndex = await _context.ApprovatorsGroupUsers
                        .Where(gu => gu.GroupId == groupId && gu.OrderIndex.HasValue)
                        .MaxAsync(gu => (int?)gu.OrderIndex) ?? -1;
                        
                    orderIndex = maxIndex + 1;
                }
            }

            // Create the new group user
            var groupUser = new ApprovatorsGroupUser
            {
                GroupId = groupId,
                UserId = request.UserId,
                OrderIndex = orderIndex
            };
            
            _context.ApprovatorsGroupUsers.Add(groupUser);
            await _context.SaveChangesAsync();
            
            return Ok(new
            {
                groupUser.Id,
                groupUser.GroupId,
                groupUser.UserId,
                Username = user.Username,
                groupUser.OrderIndex
            });
        }

        [HttpDelete("groups/{groupId}/users/{userId}")]
        public async Task<IActionResult> RemoveUserFromGroup(int groupId, int userId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Check if the user is in the group
            var groupUser = await _context.ApprovatorsGroupUsers
                .FirstOrDefaultAsync(gu => gu.GroupId == groupId && gu.UserId == userId);
                
            if (groupUser == null)
                return NotFound("User is not a member of this group.");

            // Check if this group is being used in active approvals
            var groupInUse = await _context.ApprovalWritings
                .AnyAsync(aw => aw.ApprovatorsGroupId == groupId && 
                              (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress));
                
            if (groupInUse)
                return BadRequest("Cannot remove user from a group that is being used in active approvals.");

            // Get rule to check if we need to handle sequential ordering
            var rule = await _context.ApprovatorsGroupRules
                .FirstOrDefaultAsync(r => r.GroupId == groupId);
                
            bool isSequential = rule?.RuleType == RuleType.Sequential;
            
            // Remove the user
            _context.ApprovatorsGroupUsers.Remove(groupUser);
            
            // If sequential, reorder remaining users to maintain consecutive ordering
            if (isSequential && groupUser.OrderIndex.HasValue)
            {
                var usersToReorder = await _context.ApprovatorsGroupUsers
                    .Where(gu => gu.GroupId == groupId && 
                             gu.OrderIndex.HasValue && 
                             gu.OrderIndex.Value > groupUser.OrderIndex.Value)
                    .OrderBy(gu => gu.OrderIndex)
                    .ToListAsync();
                    
                foreach (var user in usersToReorder)
                {
                    user.OrderIndex = user.OrderIndex!.Value - 1;
                }
            }
            
            await _context.SaveChangesAsync();
            
            return Ok("User removed from group successfully.");
        }

        [HttpGet("groups/{groupId}/users")]
        public async Task<ActionResult<IEnumerable<ApproverInfoDto>>> GetGroupUsers(int groupId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Validate the group exists
            var group = await _context.ApprovatorsGroups
                .FirstOrDefaultAsync(g => g.Id == groupId);
                
            if (group == null)
                return NotFound("Approvers group not found.");

            // Get users in the group
            var groupUsers = await _context.ApprovatorsGroupUsers
                .Where(gu => gu.GroupId == groupId)
                .Include(gu => gu.User)
                .ThenInclude(u => u!.Role)
                .OrderBy(gu => gu.OrderIndex)
                .Select(gu => new ApproverInfoDto
                {
                    UserId = gu.UserId,
                    Username = gu.User!.Username,
                    Role = gu.User.Role!.RoleName,
                    OrderIndex = gu.OrderIndex
                })
                .ToListAsync();

            return Ok(groupUsers);
        }

        // APPROVATOR CRUD OPERATIONS

        [HttpGet("approvators")]
        public async Task<ActionResult<IEnumerable<ApprovatorDetailDto>>> GetAllApprovators()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var approvators = await _context.Approvators
                .Include(a => a.User)
                .Include(a => a.Step)
                .Select(a => new ApprovatorDetailDto
                {
                    Id = a.Id,
                    UserId = a.UserId,
                    Username = a.User!.Username,
                    Comment = a.Comment,
                    StepId = a.StepId,
                    StepTitle = a.Step != null ? a.Step.Title : string.Empty
                })
                .ToListAsync();

            return Ok(approvators);
        }

        [HttpGet("approvators/{id}")]
        public async Task<ActionResult<ApprovatorDetailDto>> GetApprovator(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var approvator = await _context.Approvators
                .Include(a => a.User)
                .Include(a => a.Step)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (approvator == null)
                return NotFound("Approvator not found.");

            var result = new ApprovatorDetailDto
            {
                Id = approvator.Id,
                UserId = approvator.UserId,
                Username = approvator.User!.Username,
                Comment = approvator.Comment,
                StepId = approvator.StepId,
                StepTitle = approvator.Step != null ? approvator.Step.Title : string.Empty
            };

            return Ok(result);
        }

        [HttpPost("approvators")]
        public async Task<ActionResult<ApprovatorDetailDto>> CreateApprovator([FromBody] CreateApprovatorDto dto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Verify user exists
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                return NotFound($"User with ID {dto.UserId} not found.");

            // Check if user already has an approvator record
            var existingApprovator = await _context.Approvators
                .FirstOrDefaultAsync(a => a.UserId == dto.UserId);

            if (existingApprovator != null)
                return BadRequest("This user is already configured as an approver.");

            var approvator = new Approvator
            {
                UserId = dto.UserId,
                Comment = dto.Comment
                // No longer setting StepId - approvators can be used by multiple steps
            };

            _context.Approvators.Add(approvator);
            await _context.SaveChangesAsync();

            // If a step was specified, associate this approvator with that step
            if (dto.StepId.HasValue)
            {
                var step = await _context.Steps.FindAsync(dto.StepId.Value);
                if (step != null)
                {
                    step.ApprovatorId = approvator.Id;
                    step.ApprovatorsGroupId = null; // Ensure only one approval method is set
                    step.RequiresApproval = true; // Enable approval for this step
                    await _context.SaveChangesAsync();
                }
            }

            var result = new ApprovatorDetailDto
            {
                Id = approvator.Id,
                UserId = approvator.UserId,
                Username = user.Username,
                Comment = approvator.Comment,
                StepId = dto.StepId, // Return the step ID if it was associated
                StepTitle = dto.StepId.HasValue ? 
                    (await _context.Steps.FindAsync(dto.StepId.Value))?.Title ?? string.Empty : 
                    string.Empty
            };

            return CreatedAtAction(nameof(GetApprovator), new { id = approvator.Id }, result);
        }

        [HttpPut("approvators/{id}")]
        public async Task<IActionResult> UpdateApprovator(int id, [FromBody] CreateApprovatorDto dto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var approvator = await _context.Approvators.FindAsync(id);
            if (approvator == null)
                return NotFound("Approvator not found.");

            // Verify user exists
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
                return NotFound($"User with ID {dto.UserId} not found.");

            // Make sure another approvator record doesn't already exist for this user
            if (approvator.UserId != dto.UserId)
            {
                var existingApprovator = await _context.Approvators
                    .FirstOrDefaultAsync(a => a.Id != id && a.UserId == dto.UserId);

                if (existingApprovator != null)
                    return BadRequest("This user is already configured as an approver.");
            }

            // Update approvator details
            approvator.UserId = dto.UserId;
            approvator.Comment = dto.Comment;

            // If a step was provided, associate the approvator with it
            if (dto.StepId.HasValue)
            {
                var step = await _context.Steps.FindAsync(dto.StepId.Value);
                if (step == null)
                    return NotFound($"Step with ID {dto.StepId.Value} not found.");
                
                // Set this approvator as the step's approvator
                step.ApprovatorId = id;
                step.ApprovatorsGroupId = null; // Ensure only one approval method is set
                step.RequiresApproval = true;
                _context.Steps.Update(step);
            }

            // Find all steps that use this approvator
            var stepsUsingApprovator = await _context.Steps
                .Where(s => s.ApprovatorId == id)
                .ToListAsync();

            // Update the User ID in steps that reference this approvator
            foreach (var step in stepsUsingApprovator)
            {
                // We don't need to update any fields on the step since we're just
                // changing the related approvator's UserId
            }

            _context.Approvators.Update(approvator);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("approvators/{id}")]
        public async Task<IActionResult> DeleteApprovator(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var approvator = await _context.Approvators.FindAsync(id);
            if (approvator == null)
                return NotFound("Approvator not found.");

            // Check if approvator is being used by steps
            var stepsUsingApprovator = await _context.Steps
                .Where(s => s.ApprovatorId == id)
                .ToListAsync();

            if (stepsUsingApprovator.Any())
                return BadRequest($"Cannot delete approvator that is associated with {stepsUsingApprovator.Count} step(s). Remove the approvator from these steps first.");

            // Check if approvator is being used in approval writings
            var approvatorInUse = await _context.ApprovalWritings
                .AnyAsync(aw => aw.ApprovatorId == id && 
                            (aw.Status == ApprovalStatus.Open || aw.Status == ApprovalStatus.InProgress));

            if (approvatorInUse)
                return BadRequest("Cannot delete approvator that is being used in active approvals.");

            _context.Approvators.Remove(approvator);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("approvators/{id}/check-association")]
        public async Task<ActionResult<ApprovatorAssociationDto>> CheckApprovatorAssociation(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var approvator = await _context.Approvators
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == id);
                
            if (approvator == null)
                return NotFound($"Approvator with ID {id} not found.");
                
            // Find any steps that have this approvator assigned
            var associatedSteps = await _context.Steps
                .Include(s => s.Circuit)
                .Where(s => s.ApprovatorId == id)
                .Select(s => new StepReferenceDto
                {
                    StepId = s.Id,
                    StepKey = s.StepKey,
                    Title = s.Title,
                    CircuitId = s.CircuitId,
                    CircuitTitle = s.Circuit.Title
                })
                .ToListAsync();
                
            var result = new ApprovatorAssociationDto
            {
                ApprovatorId = id,
                UserId = approvator.UserId,
                Username = approvator.User?.Username ?? "Unknown",
                IsAssociated = associatedSteps.Any(),
                AssociatedSteps = associatedSteps
            };
            
            return Ok(result);
        }
        
        [HttpGet("groups/{id}/check-association")]
        public async Task<ActionResult<GroupAssociationDto>> CheckGroupAssociation(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var group = await _context.ApprovatorsGroups
                .FirstOrDefaultAsync(g => g.Id == id);
                
            if (group == null)
                return NotFound($"Approvers group with ID {id} not found.");
                
            // Find any steps that have this group assigned
            var associatedSteps = await _context.Steps
                .Include(s => s.Circuit)
                .Where(s => s.ApprovatorsGroupId == id)
                .Select(s => new StepReferenceDto
                {
                    StepId = s.Id,
                    StepKey = s.StepKey,
                    Title = s.Title,
                    CircuitId = s.CircuitId,
                    CircuitTitle = s.Circuit.Title
                })
                .ToListAsync();
                
            var result = new GroupAssociationDto
            {
                GroupId = id,
                GroupName = group.Name,
                IsAssociated = associatedSteps.Any(),
                AssociatedSteps = associatedSteps
            };
            
            return Ok(result);
        }
    }
}