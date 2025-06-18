# Sequential Approval Logic - Test Plan

## Fixed Sequential Approval Logic

The sequential approval logic has been fixed to properly respect the order of approvers in the group AND auto-approve the original requester when it becomes their turn.

### Scenario from Screenshots:
- **Approval Group**: "Managers" with Sequential rule
- **Group Members** (in order):
  1. `ahmed` (position 1)
  2. `aennaki` (position 2) 
  3. `ennaki` (position 3)

### Test Case: aennaki initiates approval request

#### ❌ **BEFORE (Current Issue)**:
When `aennaki` requested approval:
- ❌ `aennaki` was auto-approved immediately (skipping `ahmed`)
- ❌ `ennaki` received approval request first
- ❌ `ahmed` never got the opportunity to approve

#### ✅ **AFTER (Fixed Logic)**:
When `aennaki` requests approval:

1. **Step 1**: System creates approval request
2. **Step 2**: System checks `aennaki`'s position (position 2)
3. **Step 3**: System sees `ahmed` (position 1) hasn't approved yet
4. **Step 4**: System does NOT auto-approve `aennaki`
5. **Step 5**: `ahmed` receives approval request first
6. **Step 6**: When `ahmed` approves, system checks next user in sequence
7. **Step 7**: System sees `aennaki` (next user) is the original requester → AUTO-APPROVES him
8. **Step 8**: `ennaki` receives approval request
9. **Step 9**: When `ennaki` approves, the approval is complete

### Key Changes Made:

1. **Position Check**: Before auto-approving the requester, check if all previous users in sequence have approved
2. **Existing Approval Handling**: If an approval already exists, check sequence position before auto-approving
3. **First User Priority**: Only auto-approve immediately if the requester is first in sequence
4. **Sequential Enforcement**: Respect the order and don't skip any approvers
5. **🆕 Reactive Auto-Approval**: When someone approves, check if the next user is the original requester and auto-approve them

### Code Logic:

#### 1. During Document Movement (WorkflowController):
```csharp
// Check user's position in sequence
var currentUserIndex = orderedUsers.FindIndex(gu => gu.UserId == userId);

// Only auto-approve if:
// 1. User is first in sequence (position 0), OR
// 2. All previous users have already approved

if (currentUserIndex == 0) {
    // Auto-approve immediately (first user)
} else {
    // Check if all previous users approved
    var previousApprovalsCount = await GetPreviousApprovalsCount();
    if (previousApprovalsCount == previousUserIds.Count) {
        // Auto-approve (all previous approved)
    } else {
        // Wait for previous approvers
    }
}
```

#### 2. During Approval Response (DocumentWorkflowService):
```csharp
// After someone approves, check if next user is the original requester
if (rule.RuleType == RuleType.Sequential && isApproved) {
    var nextUser = GetNextUserInSequence();
    if (nextUser.UserId == approvalWriting.ProcessedByUserId) {
        // Auto-approve the original requester
        CreateAutoApprovalResponse(nextUser.UserId);
    }
}
```

### Expected Result:
- ✅ Sequential order is respected
- ✅ First user always gets approval first
- ✅ Requester is auto-approved only when it's their turn
- ✅ No approvers are skipped
- ✅ Auto-approval happens both during initiation AND when previous users approve

## How to Test:

1. Start the backend: `dotnet run --urls="https://localhost:7070"`
2. Create a new approval request with `aennaki` as initiator
3. Verify `ahmed` receives the approval first
4. Have `ahmed` approve
5. **Verify `aennaki` is automatically approved** (should happen immediately after `ahmed` approves)
6. Verify `ennaki` receives the approval request
7. Have `ennaki` approve to complete the process

## Test Scenario for Your Case:

**Document**: AV2506-0016  
**Current State**: `ahmed` has approved, `aennaki` and `ennaki` are pending

**Expected Behavior After Fix**:
- When you refresh or check the approval status, `aennaki` should automatically be marked as "Approved" since `ahmed` (previous in sequence) has already approved
- Only `ennaki` should remain as "Pending"
- The approval flow should proceed correctly 