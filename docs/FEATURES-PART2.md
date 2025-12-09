# EPPMS Feature Specifications - Part 2 (Updated)

## Modules 9-16: Retirement, Rewards, Complaints, Documents, Reports, Audit, Users & Roles, Dashboard

---

# Module 9: Retirement Management

## 9.1 Retirement Eligibility Rules

### 9.1.1 Age-Based Retirement by Rank
- 9.1.1.1 Rank Group 1: ኮንስታብል to ዋና ሳጅን (Constable to Chief Sergeant)
  - 9.1.1.1.1 Retirement Age: 50 years
  - 9.1.1.1.2 Applicable Ranks: Levels 1-5
  - 9.1.1.1.3 Auto-calculation from Date of Birth
  - 9.1.1.1.4 Warning at 6 months before
  - 9.1.1.1.5 Notification at 3 months before
  - 9.1.1.1.6 Mandatory at exact date
- 9.1.1.2 Rank Group 2: ረዳት ኢንስፔክተር to ኢንስፔክተር (Assistant Inspector to Inspector)
  - 9.1.1.2.1 Retirement Age: 52 years
  - 9.1.1.2.2 Applicable Ranks: Levels 6-8
  - 9.1.1.2.3 Auto-calculation from Date of Birth
  - 9.1.1.2.4 Warning at 6 months before
  - 9.1.1.2.5 Notification at 3 months before
  - 9.1.1.2.6 Mandatory at exact date
- 9.1.1.3 Rank Group 3: ዋና ኢንስፔክተር to ኮሚሽነር ጀነራል (Chief Inspector and Above)
  - 9.1.1.3.1 Retirement Age: 55 years
  - 9.1.1.3.2 Applicable Ranks: Levels 9-16
  - 9.1.1.3.3 Auto-calculation from Date of Birth
  - 9.1.1.3.4 Warning at 6 months before
  - 9.1.1.3.5 Notification at 3 months before
  - 9.1.1.3.6 Mandatory at exact date

### 9.1.2 Retirement Age Summary Table
- 9.1.2.1 Level 1-5 (Enlisted/NCO Lower): Age 50
  - ኮንስታብል (Constable)
  - ረዳት ሳጅን (Assistant Sergeant)
  - ምክትል ሳጅን (Deputy Sergeant)
  - ሳጅን (Sergeant)
  - ዋና ሳጅን (Chief Sergeant)
- 9.1.2.2 Level 6-8 (NCO Upper/Junior Officer): Age 52
  - ረዳት ኢንስፔክተር (Assistant Inspector)
  - ምክትል ኢንስፔክተር (Deputy Inspector)
  - ኢንስፔክተር (Inspector)
- 9.1.2.3 Level 9-16 (Senior Officer/Command): Age 55
  - ዋና ኢንስፔክተር (Chief Inspector)
  - ምክትል ኮማንደር (Deputy Commander)
  - ኮማንደር (Commander)
  - ረዳት ኮሚሽነር (Assistant Commissioner)
  - ምክትል ኮሚሽነር (Deputy Commissioner)
  - ኮሚሽነር (Commissioner)
  - ም/ኮሚ/ጀነራል (Deputy Commissioner General)
  - ኮሚሽነር ጀነራል (Commissioner General)

### 9.1.3 Retirement Calculation Logic
- 9.1.3.1 Data Source
  - 9.1.3.1.1 Use Date of Birth from Registration Form
  - 9.1.3.1.2 DOB entered at initial employment
  - 9.1.3.1.3 Cannot be changed after registration
  - 9.1.3.1.4 Ethiopian Calendar to Gregorian conversion
  - 9.1.3.1.5 Verified during registration
  - 9.1.3.1.6 Audit trail for any corrections
- 9.1.3.2 Calculation Formula
  - 9.1.3.2.1 Get Employee DOB
  - 9.1.3.2.2 Get Current Rank
  - 9.1.3.2.3 Determine Retirement Age based on Rank Group
  - 9.1.3.2.4 Calculate Retirement Date = DOB + Retirement Age
  - 9.1.3.2.5 Check if Rank Changes (recalculate)
  - 9.1.3.2.6 Handle Edge Cases (promotion near retirement)

---

## 9.2 Retirement Dashboard

### 9.2.1 Upcoming Retirements View
- 9.2.1.1 Filter Options
  - 9.2.1.1.1 Within 6 Months
  - 9.2.1.1.2 Within 1 Year
  - 9.2.1.1.3 Within 2 Years
  - 9.2.1.1.4 By Department
  - 9.2.1.1.5 By Rank Group
  - 9.2.1.1.6 By Center
- 9.2.1.2 List Display
  - 9.2.1.2.1 Employee Photo & Name
  - 9.2.1.2.2 Employee ID
  - 9.2.1.2.3 Current Rank
  - 9.2.1.2.4 Date of Birth
  - 9.2.1.2.5 Retirement Date
  - 9.2.1.2.6 Days Remaining

### 9.2.2 Retirement Statistics
- 9.2.2.1 Summary Cards
  - 9.2.2.1.1 Retiring This Month
  - 9.2.2.1.2 Retiring This Quarter
  - 9.2.2.1.3 Retiring This Year
  - 9.2.2.1.4 By Rank Group Chart
  - 9.2.2.1.5 By Department Chart
  - 9.2.2.1.6 By Center Chart

---

## 9.3 Retirement Processing

### 9.3.1 Initiate Retirement
- 9.3.1.1 Auto-Initiation
  - 9.3.1.1.1 System Auto-Initiates at 3 Months Before
  - 9.3.1.1.2 Create Retirement Record
  - 9.3.1.1.3 Notify HR Manager
  - 9.3.1.1.4 Notify Department Head
  - 9.3.1.1.5 Notify Employee
  - 9.3.1.1.6 Generate Retirement Checklist
- 9.3.1.2 Manual Initiation (Early/Voluntary)
  - 9.3.1.2.1 Employee Request
  - 9.3.1.2.2 Medical Retirement
  - 9.3.1.2.3 Service-Based Retirement
  - 9.3.1.2.4 Approval Required
  - 9.3.1.2.5 Documentation Required
  - 9.3.1.2.6 Effective Date Selection

### 9.3.2 Retirement Checklist
- 9.3.2.1 HR Tasks
  - 9.3.2.1.1 Verify Service Records
  - 9.3.2.1.2 Calculate Service Years
  - 9.3.2.1.3 Prepare Service Certificate
  - 9.3.2.1.4 Calculate Leave Balance Payout
  - 9.3.2.1.5 Prepare Final Settlement
  - 9.3.2.1.6 Archive Employee Records
- 9.3.2.2 Department Tasks
  - 9.3.2.2.1 Knowledge Transfer Plan
  - 9.3.2.2.2 Handover Documentation
  - 9.3.2.2.3 Replacement Planning
  - 9.3.2.2.4 Project Transition
  - 9.3.2.2.5 Access Removal Date
  - 9.3.2.2.6 Final Performance Note
- 9.3.2.3 Inventory Tasks (Auto-Check)
  - 9.3.2.3.1 List All Assigned Items
  - 9.3.2.3.2 Weapons Return Status
  - 9.3.2.3.3 Equipment Return Status
  - 9.3.2.3.4 Uniform Return Status
  - 9.3.2.3.5 ID Card Collection
  - 9.3.2.3.6 Keys/Access Cards Return
- 9.3.2.4 Finance Tasks
  - 9.3.2.4.1 Final Salary Calculation
  - 9.3.2.4.2 Outstanding Advances
  - 9.3.2.4.3 Leave Encashment
  - 9.3.2.4.4 Pension Calculation
  - 9.3.2.4.5 Gratuity Calculation
  - 9.3.2.4.6 Final Payment Processing

### 9.3.3 Clearance Workflow
- 9.3.3.1 Clearance Departments
  - 9.3.3.1.1 HR Department
  - 9.3.3.1.2 Finance Department
  - 9.3.3.1.3 Inventory/Armory
  - 9.3.3.1.4 IT Department
  - 9.3.3.1.5 Own Department
  - 9.3.3.1.6 Security Department
- 9.3.3.2 Clearance Status
  - 9.3.3.2.1 Pending
  - 9.3.3.2.2 Cleared
  - 9.3.3.2.3 Issues Pending
  - 9.3.3.2.4 Waived (with approval)
  - 9.3.3.2.5 Overall Status
  - 9.3.3.2.6 Block Retirement Until Clear

### 9.3.4 Retirement Completion
- 9.3.4.1 Final Actions
  - 9.3.4.1.1 All Clearances Complete
  - 9.3.4.1.2 Generate Retirement Order
  - 9.3.4.1.3 Update Employee Status to "Retired"
  - 9.3.4.1.4 Deactivate System Access
  - 9.3.4.1.5 Archive to Retired Employees
  - 9.3.4.1.6 Issue Retirement Certificate
- 9.3.4.2 Post-Retirement Access
  - 9.3.4.2.1 View-Only Access to Own Records
  - 9.3.4.2.2 Download Service Certificate
  - 9.3.4.2.3 Download Pension Documents
  - 9.3.4.2.4 Limited Time Access
  - 9.3.4.2.5 Contact HR Option
  - 9.3.4.2.6 Feedback Submission

---

## 9.4 Retirement Reports

### 9.4.1 Report Types
- 9.4.1.1 Upcoming Retirements Report
- 9.4.1.2 Retired Employees Report
- 9.4.1.3 Retirement by Department
- 9.4.1.4 Retirement by Rank
- 9.4.1.5 Early Retirement Analysis
- 9.4.1.6 Retirement Trends

### 9.4.2 Export Options
- 9.4.2.1 PDF Format
- 9.4.2.2 Excel Format
- 9.4.2.3 Print Option
- 9.4.2.4 Email Report
- 9.4.2.5 Scheduled Reports
- 9.4.2.6 Custom Date Range

---

# Module 10: Service Rewards

## 10.1 Reward Milestones

### 10.1.1 Service Year Milestones
- 10.1.1.1 5 Years of Service
- 10.1.1.2 10 Years of Service
- 10.1.1.3 15 Years of Service
- 10.1.1.4 20 Years of Service
- 10.1.1.5 25 Years of Service
- 10.1.1.6 30+ Years of Service

### 10.1.2 Milestone Rewards
- 10.1.2.1 Certificate of Service
- 10.1.2.2 Service Medal/Badge
- 10.1.2.3 Monetary Bonus
- 10.1.2.4 Additional Leave Days
- 10.1.2.5 Recognition Ceremony
- 10.1.2.6 Special Benefits

---

## 10.2 Reward Eligibility

### 10.2.1 Eligibility Criteria
- 10.2.1.1 Continuous Service
- 10.2.1.2 Good Standing Status
- 10.2.1.3 No Active Disciplinary Issues
- 10.2.1.4 Performance Requirements
- 10.2.1.5 Attendance Requirements
- 10.2.1.6 Department Head Recommendation

### 10.2.2 Disqualification Rules (CRITICAL)
- 10.2.2.1 Article 31 Violation
  - 10.2.2.1.1 Active Article 31 = NOT ELIGIBLE
  - 10.2.2.1.2 Automatic Disqualification
  - 10.2.2.1.3 System Auto-Check
  - 10.2.2.1.4 No Override Allowed
  - 10.2.2.1.5 Notification to HR
  - 10.2.2.1.6 Record in Reward History
- 10.2.2.2 Under Investigation
  - 10.2.2.2.1 If Under Investigation = REWARD POSTPONED
  - 10.2.2.2.2 Extension: 2 Years
  - 10.2.2.2.3 Until Name is Cleared
  - 10.2.2.2.4 Investigation Status Check
  - 10.2.2.2.5 Automatic Extension
  - 10.2.2.2.6 Resume After Clearance
- 10.2.2.3 Investigation Clearance Process
  - 10.2.2.3.1 Investigation Completed
  - 10.2.2.3.2 Employee Cleared (No Fault)
  - 10.2.2.3.3 Eligibility Restored
  - 10.2.2.3.4 Backdate Reward Consideration
  - 10.2.2.3.5 HR Manual Review
  - 10.2.2.3.6 Approval Required

### 10.2.3 Eligibility Check Flow
```
1. Calculate Service Years
2. Check if Milestone Reached
3. Check Disciplinary Records:
   - Article 31 Active? → DISQUALIFIED (Stop)
   - Under Investigation? → POSTPONE 2 Years (Wait)
   - Article 30 Active? → Review Required
4. Check Performance Score
5. Check Attendance Record
6. If All Clear → ELIGIBLE for Reward
```

---

## 10.3 Reward Processing

### 10.3.1 Eligible Employees List
- 10.3.1.1 Auto-Generated Monthly
- 10.3.1.2 Filter by Milestone Year
- 10.3.1.3 Eligibility Status Badge
- 10.3.1.4 Disqualification Reason (if any)
- 10.3.1.5 Postponed List (Under Investigation)
- 10.3.1.6 Export for Ceremony Planning

### 10.3.2 Reward Issuance
- 10.3.2.1 Select Eligible Employee
- 10.3.2.2 Select Reward Type
- 10.3.2.3 Issue Date
- 10.3.2.4 Presented By
- 10.3.2.5 Ceremony Details
- 10.3.2.6 Photo Upload (Ceremony)

### 10.3.3 Reward History
- 10.3.3.1 Employee Reward Timeline
- 10.3.3.2 All Rewards Received
- 10.3.3.3 Postponed Rewards
- 10.3.3.4 Disqualified Records
- 10.3.3.5 Certificate Downloads
- 10.3.3.6 Photo Gallery

---

# Module 11: Complaint Management

## 11.1 Complaint Types

### 11.1.1 Type Configuration
- 11.1.1.1 Grievance
- 11.1.1.2 Harassment
- 11.1.1.3 Discrimination
- 11.1.1.4 Work Conditions
- 11.1.1.5 Policy Violation
- 11.1.1.6 Other/Custom Types

### 11.1.2 Priority Levels
- 11.1.2.1 Low
- 11.1.2.2 Medium
- 11.1.2.3 High
- 11.1.2.4 Critical
- 11.1.2.5 SLA per Priority
- 11.1.2.6 Escalation Rules

---

## 11.2 Complaint Workflow

### 11.2.1 Submit Complaint
- 11.2.1.1 Complaint Type Selection
- 11.2.1.2 Subject
- 11.2.1.3 Detailed Description
- 11.2.1.4 Against (Person/Department/Policy)
- 11.2.1.5 Supporting Documents
- 11.2.1.6 Anonymous Option

### 11.2.2 Complaint Processing
- 11.2.2.1 Auto-Assignment
- 11.2.2.2 Initial Review
- 11.2.2.3 Investigation
- 11.2.2.4 Evidence Collection
- 11.2.2.5 Witness Statements
- 11.2.2.6 Resolution Proposal

### 11.2.3 Complaint Resolution
- 11.2.3.1 Resolution Options
- 11.2.3.2 Action Taken
- 11.2.3.3 Complainant Notification
- 11.2.3.4 Appeal Option
- 11.2.3.5 Case Closure
- 11.2.3.6 Satisfaction Survey

---

## 11.3 Investigation Tracking

### 11.3.1 Investigation Status
- 11.3.1.1 Not Started
- 11.3.1.2 In Progress
- 11.3.1.3 Evidence Gathering
- 11.3.1.4 Review Stage
- 11.3.1.5 Decision Pending
- 11.3.1.6 Completed

### 11.3.2 Link to Rewards (CRITICAL)
- 11.3.2.1 Employee Under Investigation
- 11.3.2.2 Auto-Flag in Rewards Module
- 11.3.2.3 Postpone Any Pending Rewards
- 11.3.2.4 2-Year Extension Applied
- 11.3.2.5 Cleared → Resume Eligibility
- 11.3.2.6 Found Guilty → Apply Article 30/31

---

# Module 12: Document Tracking

## 12.1 Document Types

### 12.1.1 Incoming Documents
- 12.1.1.1 Letters
- 12.1.1.2 Memos
- 12.1.1.3 Directives
- 12.1.1.4 Reports
- 12.1.1.5 Requests
- 12.1.1.6 External Correspondence

### 12.1.2 Outgoing Documents
- 12.1.2.1 Letters
- 12.1.2.2 Responses
- 12.1.2.3 Reports
- 12.1.2.4 Directives
- 12.1.2.5 Approvals
- 12.1.2.6 External Correspondence

---

## 12.2 Document Registration

### 12.2.1 Register Incoming
- 12.2.1.1 Document Reference Number (Auto)
- 12.2.1.2 Date Received
- 12.2.1.3 Source Organization
- 12.2.1.4 Subject
- 12.2.1.5 Document Type
- 12.2.1.6 Priority

### 12.2.2 Register Outgoing
- 12.2.2.1 Document Reference Number (Auto)
- 12.2.2.2 Date Sent
- 12.2.2.3 Destination Organization
- 12.2.2.4 Subject
- 12.2.2.5 Document Type
- 12.2.2.6 Prepared By

### 12.2.3 Document Details
- 12.2.3.1 Upload Scanned Copy
- 12.2.3.2 Summary/Abstract
- 12.2.3.3 Related Documents
- 12.2.3.4 Action Required
- 12.2.3.5 Deadline
- 12.2.3.6 Assigned To

---

## 12.3 Document Workflow

### 12.3.1 Routing
- 12.3.1.1 Initial Receipt
- 12.3.1.2 Route to Department
- 12.3.1.3 Route to Person
- 12.3.1.4 Tracking Status
- 12.3.1.5 Response Required
- 12.3.1.6 Archive

### 12.3.2 Document Actions
- 12.3.2.1 View Document
- 12.3.2.2 Download
- 12.3.2.3 Print
- 12.3.2.4 Forward
- 12.3.2.5 Respond
- 12.3.2.6 Archive

---

## 12.4 Document Officer Role

### 12.4.1 Responsibilities
- 12.4.1.1 Register Incoming Documents
- 12.4.1.2 Register Outgoing Documents
- 12.4.1.3 Track Document Status
- 12.4.1.4 Route to Appropriate Person
- 12.4.1.5 Maintain Document Log
- 12.4.1.6 Generate Reports

### 12.4.2 Access Limitations
- 12.4.2.1 ONLY Document Module Access
- 12.4.2.2 No Access to Employee Records
- 12.4.2.3 No Access to Leave Module
- 12.4.2.4 No Access to Salary Module
- 12.4.2.5 No Access to Appraisal Module
- 12.4.2.6 View Own Profile Only

---

# Module 13: Reports & Analytics

## 13.1 Dashboard Reports

### 13.1.1 Executive Dashboard (Commissioner/Vice Commissioner)
- 13.1.1.1 Total Employee Count
- 13.1.1.2 Employees by Type (Military/Civilian/Temp)
- 13.1.1.3 Employees by Department
- 13.1.1.4 Employees by Rank
- 13.1.1.5 Attendance Overview
- 13.1.1.6 Leave Overview

### 13.1.2 Key Metrics
- 13.1.2.1 Active vs Inactive Employees
- 13.1.2.2 Gender Distribution
- 13.1.2.3 Age Distribution
- 13.1.2.4 Service Years Distribution
- 13.1.2.5 Education Level Distribution
- 13.1.2.6 Upcoming Retirements

### 13.1.3 Trend Analysis
- 13.1.3.1 Hiring Trends
- 13.1.3.2 Retirement Trends
- 13.1.3.3 Promotion Trends
- 13.1.3.4 Leave Utilization Trends
- 13.1.3.5 Attendance Trends
- 13.1.3.6 Disciplinary Trends

---

## 13.2 Standard Reports

### 13.2.1 Employee Reports
- 13.2.1.1 Employee Directory
- 13.2.1.2 Employees by Department
- 13.2.1.3 Employees by Rank
- 13.2.1.4 New Employees
- 13.2.1.5 Employee Turnover
- 13.2.1.6 Birthday List

### 13.2.2 Leave Reports
- 13.2.2.1 Leave Balance Report
- 13.2.2.2 Leave Utilization Report
- 13.2.2.3 Leave by Type
- 13.2.2.4 Leave Expiry Report
- 13.2.2.5 Absent Employees
- 13.2.2.6 Leave Trends

### 13.2.3 Salary Reports
- 13.2.3.1 Salary Summary
- 13.2.3.2 Salary by Rank
- 13.2.3.3 Increment Due Report
- 13.2.3.4 Salary Comparison
- 13.2.3.5 Payroll Summary
- 13.2.3.6 Salary History

### 13.2.4 Attendance Reports
- 13.2.4.1 Daily Attendance
- 13.2.4.2 Monthly Attendance
- 13.2.4.3 Late Report
- 13.2.4.4 Overtime Report
- 13.2.4.5 Absenteeism Report
- 13.2.4.6 Shift Coverage

---

## 13.3 Report Builder

### 13.3.1 Custom Reports
- 13.3.1.1 Select Data Source
- 13.3.1.2 Select Fields
- 13.3.1.3 Apply Filters
- 13.3.1.4 Set Grouping
- 13.3.1.5 Set Sorting
- 13.3.1.6 Save Report Template

### 13.3.2 Export Options
- 13.3.2.1 PDF Export
- 13.3.2.2 Excel Export
- 13.3.2.3 CSV Export
- 13.3.2.4 Print
- 13.3.2.5 Email Report
- 13.3.2.6 Schedule Report

---

# Module 14: Audit Log System

## 14.1 Audit Events

### 14.1.1 Authentication Events
- 14.1.1.1 Login Success
- 14.1.1.2 Login Failure
- 14.1.1.3 Logout
- 14.1.1.4 Password Change
- 14.1.1.5 Password Reset Request
- 14.1.1.6 Session Timeout

### 14.1.2 Data Events
- 14.1.2.1 Record Created
- 14.1.2.2 Record Updated
- 14.1.2.3 Record Deleted
- 14.1.2.4 Record Viewed (Sensitive)
- 14.1.2.5 Bulk Operations
- 14.1.2.6 Data Export

### 14.1.3 Workflow Events
- 14.1.3.1 Approval Actions
- 14.1.3.2 Rejection Actions
- 14.1.3.3 Status Changes
- 14.1.3.4 Assignment Changes
- 14.1.3.5 Escalations
- 14.1.3.6 Cancellations

### 14.1.4 System Events
- 14.1.4.1 Configuration Changes
- 14.1.4.2 Role/Permission Changes
- 14.1.4.3 User Account Changes
- 14.1.4.4 System Settings Changes
- 14.1.4.5 Integration Events
- 14.1.4.6 Error Events

---

## 14.2 Audit Data Captured

### 14.2.1 Event Details
- 14.2.1.1 Event ID (Unique)
- 14.2.1.2 Event Type
- 14.2.1.3 Event Timestamp (Precise)
- 14.2.1.4 Event Description
- 14.2.1.5 Module/Entity
- 14.2.1.6 Record ID

### 14.2.2 Actor Details
- 14.2.2.1 User ID
- 14.2.2.2 User Name
- 14.2.2.3 User Role
- 14.2.2.4 User Department
- 14.2.2.5 User Center
- 14.2.2.6 Acting on Behalf Of (if delegated)

### 14.2.3 Context Details
- 14.2.3.1 IP Address
- 14.2.3.2 Browser/User Agent
- 14.2.3.3 Device Type
- 14.2.3.4 Operating System
- 14.2.3.5 Session ID
- 14.2.3.6 Request ID (Correlation)

### 14.2.4 Change Details
- 14.2.4.1 Previous Value (JSON)
- 14.2.4.2 New Value (JSON)
- 14.2.4.3 Changed Fields List
- 14.2.4.4 Change Reason (if provided)
- 14.2.4.5 Approval Reference
- 14.2.4.6 Related Records

---

## 14.3 Audit Viewer

### 14.3.1 Search & Filter
- 14.3.1.1 Date Range
- 14.3.1.2 Event Type
- 14.3.1.3 User
- 14.3.1.4 Module
- 14.3.1.5 Record ID
- 14.3.1.6 IP Address

### 14.3.2 Audit Log Table
- 14.3.2.1 Timestamp
- 14.3.2.2 User
- 14.3.2.3 Action
- 14.3.2.4 Module
- 14.3.2.5 Details Preview
- 14.3.2.6 View Full Details

### 14.3.3 Audit Detail View
- 14.3.3.1 Full Event Details
- 14.3.3.2 Before/After Comparison
- 14.3.3.3 Side-by-Side Diff View
- 14.3.3.4 Related Audit Entries
- 14.3.3.5 Actor Profile Link
- 14.3.3.6 Export Single Entry

---

## 14.4 Audit Reports

### 14.4.1 Security Reports
- 14.4.1.1 Login Activity Report
- 14.4.1.2 Failed Login Attempts
- 14.4.1.3 Unusual Activity Report
- 14.4.1.4 Access by IP Report
- 14.4.1.5 After Hours Access
- 14.4.1.6 Sensitive Data Access

### 14.4.2 Compliance Reports
- 14.4.2.1 User Activity Summary
- 14.4.2.2 Data Modification Report
- 14.4.2.3 Approval Actions Report
- 14.4.2.4 Configuration Changes
- 14.4.2.5 Data Export Log
- 14.4.2.6 Full Audit Trail by Entity

### 14.4.3 Accountability
- 14.4.3.1 Track Who Did What
- 14.4.3.2 Track When It Was Done
- 14.4.3.3 Track From Where
- 14.4.3.4 Track What Changed
- 14.4.3.5 Cannot Be Modified
- 14.4.3.6 Long-term Retention

---

# Module 15: User & Role Management

## 15.1 User Types & Hierarchy

### 15.1.1 System Users (No Employees in System)
- 15.1.1.1 Only HR Staff Use System
- 15.1.1.2 Higher Management Team
- 15.1.1.3 IT Administrators
- 15.1.1.4 Document Officers
- 15.1.1.5 Center-Based Access
- 15.1.1.6 Role-Based Permissions

### 15.1.2 User Hierarchy
```
HEADQUARTERS (HQ)
├── Commissioner (ኮሚሽነር)
│   └── View stats, reports, dashboards for decision making
├── Vice Commissioner (ም/ኮሚሽነር)
│   └── View stats, reports, dashboards for decision making
├── Department Head Commissioners
│   └── View department-specific data
├── HQ HR Manager
│   ├── Full HR access for all centers
│   ├── Create users for centers
│   └── Manage HR officers
├── HQ HR Officers
│   └── Day-to-day HR activities for HQ
├── IT Administrator
│   ├── Create/manage users
│   ├── Reset passwords
│   ├── Assign roles
│   └── Organization settings
└── Document Officers
    └── Document module only

CENTERS
├── Center Commander
│   ├── View center reports
│   └── Approve center requests
├── Center HR Manager
│   ├── HR access for own center
│   └── Manage center HR officers
├── Center HR Officers
│   └── Day-to-day HR for center
└── Center Document Officers
    └── Document module only
```

---

## 15.2 Role Definitions

### 15.2.1 Commissioner Role
- 15.2.1.1 Access Level: View Only
- 15.2.1.2 Dashboard: Executive Dashboard
- 15.2.1.3 Reports: All organizational reports
- 15.2.1.4 Statistics: Full organization stats
- 15.2.1.5 Decision Support Data
- 15.2.1.6 No Data Modification

### 15.2.2 Vice Commissioner Role
- 15.2.2.1 Access Level: View Only
- 15.2.2.2 Dashboard: Executive Dashboard
- 15.2.2.3 Reports: All organizational reports
- 15.2.2.4 Statistics: Full organization stats
- 15.2.2.5 Decision Support Data
- 15.2.2.6 No Data Modification

### 15.2.3 Department Head Commissioner Role
- 15.2.3.1 Access Level: View Own Department
- 15.2.3.2 Dashboard: Department Dashboard
- 15.2.3.3 Reports: Department reports
- 15.2.3.4 Statistics: Department stats
- 15.2.3.5 Approve Department Requests
- 15.2.3.6 Limited Data Modification

### 15.2.4 IT Administrator Role
- 15.2.4.1 User Management: Full Access
- 15.2.4.2 Role Assignment: Full Access
- 15.2.4.3 Password Reset: All Users
- 15.2.4.4 Organization Settings: Full Access
- 15.2.4.5 System Configuration: Full Access
- 15.2.4.6 Audit Log Viewing: Full Access
- 15.2.4.7 NO Access to: Employee Personal Data, Salary Details, Appraisal Records

### 15.2.5 HQ HR Manager Role
- 15.2.5.1 Employee Management: All Centers
- 15.2.5.2 Leave Management: All Centers
- 15.2.5.3 Appraisal Management: All Centers
- 15.2.5.4 Salary Management: All Centers
- 15.2.5.5 Create Center HR Users
- 15.2.5.6 Transfer Approvals

### 15.2.6 Center HR Manager Role
- 15.2.6.1 Employee Management: Own Center Only
- 15.2.6.2 Leave Management: Own Center Only
- 15.2.6.3 Appraisal Management: Own Center Only
- 15.2.6.4 Salary Viewing: Own Center Only
- 15.2.6.5 Manage Center HR Officers
- 15.2.6.6 Request Transfers to HQ

### 15.2.7 HR Officer Role
- 15.2.7.1 Employee Registration (as per center)
- 15.2.7.2 Leave Request Processing
- 15.2.7.3 Attendance Recording
- 15.2.7.4 Basic Data Entry
- 15.2.7.5 Report Generation (Limited)
- 15.2.7.6 No User Management

### 15.2.8 Center Commander Role
- 15.2.8.1 View Center Dashboard
- 15.2.8.2 View Center Reports
- 15.2.8.3 Approve Center Requests
- 15.2.8.4 View Center Statistics
- 15.2.8.5 No Data Modification
- 15.2.8.6 Transfer Initiation

### 15.2.9 Document Officer Role
- 15.2.9.1 Document Module: Full Access
- 15.2.9.2 Register Incoming/Outgoing
- 15.2.9.3 Track Documents
- 15.2.9.4 Generate Document Reports
- 15.2.9.5 NO Access to Any Other Module
- 15.2.9.6 View Own Profile Only

---

## 15.3 User Management

### 15.3.1 Create User
- 15.3.1.1 User ID (Auto-generated)
- 15.3.1.2 Full Name
- 15.3.1.3 Employee ID (Link to Employee Record)
- 15.3.1.4 Email
- 15.3.1.5 Phone
- 15.3.1.6 Initial Password (Temporary)

### 15.3.2 User Details
- 15.3.2.1 Center Assignment
- 15.3.2.2 Department Assignment
- 15.3.2.3 Role Assignment (Multiple)
- 15.3.2.4 Status (Active/Inactive/Locked)
- 15.3.2.5 Last Login
- 15.3.2.6 Login History

### 15.3.3 User Actions
- 15.3.3.1 Edit User
- 15.3.3.2 Reset Password
- 15.3.3.3 Lock Account
- 15.3.3.4 Unlock Account
- 15.3.3.5 Deactivate User
- 15.3.3.6 View Audit Trail

---

## 15.4 Password Management

### 15.4.1 Password Reset Process
- 15.4.1.1 User Cannot Reset Own Password Online
- 15.4.1.2 Must Go to IT Admin Office
- 15.4.1.3 IT Admin Verifies Identity
- 15.4.1.4 IT Admin Resets Password
- 15.4.1.5 Temporary Password Issued
- 15.4.1.6 Must Change on First Login

### 15.4.2 Password Policies
- 15.4.2.1 Minimum Length: 8 Characters
- 15.4.2.2 Require Uppercase
- 15.4.2.3 Require Lowercase
- 15.4.2.4 Require Number
- 15.4.2.5 Require Special Character
- 15.4.2.6 Password Expiry: 90 Days

### 15.4.3 Account Security
- 15.4.3.1 Lock After 5 Failed Attempts
- 15.4.3.2 IT Admin Unlock Required
- 15.4.3.3 Session Timeout: 30 Minutes
- 15.4.3.4 Single Session Only
- 15.4.3.5 IP Logging
- 15.4.3.6 Suspicious Activity Alert

---

## 15.5 Role-Based Access Control

### 15.5.1 Permission Categories
- 15.5.1.1 View Permissions
- 15.5.1.2 Create Permissions
- 15.5.1.3 Edit Permissions
- 15.5.1.4 Delete Permissions
- 15.5.1.5 Approve Permissions
- 15.5.1.6 Export Permissions

### 15.5.2 Module Permissions Matrix
```
Module          | Commr | IT Admin | HQ HR Mgr | Ctr HR Mgr | HR Officer | Doc Officer
----------------|-------|----------|-----------|------------|------------|------------
Dashboard       | View  | Config   | View      | View (Ctr) | View (Own) | None
Employees       | View  | None     | Full      | Own Ctr    | Limited    | None
Leave           | View  | None     | Full      | Own Ctr    | Process    | None
Appraisal       | View  | None     | Full      | Own Ctr    | View       | None
Salary          | View  | None     | Full      | View Ctr   | None       | None
Attendance      | View  | None     | Full      | Own Ctr    | Full       | None
Inventory       | View  | None     | Full      | Own Ctr    | View       | None
Documents       | None  | None     | View      | View       | View       | Full
Reports         | Full  | Config   | Full      | Own Ctr    | Limited    | Doc Only
Users           | None  | Full     | Limited   | None       | None       | None
Settings        | None  | Full     | Limited   | None       | None       | None
Audit           | View  | Full     | View      | View Ctr   | Own Only   | Own Only
```

### 15.5.3 Data Scope
- 15.5.3.1 Organization Wide (Commissioner, HQ HR)
- 15.5.3.2 Center Specific (Center Staff)
- 15.5.3.3 Department Specific (Dept Heads)
- 15.5.3.4 Own Records Only (Individual)
- 15.5.3.5 No Data Access (IT Admin for sensitive)
- 15.5.3.6 Module Specific (Document Officer)

---

# Module 16: Organization Settings

## 16.1 General Settings

### 16.1.1 Organization Profile
- 16.1.1.1 Organization Name (English)
- 16.1.1.2 Organization Name (Amharic)
- 16.1.1.3 Logo Upload
- 16.1.1.4 Address
- 16.1.1.5 Contact Information
- 16.1.1.6 Website

### 16.1.2 System Settings
- 16.1.2.1 Default Language
- 16.1.2.2 Date Format (Ethiopian/Gregorian)
- 16.1.2.3 Currency (ETB)
- 16.1.2.4 Timezone
- 16.1.2.5 Fiscal Year Start
- 16.1.2.6 Working Days Configuration

---

## 16.2 Lookup Tables (Admin Managed)

### 16.2.1 Address Lookups
- 16.2.1.1 Regions
- 16.2.1.2 Sub-Cities
- 16.2.1.3 Woredas
- 16.2.1.4 Cascading Management
- 16.2.1.5 Bulk Import
- 16.2.1.6 Used Across All Modules

### 16.2.2 Employee Lookups
- 16.2.2.1 Military Ranks
- 16.2.2.2 Education Levels
- 16.2.2.3 Relationship Types
- 16.2.2.4 Employment Types
- 16.2.2.5 Nationality
- 16.2.2.6 Ethnicity

### 16.2.3 Department & Position
- 16.2.3.1 Department Hierarchy
- 16.2.3.2 Position Definitions
- 16.2.3.3 Work Schedules
- 16.2.3.4 Shift Definitions
- 16.2.3.5 Centers/Locations
- 16.2.3.6 Reporting Structure

### 16.2.4 Leave & Holiday
- 16.2.4.1 Leave Types Configuration
- 16.2.4.2 Holiday Calendar
- 16.2.4.3 Leave Policies
- 16.2.4.4 Carry-Over Rules
- 16.2.4.5 Accrual Rules
- 16.2.4.6 Holiday Import

### 16.2.5 Salary Configuration
- 16.2.5.1 Military Salary Scale
- 16.2.5.2 Salary Steps per Rank
- 16.2.5.3 Increment Rules
- 16.2.5.4 Allowance Types
- 16.2.5.5 Deduction Types
- 16.2.5.6 Tax Configuration

### 16.2.6 Inventory Configuration
- 16.2.6.1 Item Categories
- 16.2.6.2 Item Types
- 16.2.6.3 Condition Options
- 16.2.6.4 Assignment Rules
- 16.2.6.5 Return Policies
- 16.2.6.6 Clearance Checklist

---

## 16.3 Policy Documents

### 16.3.1 Policy Management
- 16.3.1.1 Upload Policy Documents
- 16.3.1.2 Policy Categories
- 16.3.1.3 Version Control
- 16.3.1.4 Effective Date
- 16.3.1.5 Applicable To (All/Military/Civilian)
- 16.3.1.6 Acknowledgment Tracking

### 16.3.2 Policy Access
- 16.3.2.1 View Policies (All Users)
- 16.3.2.2 Download Policies
- 16.3.2.3 Policy History
- 16.3.2.4 Search Policies
- 16.3.2.5 Policy Notifications
- 16.3.2.6 Used Across Modules

---

# Module 17: Dashboard & Notifications

## 17.1 Role-Based Dashboards

### 17.1.1 Executive Dashboard (Commissioner/Vice)
- 17.1.1.1 Organization Overview
- 17.1.1.2 Employee Statistics
- 17.1.1.3 Trend Charts
- 17.1.1.4 Key Performance Indicators
- 17.1.1.5 Upcoming Retirements Summary
- 17.1.1.6 Decision Support Metrics

### 17.1.2 HR Manager Dashboard
- 17.1.2.1 Pending Approvals Count
- 17.1.2.2 Leave Requests Summary
- 17.1.2.3 Attendance Overview
- 17.1.2.4 Upcoming Tasks
- 17.1.2.5 Recent Activities
- 17.1.2.6 Quick Actions

### 17.1.3 HR Officer Dashboard
- 17.1.3.1 My Tasks
- 17.1.3.2 Pending Items
- 17.1.3.3 Today's Activities
- 17.1.3.4 Quick Entry Forms
- 17.1.3.5 Recent Records
- 17.1.3.6 Notifications

### 17.1.4 Center Commander Dashboard
- 17.1.4.1 Center Overview
- 17.1.4.2 Center Statistics
- 17.1.4.3 Pending Approvals
- 17.1.4.4 Center Trends
- 17.1.4.5 Attendance Summary
- 17.1.4.6 Alerts

---

## 17.2 Notification System

### 17.2.1 In-App Notifications
- 17.2.1.1 Notification Bell Icon
- 17.2.1.2 Unread Count Badge
- 17.2.1.3 Notification List
- 17.2.1.4 Mark as Read
- 17.2.1.5 Mark All as Read
- 17.2.1.6 Notification Settings

### 17.2.2 Notification Types
- 17.2.2.1 Approval Required
- 17.2.2.2 Request Status Change
- 17.2.2.3 Task Assignment
- 17.2.2.4 Deadline Reminder
- 17.2.2.5 System Alerts
- 17.2.2.6 Information Updates

### 17.2.3 Email Notifications (Future)
- 17.2.3.1 Critical Alerts
- 17.2.3.2 Daily Digest
- 17.2.3.3 Weekly Summary
- 17.2.3.4 Configurable Settings
- 17.2.3.5 Template Management
- 17.2.3.6 Opt-out Option

---

# Summary: Modules in Part 2

| # | Module | Key Features |
|---|--------|--------------|
| 9 | Retirement | Age by Rank (50/52/55), DOB-based, Auto-initiation, Clearance |
| 10 | Service Rewards | Milestones, Article 31 Disqualification, Investigation Postponement |
| 11 | Complaints | Types, Workflow, Investigation, Link to Rewards |
| 12 | Document Tracking | Incoming/Outgoing, Document Officer Role |
| 13 | Reports | Executive, Standard, Custom Builder |
| 14 | Audit Log | Detailed Tracking, Accountability, Security |
| 15 | Users & Roles | Hierarchy, Role Definitions, Permission Matrix, Password Policy |
| 16 | Organization | Settings, Lookups, Policies |
| 17 | Dashboard | Role-Based Views, Notifications |

---

# Key Business Rules Summary

## Retirement Age by Rank
| Rank Group | Ranks | Retirement Age |
|------------|-------|----------------|
| Group 1 | ኮንስታብል to ዋና ሳጅን (1-5) | 50 years |
| Group 2 | ረ/ኢ/ር to ኢንስፔክተር (6-8) | 52 years |
| Group 3 | ዋና ኢ/ር and above (9-16) | 55 years |

## Reward Eligibility
| Condition | Impact |
|-----------|--------|
| Article 31 Active | NOT ELIGIBLE (Disqualified) |
| Under Investigation | POSTPONED (2 Years Extension) |
| Investigation Cleared | Eligibility Restored |

## User Roles
| Role | Access Scope |
|------|--------------|
| Commissioner/Vice | View all stats for decisions |
| IT Administrator | User management, settings (no employee data) |
| HQ HR Manager | Full HR for all centers |
| Center HR Manager | HR for own center only |
| HR Officer | Day-to-day activities |
| Document Officer | Document module only |
| Center Commander | View center reports, approve requests |

---

End of Features Part 2 (Updated)
