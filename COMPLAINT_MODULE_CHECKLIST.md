# Complaint Module Implementation Checklist

## Overview

This checklist tracks the implementation of the **Complaint Management Module** based on Ethiopian Prison Personnel Law (Article 30 and Article 31).

**Legal Basis:**
- Article 30 - Minor Complaints (46 offense types with graduated punishments)
- Article 31 - Serious Complaints (32 offense types, HQ Committee decides punishment)

**Core Principles:**
1. System is an **official historical record**, not a real-time workflow executor
2. Investigations/decisions occur **on paper**; system records outcomes
3. Article 30 or 31 is **known at intake** - no later classification
4. Employees do NOT access the system
5. Users: HR Officers, Committee Secretaries, Center Commanders, HQ Leadership
6. All actions must have date, authority, and supporting documents

---

## Implementation Order (Dependencies)

```
1. Employee DirectSuperior     --> Required for Article 30 (superior decides punishment)
2. Offense Types JSON          --> Static JSON file on frontend (no backend needed for now)
3. Committee Module            --> Required for Article 31 (discipline committees)
4. Complaint Module            --> Main module (depends on all above)
```

**Rationale:**
- Article 30 requires `directSuperiorId` on Employee to know who makes punishment decisions
- Offense types stored as JSON file on frontend (simpler, can add CRUD later if needed)
- Article 31 requires discipline committees to be set up first
- Complaint module ties everything together

**Note:** Offense Types will be a static JSON file (`offense-types.json`) in the frontend constants folder. This simplifies initial implementation. A full CRUD module can be added later if dynamic management is needed.

---

## Offense Types Data

### Article 30 - Minor Offenses (46 types)

Punishment scale based on offense occurrence (1st through 6th time):

| Severity Level | 1st | 2nd | 3rd | 4th | 5th | 6th | Decided By |
|----------------|-----|-----|-----|-----|-----|-----|------------|
| Level 1 (Mild) | Written Warning | 3% | 5% | 7% | - | - | Direct Superior |
| Level 2 | 3% | 5% | 7% | 10% | - | - | Direct Superior |
| Level 3 | 5% | 7% | 10% | 15% | 20% | - | Direct Superior |
| Level 4 | 10% | 15% | 20% | 30% | 50% | - | Direct Superior |
| Level 5 | 15% | 20% | 30% | 50% | 100% | Escalate | **Discipline Committee** |
| Level 6 (Severe) | 20% | 30% | 50% | 100% | Escalate | - | **Discipline Committee** |
| Level 7 | 30% | 50% | 100% | Escalate | - | - | **Discipline Committee** |

*Percentages = salary deduction from monthly salary*
*100% = one month salary deduction*
*Escalate = case becomes Article 31, forwarded to HQ*

**Important Decision Authority Rule:**
- **Levels 1-4**: Direct Superior decides punishment
- **Levels 5-7**: Center Discipline Committee decides punishment (even though it's Article 30)
- **Escalation**: When punishment would exceed 100%, case escalates to Article 31

### Article 31 - Serious Offenses (32 types)

- No predefined punishment scale
- All punishments decided by HQ Discipline Committee
- Can include: Demotion, Rank reduction, Termination, Criminal referral

---

## Status Reference (Workflow States)

```
UNDER_HR_REVIEW           - Article 30: Initial state after registration
WAITING_FOR_REBUTTAL      - Article 30: Notification sent, awaiting response (3 days)
UNDER_HR_ANALYSIS         - Article 30: Rebuttal received, HR analyzing
AWAITING_SUPERIOR_DECISION - Article 30: Finding made, awaiting punishment decision
WITH_DISCIPLINE_COMMITTEE - Article 31: Initial state / Committee investigating
FORWARDED_TO_HQ           - Article 31: Guilty finding, forwarded to HQ Committee
DECIDED                   - Article 30: Superior made punishment decision
DECIDED_BY_HQ             - Article 31: HQ Committee made final decision
CLOSED_NO_LIABILITY       - Both: Not guilty, case closed
CLOSED_FINAL              - Both: All appeals exhausted, case fully closed
```

---

## PHASE 0: EMPLOYEE DIRECT SUPERIOR - COMPLETED

### 0.1 Database Schema Update - COMPLETED
- [x] Add `directSuperiorId` field to Employee model (nullable, self-reference)
- [x] Add `directSuperior` relation (Employee -> Employee)
- [x] Add `subordinates` relation (Employee[] for reverse lookup)
- [x] Add `@@index([directSuperiorId])` for performance
- [x] Run Prisma migration

### 0.2 Backend - Employee Module Enhancement - COMPLETED
- [x] Create separate `employee-superior.service.ts` for superior logic
- [x] Create `employee-superior.dto.ts` with AssignSuperiorDto, BulkAssignDto
- [x] Add validation: prevent circular references (employee cannot be own superior)
- [x] Add `getSubordinates(employeeId)` method to service
- [x] Add `getOrgChart()` method (returns full hierarchy)
- [x] Add `getAssignmentList()` for managing assignments

### 0.3 Backend - Direct Superior Endpoints - COMPLETED
- [x] `POST /employees/superior/assign` - Assign direct superior
- [x] `POST /employees/superior/bulk-assign` - Bulk assign to multiple employees
- [x] `DELETE /employees/superior/:employeeId` - Remove direct superior
- [x] `GET /employees/superior/list` - Get assignment list by center
- [x] `GET /employees/superior/org-chart` - Get org chart hierarchy

### 0.4 Frontend - Direct Superior Management - COMPLETED
- [x] Add "Direct Superior" submenu under Employees in sidebar
- [x] Create `DirectSuperiorPage.tsx` - List and Org Chart tabs
- [x] Create assignment dialog for single employee
- [x] Create bulk assignment dialog
- [x] Add employee search/select component for superior selection
- [x] Add org chart visualization with expandable nodes
- [x] API layer: employee-superior.api.ts, queries, mutations

---

## PHASE 1: OFFENSE TYPES (JSON FILE - NO BACKEND) - COMPLETED

### 1.1 Frontend - Static TypeScript Data - COMPLETED
- [x] Create `packages/web/src/features/complaints/constants/offense-types.ts`
- [x] Define TypeScript interfaces: `OffenseType`, `PunishmentScale`, `PunishmentValue`, `DecisionAuthority`
- [x] Add 46 Article 30 offenses with:
  - code (ART30-001 to ART30-046)
  - name (English), nameAm (Amharic)
  - severityLevel (1-7)
  - punishmentScale (1st through 6th occurrence with percentages)
  - decisionAuthority (DIRECT_SUPERIOR for levels 1-4, DISCIPLINE_COMMITTEE for levels 5-7)
  - canEscalate flag
- [x] Add 32 Article 31 offenses with:
  - code (ART31-001 to ART31-032)
  - name (English), nameAm (Amharic)
  - No punishment scale (null - HQ decides)

### 1.2 Frontend - Helper Functions - COMPLETED
- [x] `getOffensesByArticle(article)` - filter by Article 30 or 31
- [x] `getOffenseByCode(code)` - get single offense by code
- [x] `getPunishmentForOccurrence(offenseCode, occurrence)` - get punishment value
- [x] `formatPunishment(value, language)` - format punishment for display
- [x] `shouldEscalateToArticle31(offenseCode, occurrence)` - check escalation
- [x] `getDecisionAuthority(severityLevel)` - returns DIRECT_SUPERIOR or DISCIPLINE_COMMITTEE
- [x] `requiresCommitteeDecision(offenseCode)` - check if committee decision needed
- [x] `getSeverityLevelDescription(level, language)` - human-readable severity
- [x] `getOffensesBySeverityLevel(level)` - filter by severity
- [x] `getOffenseCount()` - get counts for article 30, 31, and total

### 1.3 Complaint Model Storage - PLANNED
- [ ] Store `offenseCode` (string) in Complaint model instead of `offenseTypeId`
- [ ] Frontend displays offense details from TypeScript constants using the code

**Note:** Offense types are stored as TypeScript constants (not JSON) for better type safety. If dynamic CRUD is needed later, create backend module and migrate offense codes to database IDs.

---

## PHASE 2: COMMITTEE MODULE - COMPLETED

### 2.1 Database Schema - COMPLETED
- [x] Create `CommitteeType` model:
  ```
  id, tenantId, code, name, nameAm
  description, descriptionAm
  isPermanent, requiresCenter, minMembers, maxMembers
  isActive, createdAt, updatedAt
  ```
- [x] Create `Committee` model:
  ```
  id, tenantId, committeeTypeId, centerId (null for HQ)
  code, name, nameAm, description, descriptionAm
  status (ACTIVE | SUSPENDED | DISSOLVED)
  establishedDate, dissolvedDate, dissolvedReason
  establishedBy, dissolvedBy
  isActive, createdAt, updatedAt
  ```
- [x] Create `CommitteeMember` model:
  ```
  id, tenantId, committeeId, employeeId
  role (CHAIRMAN | VICE_CHAIRMAN | SECRETARY | MEMBER | ADVISOR)
  appointedDate, endDate (null if active)
  appointedBy, removedBy, removalReason
  isActive, createdAt, updatedAt
  ```
- [x] Create `CommitteeHistory` model (audit trail)
- [x] Add `CommitteeStatus` enum
- [x] Add `CommitteeMemberRole` enum
- [x] Run Prisma migration

### 2.2 Backend - Committee API - COMPLETED
- [x] Create `committees` module folder
- [x] Create `committees.module.ts`
- [x] Create DTOs:
  - [x] committee-type.dto.ts (create, update)
  - [x] committee.dto.ts (create, update, suspend, reactivate, dissolve, filter, response)
  - [x] committee-member.dto.ts (add, update, remove, bulk-add)
- [x] Create `committees.service.ts`:
  - [x] Committee Type CRUD: `createCommitteeType()`, `findAllCommitteeTypes()`, `findOneCommitteeType()`, `updateCommitteeType()`, `deactivateCommitteeType()`
  - [x] Committee CRUD: `createCommittee()`, `findAllCommittees()`, `findOneCommittee()`, `updateCommittee()`, `suspendCommittee()`, `reactivateCommittee()`, `dissolveCommittee()`
  - [x] Members: `addMember()`, `bulkAddMembers()`, `updateMember()`, `removeMember()`, `getCommitteeMembers()`
  - [x] `getEmployeeCommittees(employeeId)` - committees employee serves on
  - [x] `getCommitteeHistory()` - audit trail
- [x] Create `committees.controller.ts`:
  - [x] Committee Types: POST /committees/types, GET /committees/types, GET /committees/types/:id, PATCH /committees/types/:id, DELETE /committees/types/:id
  - [x] Committees: POST /committees, GET /committees, GET /committees/:id, PATCH /committees/:id, PATCH /committees/:id/suspend, PATCH /committees/:id/reactivate, PATCH /committees/:id/dissolve
  - [x] Members: GET /committees/:id/members, POST /committees/:id/members, POST /committees/:id/members/bulk, PATCH /committees/:id/members/:memberId, DELETE /committees/:id/members/:memberId
  - [x] Employee: GET /committees/employee/:employeeId
  - [x] History: GET /committees/:id/history

### 2.3 Frontend - Committee Management - COMPLETED
- [x] Create `packages/web/src/types/committee.ts`
- [x] Create API layer: `committees.api.ts`, queries, mutations
- [x] Create `CommitteeTypesListPage.tsx` - manage committee types
- [x] Create `CommitteeTypeFormDialog.tsx` - create/edit committee types
- [x] Create `CommitteesListPage.tsx` - list all committees
- [x] Create `CommitteeFormDialog.tsx` - create/edit committees
- [x] Create `CommitteeDetailPage.tsx` - view committee with members
- [x] Create `AddMemberDialog.tsx` - add member using EmployeeSearch
- [x] Add to sidebar under Organization (Committee Types, Committees)
- [x] Add translations (en/am)

### 2.4 Employee Profile Integration - COMPLETED
- [x] Show committee memberships on Employee Detail page
- [x] Added "Committees" tab showing active and past assignments
- [x] Display role, committee name, type, center, dates, status

---

## PHASE 3: COMPLAINT MODULE - DATABASE - COMPLETED

### 3.1 Complaint Enums - COMPLETED
- [x] `ComplaintArticle` (ARTICLE_30, ARTICLE_31)
- [x] `ComplaintStatus` (all 10 statuses from flow)
- [x] `ComplaintFinding` (PENDING, GUILTY, NOT_GUILTY, GUILTY_NO_REBUTTAL)
- [x] `AppealDecision` (PENDING, UPHELD, MODIFIED, REVERSED)
- [x] `DecisionAuthority` (DIRECT_SUPERIOR, DISCIPLINE_COMMITTEE)
- [x] `ComplainantType` (EMPLOYEE, EXTERNAL, ANONYMOUS)
- [x] `ComplaintDocumentType` (INITIAL_EVIDENCE, REBUTTAL, COMMITTEE_REPORT, DECISION, APPEAL, OTHER)

### 3.2 Complaint Model - COMPLETED
- [x] `id` - UUID primary key
- [x] `tenantId` - tenant reference
- [x] `centerId` - center where registered
- [x] `complaintNumber` - auto-generated (CMP-XXXX/YY)
- [x] `article` - ARTICLE_30 or ARTICLE_31
- [x] `offenseCode` - string code matching JSON offense types (e.g., "ART30-001")
- [x] `accusedEmployeeId` - the accused employee
- [x] `complainantName` - name (can be anonymous)
- [x] `complainantType` - EMPLOYEE, EXTERNAL, ANONYMOUS
- [x] `complainantEmployeeId` - if internal (nullable)
- [x] `summary` - complaint description
- [x] `summaryAm` - Amharic description
- [x] `incidentDate` - when incident occurred
- [x] `incidentLocation` - where it happened
- [x] `registeredDate` - when registered
- [x] `registeredBy` - who registered
- [x] `status` - current status
- [x] `currentAssigneeId` - who is handling (HR officer, committee, etc.)

### 3.3 Article 30 Specific Fields - COMPLETED
- [x] `notificationDate` - when accused notified
- [x] `rebuttalDeadline` - 3 days from notification
- [x] `rebuttalReceivedDate` - when rebuttal came (null if none)
- [x] `rebuttalContent` - summary of rebuttal
- [x] `hasRebuttal` - boolean
- [x] `offenseOccurrence` - 1st, 2nd, 3rd... time for this offense
- [x] `severityLevel` - 1-7 (copied from offense type at registration)
- [x] `decisionAuthority` - DIRECT_SUPERIOR or DISCIPLINE_COMMITTEE (based on severity)
- [x] `superiorEmployeeId` - who makes decision (if Direct Superior)
- [x] `superiorDecisionDate` - when decided
- [x] `punishmentPercentage` - salary deduction %
- [x] `punishmentDescription` - text description

### 3.4 Article 31 Specific Fields - COMPLETED
- [x] `assignedCommitteeId` - which discipline committee
- [x] `committeeAssignedDate` - when assigned
- [x] `hqCommitteeId` - HQ committee (if forwarded)
- [x] `hqForwardedDate` - when forwarded to HQ

### 3.5 Finding and Decision Fields - COMPLETED
- [x] `finding` - GUILTY, NOT_GUILTY, PENDING, GUILTY_NO_REBUTTAL
- [x] `findingDate` - when finding made
- [x] `findingReason` - legal reasoning
- [x] `findingBy` - who made finding
- [x] `decisionDate` - when final decision made
- [x] `decisionBy` - who decided
- [x] `decisionDocumentPath` - uploaded decision

### 3.6 Closure Fields - COMPLETED
- [x] `closedDate` - when case closed
- [x] `closedBy` - who closed
- [x] `closureReason` - why closed
- [x] `createdAt`, `updatedAt`, `deletedAt`

### 3.7 ComplaintTimeline Model (Audit Trail) - COMPLETED
- [x] `id` - UUID
- [x] `complaintId` - reference
- [x] `action` - what happened (string)
- [x] `fromStatus` - previous status
- [x] `toStatus` - new status
- [x] `performedBy` - user who did it
- [x] `performedAt` - when
- [x] `notes` - additional info
- [x] `documentPath` - supporting document

### 3.8 ComplaintDocument Model - COMPLETED
- [x] `id`, `tenantId`, `complaintId`
- [x] `documentType` - INITIAL_EVIDENCE, REBUTTAL, COMMITTEE_REPORT, DECISION, APPEAL, OTHER
- [x] `title`, `description`
- [x] `filePath`, `fileName`, `fileSize`, `mimeType`
- [x] `uploadedBy`, `uploadedAt`
- [x] `deletedAt`

### 3.9 ComplaintAppeal Model - COMPLETED
- [x] `id`, `tenantId`, `complaintId`
- [x] `appealLevel` - 1 (Superior), 2 (Dept Head), 3 (Center Commander), 4 (Vice Commissioner)
- [x] `appealDate`, `appealReason`
- [x] `appealDocumentPath`
- [x] `reviewedBy`, `reviewedAt`
- [x] `decision` - UPHELD, MODIFIED, REVERSED
- [x] `decisionReason`
- [x] `newPunishment` - if modified
- [x] `decisionDocumentPath`

### 3.10 Run Migration - COMPLETED
- [x] Generate Prisma migration
- [x] Apply migration (20251226231303_add_complaint_module)
- [x] Regenerate Prisma client

---

## PHASE 4: COMPLAINT MODULE - BACKEND API - COMPLETED

### 4.1 Module Setup - COMPLETED
- [x] Create `complaints` module folder
- [x] Create `complaints.module.ts`
- [x] Register in `app.module.ts`

### 4.2 DTOs (with Swagger documentation) - COMPLETED
- [x] `create-complaint.dto.ts`
- [x] `record-notification.dto.ts` (Art 30)
- [x] `record-rebuttal.dto.ts` (Art 30)
- [x] `record-finding.dto.ts`
- [x] `record-decision.dto.ts` (Art 30)
- [x] `assign-committee.dto.ts` (Art 31)
- [x] `forward-to-hq.dto.ts` (Art 31)
- [x] `record-hq-decision.dto.ts` (Art 31)
- [x] `submit-appeal.dto.ts`
- [x] `record-appeal-decision.dto.ts`
- [x] `close-complaint.dto.ts`
- [x] `complaint-filter.dto.ts`
- [x] `complaint-response.dto.ts`

### 4.3 Service - Core Functions - COMPLETED
- [x] `complaints.service.ts`
- [x] `generateComplaintNumber()` - unique number per tenant
- [x] `create()` - register complaint (sets initial status by article)
- [x] `findAll()` - list with filters
- [x] `findOne()` - get with timeline
- [x] `getTimeline()` - get complaint history
- [x] `addTimelineEntry()` - helper for audit

### 4.4 Service - Article 30 Flow - COMPLETED
- [x] `recordNotification()` - set deadline, change to WAITING_FOR_REBUTTAL
- [x] `recordRebuttal()` - change to UNDER_HR_ANALYSIS
- [x] `markRebuttalDeadlinePassed()` - auto-guilty, AWAITING_SUPERIOR_DECISION
- [x] `recordFinding()` - record finding, move to next status
- [x] `recordDecision()` - record punishment, status DECIDED

### 4.5 Service - Article 31 Flow - COMPLETED
- [x] `assignCommittee()` - assign discipline committee
- [x] `forwardToHq()` - forward to HQ committee
- [x] `recordHqDecision()` - record HQ decision, status DECIDED_BY_HQ

### 4.6 Service - Common Functions - COMPLETED
- [x] `submitAppeal()` - create appeal record
- [x] `recordAppealDecision()` - record decision
- [x] `closeComplaint()` - mark CLOSED_FINAL or CLOSED_NO_LIABILITY
- [x] `getEmployeeComplaintHistory()` - all complaints for employee
- [x] `countPreviousOffenses()` - count previous offenses of same type

### 4.7 Service - Validation - COMPLETED
- [x] Validate status transitions
- [x] Validate article-specific operations
- [x] Prevent invalid state changes

### 4.8 Controller Endpoints (with Swagger documentation) - COMPLETED
- [x] `POST /complaints` - Register
- [x] `GET /complaints` - List
- [x] `GET /complaints/:id` - Detail
- [x] `GET /complaints/:id/timeline` - History
- [x] `PATCH /complaints/:id/notification` - Art 30
- [x] `PATCH /complaints/:id/rebuttal` - Art 30
- [x] `PATCH /complaints/:id/rebuttal-deadline-passed` - Art 30
- [x] `PATCH /complaints/:id/finding` - Both
- [x] `PATCH /complaints/:id/decision` - Art 30
- [x] `PATCH /complaints/:id/assign-committee` - Art 31
- [x] `PATCH /complaints/:id/forward-to-hq` - Art 31
- [x] `PATCH /complaints/:id/hq-decision` - Art 31
- [x] `POST /complaints/:id/appeals` - Submit appeal
- [x] `PATCH /complaints/:id/appeals/:appealId` - Appeal decision
- [x] `PATCH /complaints/:id/close` - Close
- [x] `GET /complaints/employee/:employeeId` - Employee history

### 4.9 Document Endpoints
- [ ] `POST /complaints/:id/documents` - Upload (TODO: Add later)
- [ ] `GET /complaints/:id/documents` - List (TODO: Add later)
- [ ] `GET /complaints/:id/documents/:docId/download` - Download (TODO: Add later)
- [ ] `DELETE /complaints/:id/documents/:docId` - Remove (TODO: Add later)

### 4.10 Permissions - COMPLETED
- [x] Add complaint permissions to seed
- [x] Add committee permissions to seed

---

## PHASE 5: COMPLAINT MODULE - FRONTEND

### 5.1 Types and API Layer
- [ ] Create `packages/web/src/types/complaint.ts`
- [ ] Create `packages/web/src/api/complaints/complaints.api.ts`
- [ ] Create `complaints.queries.ts`
- [ ] Create `complaints.mutations.ts`

### 5.2 Feature Structure
- [ ] Create `packages/web/src/features/complaints/`
- [ ] Subfolders: pages, components, hooks, schemas, constants

### 5.3 List and Registration
- [ ] `ComplaintsListPage.tsx` - main list with filters
- [ ] `RegisterComplaintPage.tsx` - register new complaint
- [ ] Employee search for accused
- [ ] Offense type selection (filtered by article)

### 5.4 Complaint Detail
- [ ] `ComplaintDetailPage.tsx` - full details
- [ ] Timeline display component
- [ ] Documents list component
- [ ] Status stepper/indicator

### 5.5 Article 30 Action Components
- [ ] `RecordNotificationDialog.tsx`
- [ ] `RecordRebuttalDialog.tsx`
- [ ] `RecordFindingDialog.tsx`
- [ ] `RecordSuperiorDecisionDialog.tsx`
- [ ] `SubmitAppealDialog.tsx`
- [ ] `RecordAppealDecisionDialog.tsx`

### 5.6 Article 31 Action Components
- [ ] `AssignCommitteeDialog.tsx`
- [ ] `RecordCommitteeFindingDialog.tsx`
- [ ] `ForwardToHqDialog.tsx`
- [ ] `RecordHqDecisionDialog.tsx`
- [ ] `SubmitAppealDialog.tsx` (reuse)
- [ ] `RecordAppealDecisionDialog.tsx` (reuse)

### 5.7 Common Components
- [ ] `ComplaintStatusBadge.tsx`
- [ ] `ComplaintStatusStepper.tsx` - visual workflow
- [ ] `ComplaintTimelineView.tsx`
- [ ] `ComplaintDocumentsList.tsx`
- [ ] `CloseComplaintDialog.tsx`

### 5.8 Navigation
- [ ] Add "Complaints" menu to sidebar
- [ ] "All Complaints" submenu
- [ ] "Register Complaint" submenu
- [ ] Configure routes

---

## PHASE 6: INTEGRATION AND TESTING

### 6.1 Employee Module Integration
- [ ] Add complaints tab to Employee Detail page
- [ ] Show complaint history summary
- [ ] Link to disciplinary records

### 6.2 Disciplinary Record Integration
- [ ] When complaint results in punishment, create DisciplinaryRecord
- [ ] Link DisciplinaryRecord to Complaint
- [ ] Set impactsAppraisal/impactsReward flags

### 6.3 Testing
- [ ] Test Article 30 complete flow
- [ ] Test Article 31 complete flow
- [ ] Test appeal flows
- [ ] Test document upload/download
- [ ] Test status transitions
- [ ] Test permissions

---

## PHASE 7: TRANSLATIONS (i18n)

### 7.1 English
- [ ] Add all complaint keys to en.json
- [ ] Status labels, form labels, messages

### 7.2 Amharic
- [ ] Add all complaint keys to am.json
- [ ] Use correct legal terminology

---

## Progress Tracking

| Phase | Description | Status | Completion % |
|-------|-------------|--------|--------------|
| Phase 0 | Employee DirectSuperior | **Completed** | 100% |
| Phase 1 | Offense Types Module | **Completed** | 100% |
| Phase 2 | Committee Module | **Completed** | 100% |
| Phase 3 | Complaint DB Schema | **Completed** | 100% |
| Phase 4 | Complaint Backend API | **Completed** | 95% |
| Phase 5 | Complaint Frontend | Not Started | 0% |
| Phase 6 | Integration & Testing | Not Started | 0% |
| Phase 7 | Translations | Not Started | 0% |

---

## Key Business Rules Summary

### Article 30 (Minor Complaints)
1. Handled at Center level by HR
2. Accused notified with **3-day rebuttal deadline**
3. **No rebuttal = automatic guilt assumption**
4. HR prepares findings and recommendations
5. **Decision Authority depends on severity level:**
   - Levels 1-4: **Direct Superior** decides punishment
   - Levels 5-7: **Center Discipline Committee** decides punishment
6. Appeals: Decision Maker -> Dept Head -> Center Commander (final)
7. Punishment: Salary deduction (3% to 100%) based on severity and occurrence
8. **Escalation to Article 31**: When punishment exceeds 100% or repeated severe offenses

### Article 31 (Serious Complaints)
1. HR only registers and forwards
2. **Discipline Committee handles everything**
3. Committee conducts investigation, hearings
4. Committee records findings
5. **Guilty cases go to HQ Discipline Committee**
6. HQ Committee decides punishment (demotion, termination, etc.)
7. Final appeal to **Vice Commissioner**

### Committees
1. Temporary assignments (not permanent jobs)
2. Employees can serve on multiple committees
3. Roles: Chairman, Secretary, Member
4. Membership appears on employee profiles

### Documents
1. Attachments only (no full DMS)
2. Types: Initial Evidence, Rebuttal, Committee Report, Decision, Appeal
3. All real-world documents must be uploaded

---

## Prisma Schema Summary (To Be Added)

### New Enums
```
ComplaintArticle: ARTICLE_30, ARTICLE_31
ComplaintStatus: (10 statuses)
ComplaintFinding: PENDING, GUILTY, NOT_GUILTY, GUILTY_NO_REBUTTAL
AppealDecision: PENDING, UPHELD, MODIFIED, REVERSED
DecisionAuthority: DIRECT_SUPERIOR, DISCIPLINE_COMMITTEE (for Article 30 based on severity)
CommitteeType: CENTER_DISCIPLINE, HQ_DISCIPLINE
CommitteeMemberRole: CHAIRMAN, SECRETARY, MEMBER
ComplainantType: EMPLOYEE, EXTERNAL, ANONYMOUS
```

### New Models
```
Committee - Discipline committees (Center and HQ level)
CommitteeMember - Committee membership assignments
Complaint - Main complaint record (stores offenseCode as string, not FK)
ComplaintTimeline - Audit trail
ComplaintDocument - Attachments
ComplaintAppeal - Appeal records
```

### Employee Model Addition
```
directSuperiorId: String? (self-reference)
directSuperior: Employee? (relation)
subordinates: Employee[] (reverse relation)
```

### Frontend Static Data (No DB)
```
offense-types.ts - 78 offense types as TypeScript constants
  - 46 Article 30 offenses with punishment scales
  - 32 Article 31 offenses (no punishment scale)
```

---

**Created**: 2025-12-26
**Last Updated**: 2025-12-27

---

## Current Status

**Completed**: Phase 0 (DirectSuperior), Phase 1 (Offense Types), Phase 2 (Committee Module), Phase 3 (Complaint DB Schema), Phase 4 (Complaint Backend API - 95%)

**Next Step**: Phase 5 - Create Complaint Frontend (Types, API layer, pages, components)
