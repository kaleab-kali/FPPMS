# EPPMS Feature Specifications - Part 1 (Updated)

## Modules 1-8: Employee, Leave, Holiday, Appraisal, Salary, Attendance, Inventory, Organization Settings

---

# Module 1: Employee Management

## 1.1 Registration Menu (Sidebar)

### 1.1.1 Registration Type Selection
- 1.1.1.1 Menu Structure
  - 1.1.1.1.1 Registration Parent Menu
  - 1.1.1.1.2 Military Employee Option (HQ users only)
  - 1.1.1.1.3 Civilian Employee Option (HQ + Center users)
  - 1.1.1.1.4 Temporary Employee Option (HQ + Center users)
  - 1.1.1.1.5 Permission-Based Visibility
  - 1.1.1.1.6 Active Selection Indicator

---

## 1.2 Military Employee Registration

### 1.2.1 Section: Basic Information
- 1.2.1.1 Name Fields
  - 1.2.1.1.1 First Name (English) - Required
  - 1.2.1.1.2 First Name (Amharic) - Required
  - 1.2.1.1.3 Middle Name (English) - Required
  - 1.2.1.1.4 Middle Name (Amharic) - Required
  - 1.2.1.1.5 Last Name (English) - Required
  - 1.2.1.1.6 Last Name (Amharic) - Required
- 1.2.1.2 Personal Details
  - 1.2.1.2.1 Gender - Required (Male/Female)
  - 1.2.1.2.2 Date of Birth - Required (Ethiopian/Gregorian picker)
  - 1.2.1.2.3 Birth Place (English)
  - 1.2.1.2.4 Birth Place (Amharic)
  - 1.2.1.2.5 Nationality - Required (Default: Ethiopian)
  - 1.2.1.2.6 Ethnicity - Optional
- 1.2.1.3 Physical Attributes
  - 1.2.1.3.1 Height (cm) - Optional
  - 1.2.1.3.2 Weight (kg) - Optional
  - 1.2.1.3.3 Blood Type - Optional (A+, A-, B+, B-, AB+, AB-, O+, O-)
  - 1.2.1.3.4 Eye Color - Optional
  - 1.2.1.3.5 Hair Color - Optional
  - 1.2.1.3.6 Distinguishing Marks - Optional
- 1.2.1.4 National Identification
  - 1.2.1.4.1 Fayda ID Field - Optional (Ready for future integration)
  - 1.2.1.4.2 Fayda Verification Button - Disabled until integration
  - 1.2.1.4.3 Verification Status Display
  - 1.2.1.4.4 Old ID Number (if any)
  - 1.2.1.4.5 Passport Number - Optional
  - 1.2.1.4.6 Driving License - Optional

### 1.2.2 Section: Contact Information
- 1.2.2.1 Phone Numbers
  - 1.2.2.1.1 Primary Phone - Required
  - 1.2.2.1.2 Secondary Phone - Optional
  - 1.2.2.1.3 Phone Type Selection (Mobile/Landline)
  - 1.2.2.1.4 WhatsApp Available Checkbox
  - 1.2.2.1.5 Telegram Available Checkbox
  - 1.2.2.1.6 Preferred Contact Method
- 1.2.2.2 Email & Social
  - 1.2.2.2.1 Personal Email - Optional
  - 1.2.2.2.2 Work Email - Auto-generated after registration
  - 1.2.2.2.3 Social Media Handle - Optional
  - 1.2.2.2.4 Email Verification Status
  - 1.2.2.2.5 Communication Preferences
  - 1.2.2.2.6 Language Preference (Amharic/English)

### 1.2.3 Section: Address Information (Cascading)
- 1.2.3.1 Current Address
  - 1.2.3.1.1 Region Dropdown - Required (Loads from lookup table)
  - 1.2.3.1.2 Sub-City/Zone Dropdown - Required (Cascades from Region)
  - 1.2.3.1.3 Woreda Dropdown - Required (Cascades from Sub-City)
  - 1.2.3.1.4 House Number - Optional
  - 1.2.3.1.5 Unique Area Name - Optional (Local landmark)
  - 1.2.3.1.6 Full Address Preview (Auto-generated)
- 1.2.3.2 Permanent Address
  - 1.2.3.2.1 Same as Current Checkbox
  - 1.2.3.2.2 Region Dropdown (if different)
  - 1.2.3.2.3 Sub-City/Zone Dropdown (if different)
  - 1.2.3.2.4 Woreda Dropdown (if different)
  - 1.2.3.2.5 House Number (if different)
  - 1.2.3.2.6 Unique Area Name (if different)

### 1.2.4 Section: Mother Information
- 1.2.4.1 Mother Details
  - 1.2.4.1.1 Mother's Full Name (English) - Required
  - 1.2.4.1.2 Mother's Full Name (Amharic) - Required
  - 1.2.4.1.3 Mother's Phone Number - Optional
  - 1.2.4.1.4 Is Mother Alive - Required (Yes/No)
  - 1.2.4.1.5 Mother's Address (if different from employee)
  - 1.2.4.1.6 Relationship Notes - Optional

### 1.2.5 Section: Emergency Contact
- 1.2.5.1 Primary Emergency Contact
  - 1.2.5.1.1 Contact Full Name (English) - Required
  - 1.2.5.1.2 Contact Full Name (Amharic) - Required
  - 1.2.5.1.3 Relationship - Required (Dropdown)
  - 1.2.5.1.4 Phone Number - Required
  - 1.2.5.1.5 Alternative Phone - Optional
  - 1.2.5.1.6 Email - Optional
- 1.2.5.2 Emergency Contact Address
  - 1.2.5.2.1 Region Dropdown
  - 1.2.5.2.2 Sub-City/Zone Dropdown (Cascading)
  - 1.2.5.2.3 Woreda Dropdown (Cascading)
  - 1.2.5.2.4 House Number
  - 1.2.5.2.5 Unique Area Name
  - 1.2.5.2.6 Address Notes

### 1.2.6 Section: Marital Status
- 1.2.6.1 Status Selection
  - 1.2.6.1.1 Marital Status Dropdown - Required (Default: Single for trainees)
  - 1.2.6.1.2 Options: Single, Married, Divorced, Widowed
  - 1.2.6.1.3 Marriage Date (shown if Married)
  - 1.2.6.1.4 Number of Children (shown if not Single)
  - 1.2.6.1.5 Spouse Name (shown if Married)
  - 1.2.6.1.6 Spouse Phone (shown if Married)

### 1.2.7 Section: Rank & Employment
- 1.2.7.1 Military Rank
  - 1.2.7.1.1 Rank Dropdown - Required (Default: ኮንስታብል/Constable)
  - 1.2.7.1.2 Rank Display (Amharic)
  - 1.2.7.1.3 Rank Display (English)
  - 1.2.7.1.4 Salary Auto-Display (Base salary of selected rank)
  - 1.2.7.1.5 Rank Badge Preview
  - 1.2.7.1.6 Rank Category Display
- 1.2.7.2 Employment Details
  - 1.2.7.2.1 Employment Date - Auto-filled with system date
  - 1.2.7.2.2 Is Transfer Checkbox
  - 1.2.7.2.3 Original Employment Date (shown if Transfer)
  - 1.2.7.2.4 Source Organization (shown if Transfer)
  - 1.2.7.2.5 Transfer Document Reference
  - 1.2.7.2.6 Transfer Approval Reference
- 1.2.7.3 Assignment
  - 1.2.7.3.1 Department - Required (Dropdown)
  - 1.2.7.3.2 Position - Required (Dropdown)
  - 1.2.7.3.3 Work Location - Required
  - 1.2.7.3.4 Supervisor - Optional
  - 1.2.7.3.5 Work Schedule Type - Required (Regular 8hr / Shift 24hr)
  - 1.2.7.3.6 Shift Group Assignment (if Shift selected)

### 1.2.8 Section: Education Background
- 1.2.8.1 Current Education Level
  - 1.2.8.1.1 Highest Level Completed - Required
  - 1.2.8.1.2 Options: 8th Grade to PhD
  - 1.2.8.1.3 Currently Studying Checkbox
  - 1.2.8.1.4 Current Study Level
  - 1.2.8.1.5 Expected Graduation
  - 1.2.8.1.6 Institution
- 1.2.8.2 Education Records (Multiple Entry)
  - 1.2.8.2.1 Add Education Button
  - 1.2.8.2.2 Education Level Dropdown
  - 1.2.8.2.3 School/Institution Name - Required
  - 1.2.8.2.4 Year of Graduation - Required
  - 1.2.8.2.5 Field of Study (Required for Diploma+)
  - 1.2.8.2.6 Certificate Upload - Optional

### 1.2.9 Section: Previous Work Experience
- 1.2.9.1 Work Experience Records (Multiple Entry)
  - 1.2.9.1.1 Add Experience Button
  - 1.2.9.1.2 Company/Organization Name - Required
  - 1.2.9.1.3 Position/Title - Required
  - 1.2.9.1.4 Start Date - Required
  - 1.2.9.1.5 End Date - Required
  - 1.2.9.1.6 Employment Type
- 1.2.9.2 Experience Details
  - 1.2.9.2.1 Responsibilities Description
  - 1.2.9.2.2 Reason for Leaving
  - 1.2.9.2.3 Last Salary - Optional
  - 1.2.9.2.4 Reference Name
  - 1.2.9.2.5 Reference Phone
  - 1.2.9.2.6 Experience Letter Upload

### 1.2.10 Form Actions
- 1.2.10.1 Validation
  - 1.2.10.1.1 Real-time Field Validation
  - 1.2.10.1.2 Required Fields Check
  - 1.2.10.1.3 Format Validation (Phone, Email)
  - 1.2.10.1.4 Date Logic Validation
  - 1.2.10.1.5 Duplicate Check (National ID, Phone)
  - 1.2.10.1.6 Error Summary Display
- 1.2.10.2 Submission
  - 1.2.10.2.1 Save as Draft Button
  - 1.2.10.2.2 Register Employee Button
  - 1.2.10.2.3 Employee ID Generation (FPC-NNNN/NN)
  - 1.2.10.2.4 Success Message with Employee ID
  - 1.2.10.2.5 Redirect to Photo Capture
  - 1.2.10.2.6 Print Registration Summary

---

## 1.3 Civilian Employee Registration

### 1.3.1 Differences from Military
- 1.3.1.1 No Rank Field - Salary Grade/Basic Salary Instead
- 1.3.1.2 Can be Hired by Any Center
- 1.3.1.3 No Default Marital Status
- 1.3.1.4 Work Experience Required
- 1.3.1.5 Education More Emphasized
- 1.3.1.6 Civilian Salary Scale (Future - Placeholder)

### 1.3.2 Shared Sections (Same as Military)
- 1.3.2.1 Basic Information
- 1.3.2.2 Contact Information
- 1.3.2.3 Address Information (Cascading)
- 1.3.2.4 Mother Information
- 1.3.2.5 Emergency Contact
- 1.3.2.6 Education Background

---

## 1.4 Temporary Employee Registration

### 1.4.1 Simplified Form
- 1.4.1.1 Basic Information (Same)
- 1.4.1.2 Contact Information (Same)
- 1.4.1.3 Address (Current only)
- 1.4.1.4 Emergency Contact (One only)
- 1.4.1.5 Education (Optional)
- 1.4.1.6 Work Experience (Optional)

### 1.4.2 Contract Details (Unique)
- 1.4.2.1 Contract Start Date - Required
- 1.4.2.2 Contract End Date - Required
- 1.4.2.3 Fixed Contract Amount - Required
- 1.4.2.4 Payment Frequency
- 1.4.2.5 Contract Document Upload
- 1.4.2.6 Can be Hired by Any Center

---

## 1.5 Employee List Page

### 1.5.1 Page Header
- 1.5.1.1 Title: "Employees" / "ሰራተኞች"
- 1.5.1.2 Total Count Display
- 1.5.1.3 Register New Button
- 1.5.1.4 Export Options (Excel, PDF, CSV)
- 1.5.1.5 Import Button
- 1.5.1.6 Column Customization

### 1.5.2 Filter Panel
- 1.5.2.1 Quick Filters (Type, Status, Department, Schedule)
- 1.5.2.2 Advanced Search (Name, ID, Phone, National ID)
- 1.5.2.3 Date Range Filter
- 1.5.2.4 Rank Filter (Military)
- 1.5.2.5 Position Filter
- 1.5.2.6 Clear Filters Button

### 1.5.3 Employee Table
- 1.5.3.1 Columns: Photo, ID, Name, Type, Rank/Grade, Department
- 1.5.3.2 Additional: Position, Phone, Status, Schedule, Date
- 1.5.3.3 Row Actions: View, Edit, Photo, Documents, Print

### 1.5.4 Pagination
- 1.5.4.1 Page Size Options (10, 25, 50, 100)
- 1.5.4.2 Page Navigation
- 1.5.4.3 Total Records Display
- 1.5.4.4 Jump to Page
- 1.5.4.5 First/Last Buttons
- 1.5.4.6 Items Per Page Selector

---

## 1.6 Employee Profile Page

### 1.6.1 Profile Header
- 1.6.1.1 Large Photo Display
- 1.6.1.2 Employee Full Name (Both languages)
- 1.6.1.3 Employee ID, Rank/Grade, Department
- 1.6.1.4 Status Badge
- 1.6.1.5 Download Button (Full Profile / Employment Profile PDF)
- 1.6.1.6 Edit Profile Button

### 1.6.2 Profile Tabs (13 Tabs)
- 1.6.2.1 Basic Info - Personal & Employment details
- 1.6.2.2 Education - Education records & certificates
- 1.6.2.3 Experience - Previous work history
- 1.6.2.4 Attendance - Clock in/out, shift schedule
- 1.6.2.5 Leave - Balance, requests, history, permit
- 1.6.2.6 Appraisal - Performance reviews, scores

### 1.6.3 Additional Tabs
- 1.6.3.1 Performance - 6-month reviews
- 1.6.3.2 Health - Medical info, eligible dependents (spouse, children <18)
- 1.6.3.3 Family - Marital status, spouse, children, dependents
- 1.6.3.4 Documents - Personal & official documents
- 1.6.3.5 Inventory - Weapons, equipment, uniforms
- 1.6.3.6 Salary - Current, history, progression

### 1.6.4 Conditional Tabs
- 1.6.4.1 Disciplinary (if records exist)
- 1.6.4.2 Rank History (Military only)
- 1.6.4.3 Contract (Temporary only)
- 1.6.4.4 Transfer History (if transfers)
- 1.6.4.5 Training (Future)
- 1.6.4.6 Rewards (if eligible)

### 1.6.5 Health Tab Details
- 1.6.5.1 Employee Medical Info (Blood type, conditions, allergies)
- 1.6.5.2 Eligible Medical Dependents (for expense coverage)
- 1.6.5.3 Add Dependent Button (Sidebar form)
- 1.6.5.4 Spouse Entry (if married)
- 1.6.5.5 Children Under 18 Entries
- 1.6.5.6 Eligibility Status Badge

### 1.6.6 Family Tab Details
- 1.6.6.1 Current Marital Status Display
- 1.6.6.2 Change Status Button (Sidebar form)
- 1.6.6.3 Spouse Information (if Married)
- 1.6.6.4 Children Section
- 1.6.6.5 Other Dependents
- 1.6.6.6 Marital History Timeline

### 1.6.7 Inventory Tab Details
- 1.6.7.1 Assigned Weapons (Type, Serial, Condition)
- 1.6.7.2 Assigned Equipment (Radio, Handcuffs, etc.)
- 1.6.7.3 Assigned Uniforms (Type, Size, Quantity)
- 1.6.7.4 Assignment History
- 1.6.7.5 Report Lost/Damaged
- 1.6.7.6 Clearance Status

### 1.6.8 Salary Tab Details
- 1.6.8.1 Current Rank/Grade & Step
- 1.6.8.2 Base Salary Amount
- 1.6.8.3 Allowances & Deductions
- 1.6.8.4 Next Step Date (2-year cycle)
- 1.6.8.5 Ceiling Indicator
- 1.6.8.6 Salary History

---

## 1.7 Photo Management Module (Separate Menu)

### 1.7.1 Menu Structure
- 1.7.1.1 Take Photo - Camera capture
- 1.7.1.2 Upload Photo - File upload (requires approval)
- 1.7.1.3 Pending Approvals (Supervisors)
- 1.7.1.4 Photo History
- 1.7.1.5 Batch Upload (Admin)
- 1.7.1.6 Photo Guidelines

### 1.7.2 Take Photo Page
- 1.7.2.1 Employee Selection (Search by ID/Name)
- 1.7.2.2 Camera Feed Display
- 1.7.2.3 Capture Button
- 1.7.2.4 Retake Button
- 1.7.2.5 Crop/Adjust Tool
- 1.7.2.6 Reason (Initial, Rank Change, Update)

### 1.7.3 Upload Photo Page (Requires Approval)
- 1.7.3.1 Employee Selection
- 1.7.3.2 File Upload (<10MB, JPG/PNG)
- 1.7.3.3 Photo Preview & Crop
- 1.7.3.4 Submit for Approval
- 1.7.3.5 Approval Notice
- 1.7.3.6 Supervisor Selection

### 1.7.4 Pending Approvals (Supervisor)
- 1.7.4.1 Pending List with Thumbnails
- 1.7.4.2 Side-by-Side Comparison
- 1.7.4.3 Approve / Reject Buttons
- 1.7.4.4 Rejection Reason (Required)
- 1.7.4.5 Bulk Approve Option
- 1.7.4.6 Notification to Uploader

---

## 1.8 Employee Transfer

### 1.8.1 Transfer Types
- 1.8.1.1 Internal (Within center)
- 1.8.1.2 External (Between centers - HQ approval required)
- 1.8.1.3 HQ Transfer
- 1.8.1.4 Temporary Assignment
- 1.8.1.5 Permanent Transfer
- 1.8.1.6 Promotion Transfer

### 1.8.2 Transfer Request Form
- 1.8.2.1 Employee Selection
- 1.8.2.2 Transfer Type, From/To Center
- 1.8.2.3 Effective Date
- 1.8.2.4 Transfer Reason
- 1.8.2.5 Supporting Documents
- 1.8.2.6 Handover Notes

### 1.8.3 Transfer Approval Workflow
- 1.8.3.1 Source Supervisor Approval
- 1.8.3.2 Source HR Review
- 1.8.3.3 HQ Committee Review (External)
- 1.8.3.4 Destination HR Acceptance
- 1.8.3.5 Final Approval
- 1.8.3.6 Execution & Notification

---

## 1.9 Profile Downloads

### 1.9.1 Full Profile PDF
- 1.9.1.1 All employee information
- 1.9.1.2 Photo, Personal, Contact, Address
- 1.9.1.3 Employment, Education, Experience
- 1.9.1.4 Family, Leave Summary, Appraisals
- 1.9.1.5 Salary, Inventory
- 1.9.1.6 Disciplinary Summary

### 1.9.2 Employment Profile PDF (Mini)
- 1.9.2.1 Photo, Basic Info, Employee ID
- 1.9.2.2 Current Rank/Position, Department
- 1.9.2.3 Employment Date, Current Salary
- 1.9.2.4 Employee Signature Line
- 1.9.2.5 HR Officer Signature Line
- 1.9.2.6 Official Stamp Area

---

# Module 2: Leave Management

## 2.1 Leave Types Configuration (Admin)

### 2.1.1 Leave Types List
- 2.1.1.1 Code, Name (English/Amharic)
- 2.1.1.2 Default Days, Carry Over
- 2.1.1.3 Status Badge
- 2.1.1.4 Add/Edit/Deactivate Actions
- 2.1.1.5 Search & Filter
- 2.1.1.6 Export Configuration

### 2.1.2 Leave Type Form
- 2.1.2.1 Basic Info (Code, Name, Description)
- 2.1.2.2 Allocation (Default Days, Accrual Method)
- 2.1.2.3 Carry Over Settings (Allow, Max, Expiry Years)
- 2.1.2.4 Applicability (Employee Types, Gender, Departments)
- 2.1.2.5 Requirements (Documents, Approval, Notice Days)
- 2.1.2.6 Holiday Impact (Extend for Regular, Not for Shift)

---

## 2.2 Leave Balance Management

### 2.2.1 Employee Balance Page
- 2.2.1.1 Employee Selection
- 2.2.1.2 Balance Cards per Leave Type
- 2.2.1.3 Entitlement, Used, Pending, Available
- 2.2.1.4 Expiring Soon Warning
- 2.2.1.5 Year Selector
- 2.2.1.6 Balance History

### 2.2.2 Balance Details Modal
- 2.2.2.1 Breakdown by Source Year
- 2.2.2.2 Expiry Date per Batch
- 2.2.2.3 FIFO Usage (Oldest first)
- 2.2.2.4 Expired Days Display
- 2.2.2.5 Export Balance Report
- 2.2.2.6 Adjustment Option

### 2.2.3 Balance Adjustment (HR)
- 2.2.3.1 Adjustment Type (Add, Deduct, Correct)
- 2.2.3.2 Days & Effective Date
- 2.2.3.3 Reason - Required
- 2.2.3.4 Supporting Document
- 2.2.3.5 Adjustment History
- 2.2.3.6 Audit Trail

---

## 2.3 Leave Request Workflow

### 2.3.1 Create Leave Request
- 2.3.1.1 Leave Type Selection (with balance display)
- 2.3.1.2 Date Selection (Calendar with holidays)
- 2.3.1.3 Working Days Calculator
- 2.3.1.4 Shift Worker Warning
- 2.3.1.5 Details (Reason, Destination, Contact)
- 2.3.1.6 Balance Impact Preview

### 2.3.2 Leave Requests List
- 2.3.2.1 View Tabs (My, Team, Pending, All)
- 2.3.2.2 Filters (Status, Type, Date)
- 2.3.2.3 Request Table
- 2.3.2.4 Calendar View
- 2.3.2.5 Actions (View, Approve, Reject)
- 2.3.2.6 Export/Print

### 2.3.3 Leave Request Detail
- 2.3.3.1 Request Summary
- 2.3.3.2 Employee Info Card
- 2.3.3.3 Days Breakdown
- 2.3.3.4 Approval Section
- 2.3.3.5 Status Timeline
- 2.3.3.6 Documents

---

## 2.4 Leave Calculation Engine

### 2.4.1 Working Days Calculation
- 2.4.1.1 Count Calendar Days
- 2.4.1.2 Exclude Weekends
- 2.4.1.3 Exclude Public Holidays
- 2.4.1.4 Exclude Company Holidays
- 2.4.1.5 Shift Worker Exception (Count All Days)
- 2.4.1.6 Store Calculation Details

### 2.4.2 Leave Interruption (Sick During Annual)
- 2.4.2.1 Detect Sick Leave During Annual
- 2.4.2.2 Calculate Annual Used Before Sick
- 2.4.2.3 Mark Annual as Interrupted
- 2.4.2.4 Return Unused Days to Balance
- 2.4.2.5 Track Both Leave Types
- 2.4.2.6 Example: 10 days annual, sick day 5-8 = 6 annual used, 4 returned

### 2.4.3 Carry-Over Calculation
- 2.4.3.1 Year-End: Calculate Remaining
- 2.4.3.2 Apply Max Carry-Over Cap
- 2.4.3.3 Set Expiry Date (5 years)
- 2.4.3.4 FIFO Usage (Oldest first)
- 2.4.3.5 Expiry Warnings (30, 15, 7 days)
- 2.4.3.6 Mark Expired Days

---

## 2.5 Leave Calendar

### 2.5.1 Calendar Views
- 2.5.1.1 Month/Week/Day View
- 2.5.1.2 Team/Department/Organization View
- 2.5.1.3 Leave Requests Color-Coded
- 2.5.1.4 Holidays Highlighted
- 2.5.1.5 Click for Details
- 2.5.1.6 Filters & Legend

---

## 2.6 Leave Permit

### 2.6.1 Permit Generation
- 2.6.1.1 Auto-Generate on Approval (if leaving city)
- 2.6.1.2 Permit Number Generation
- 2.6.1.3 Organization Header/Logo
- 2.6.1.4 Employee Photo & Details
- 2.6.1.5 Leave Type, Dates, Destination
- 2.6.1.6 Signature & Stamp Area

### 2.6.2 Permit Template Content
- 2.6.2.1 "LEAVE PERMIT" Title
- 2.6.2.2 "This is to certify that [Name], ID: [ID], Rank: [Rank]..."
- 2.6.2.3 "...is granted [Leave Type] from [Start] to [End]..."
- 2.6.2.4 "...destination: [Destination], contact: [Phone]..."
- 2.6.2.5 "Approved by: [Name], Title: [Title], Date: [Date]"
- 2.6.2.6 Signature Line & Official Stamp

---

# Module 3: Holiday Management

## 3.1 Holiday Configuration

### 3.1.1 Holiday List Page
- 3.1.1.1 Year Selector
- 3.1.1.2 Holiday Types Filter
- 3.1.1.3 Calendar/Table Toggle
- 3.1.1.4 Add Holiday Button
- 3.1.1.5 Import Ethiopian Holidays
- 3.1.1.6 Export Holidays

### 3.1.2 Holiday Table
- 3.1.2.1 Date (Gregorian & Ethiopian)
- 3.1.2.2 Name (English & Amharic)
- 3.1.2.3 Type Badge (Public, Religious, Company)
- 3.1.2.4 Half Day Indicator
- 3.1.2.5 Recurring Indicator
- 3.1.2.6 Actions (Edit, Delete, Duplicate)

### 3.1.3 Add/Edit Holiday Form
- 3.1.3.1 Name (English & Amharic)
- 3.1.3.2 Date
- 3.1.3.3 Type (Public, Religious, Company)
- 3.1.3.4 Is Half Day Toggle
- 3.1.3.5 Is Recurring Toggle
- 3.1.3.6 Applicability (All, Military, Civilian)

### 3.1.4 Ethiopian Calendar Holidays
- 3.1.4.1 Ethiopian New Year (መስከረም 1)
- 3.1.4.2 Meskel (መስቀል)
- 3.1.4.3 Ethiopian Christmas (ገና)
- 3.1.4.4 Ethiopian Epiphany (ጥምቀት)
- 3.1.4.5 Good Friday & Easter
- 3.1.4.6 Islamic Holidays (Manual entry - dates vary)

---

# Module 4: Appraisal & Performance

## 4.1 Performance Review (6-Month Cycle)

### 4.1.1 Review Periods
- 4.1.1.1 Create Period (Name, Dates, Deadline)
- 4.1.1.2 Status (Draft, Active, Closed)
- 4.1.1.3 Applicable Employee Types
- 4.1.1.4 Review Criteria Selection
- 4.1.1.5 Score Calculation Method
- 4.1.1.6 Approval Workflow

### 4.1.2 Appraisal Criteria
- 4.1.2.1 Criteria for Military
- 4.1.2.2 Criteria for Civilian
- 4.1.2.3 Max Score & Weight
- 4.1.2.4 Score Guidelines
- 4.1.2.5 Categories
- 4.1.2.6 Minimum Required Score

### 4.1.3 Appraisal Form
- 4.1.3.1 Employee Selection
- 4.1.3.2 Criteria Rating Section
- 4.1.3.3 Disciplinary Check (Auto)
- 4.1.3.4 Article 31: Auto-Ineligible
- 4.1.3.5 Article 30: Apply Deduction
- 4.1.3.6 Final Score (Out of 100)

---

## 4.2 Disciplinary Records (Basic - Placeholder)

### 4.2.1 Article 30 (Minor)
- 4.2.1.1 Impact: Score Deduction
- 4.2.1.2 Still Eligible for Appraisal
- 4.2.1.3 Details: To be defined later
- 4.2.1.4 Duration on Record
- 4.2.1.5 Penalties: Placeholder
- 4.2.1.6 Basic Entry Form

### 4.2.2 Article 31 (Major)
- 4.2.2.1 Impact: Ineligible for Appraisal
- 4.2.2.2 Automatic Disqualification
- 4.2.2.3 Details: To be defined later
- 4.2.2.4 Duration on Record
- 4.2.2.5 Penalties: Placeholder
- 4.2.2.6 Basic Entry Form

---

## 4.3 Military Rank & Promotion

### 4.3.1 Rank Hierarchy (16 Ranks)
- 4.3.1.1 ኮንስታብል (Constable) - Level 1
- 4.3.1.2 ረዳት ሳጅን (Assistant Sergeant) - Level 2
- 4.3.1.3 ምክትል ሳጅን (Deputy Sergeant) - Level 3
- 4.3.1.4 ሳጅን (Sergeant) - Level 4
- 4.3.1.5 ዋና ሳጅን (Chief Sergeant) - Level 5
- 4.3.1.6 ረዳት ኢንስፔክተር (Assistant Inspector) - Level 6
- 4.3.1.7 ምክትል ኢንስፔክተር (Deputy Inspector) - Level 7
- 4.3.1.8 ኢንስፔክተር (Inspector) - Level 8
- 4.3.1.9 ዋና ኢንስፔክተር (Chief Inspector) - Level 9
- 4.3.1.10 ምክትል ኮማንደር (Deputy Commander) - Level 10
- 4.3.1.11 ኮማንደር (Commander) - Level 11
- 4.3.1.12 ረዳት ኮሚሽነር (Assistant Commissioner) - Level 12
- 4.3.1.13 ምክትል ኮሚሽነር (Deputy Commissioner) - Level 13
- 4.3.1.14 ኮሚሽነር (Commissioner) - Level 14
- 4.3.1.15 ም/ኮሚ/ጀነራል (Deputy Commissioner General) - Level 15
- 4.3.1.16 ኮሚሽነር ጀነራል (Commissioner General) - Level 16

### 4.3.2 Promotion Process
- 4.3.2.1 Eligibility Check (Years, Score, No Article 31)
- 4.3.2.2 Committee Approval
- 4.3.2.3 Promotion Order Reference
- 4.3.2.4 New Rank Selection
- 4.3.2.5 Salary Update (Base of new rank)
- 4.3.2.6 Photo Update Required Flag

---

# Module 5: Salary Management

## 5.1 Military Salary Scale (2018 E.C.)

### 5.1.1 Scale Structure
- 5.1.1.1 16 Ranks
- 5.1.1.2 Base Salary (መነሻ ደምወዝ)
- 5.1.1.3 9 Steps (የዕርከን ደምወዝ)
- 5.1.1.4 Ceiling (ጣሪያ)
- 5.1.1.5 Every 2 Years = 1 Step
- 5.1.1.6 Promotion = Reset to Base of New Rank

### 5.1.2 Salary Data (From Uploaded File)
- 5.1.2.1 Constable: 6,365 → 8,944 ETB
- 5.1.2.2 Assistant Sergeant: 7,054 → 9,859 ETB
- 5.1.2.3 Deputy Sergeant: 7,809 → 11,223 ETB
- 5.1.2.4 Sergeant: 8,646 → 12,992 ETB
- 5.1.2.5 Chief Sergeant: 9,544 → 14,975 ETB
- 5.1.2.6 Assistant Inspector: 10,688 → 17,121 ETB
- 5.1.2.7 Deputy Inspector: 12,373 → 19,538 ETB
- 5.1.2.8 Inspector: 14,296 → 22,256 ETB
- 5.1.2.9 Chief Inspector: 16,384 → 25,232 ETB
- 5.1.2.10 Deputy Commander: 18,697 → 28,361 ETB
- 5.1.2.11 Commander: 21,336 → 31,627 ETB
- 5.1.2.12 Assistant Commissioner: 24,215 → 35,011 ETB
- 5.1.2.13 Deputy Commissioner: 27,310 → 38,526 ETB
- 5.1.2.14 Commissioner: 30,522 → 42,393 ETB
- 5.1.2.15 Deputy Commissioner General: 32,750 → 44,412 ETB
- 5.1.2.16 Commissioner General: 35,011 → 46,865 ETB

### 5.1.3 Automatic Increment
- 5.1.3.1 Check Every Year (2-year mark)
- 5.1.3.2 Identify Eligible Employees
- 5.1.3.3 Check if Ceiling Reached
- 5.1.3.4 Generate Increment List
- 5.1.3.5 HR Review & Approval
- 5.1.3.6 Bulk Processing

---

## 5.2 Civilian Salary (Simplified - Future Expansion)

### 5.2.1 Basic Entry
- 5.2.1.1 Basic Salary Amount - Required
- 5.2.1.2 Salary Grade (Placeholder)
- 5.2.1.3 Allowances Section
- 5.2.1.4 Deductions Section
- 5.2.1.5 Net Salary Display
- 5.2.1.6 Note: Full scale to be implemented later

---

## 5.3 Temporary Salary

### 5.3.1 Fixed Contract
- 5.3.1.1 Contract Amount - Required
- 5.3.1.2 Payment Frequency
- 5.3.1.3 No Steps/Increments
- 5.3.1.4 Pro-rated if Partial Month
- 5.3.1.5 Renewal with New Amount
- 5.3.1.6 Contract Duration Display

---

# Module 6: Attendance & Shift Management

## 6.1 Work Schedule Configuration

### 6.1.1 Schedule Types
- 6.1.1.1 Regular (8hr/day, Mon-Fri, Holiday Aware)
- 6.1.1.2 Shift 24hr (8hr shifts, 24hr coverage, NOT Holiday Aware)
- 6.1.1.3 Custom Schedules
- 6.1.1.4 Overtime Rules
- 6.1.1.5 Break Rules
- 6.1.1.6 Default Assignment

### 6.1.2 Shift Definitions
- 6.1.2.1 Morning (06:00-14:00)
- 6.1.2.2 Afternoon (14:00-22:00)
- 6.1.2.3 Night (22:00-06:00)
- 6.1.2.4 Color Coding
- 6.1.2.5 Break Minutes
- 6.1.2.6 Overnight Flag

---

## 6.2 Attendance Recording

### 6.2.1 Clock In/Out (Manual)
- 6.2.1.1 Self Clock In/Out Button
- 6.2.1.2 Current Time Display
- 6.2.1.3 Late/Early Warning
- 6.2.1.4 Hours Worked Display
- 6.2.1.5 Notes Field
- 6.2.1.6 Confirmation Message

### 6.2.2 Supervisor Entry
- 6.2.2.1 Team Attendance List
- 6.2.2.2 Status Selection (Present, Absent, Late, Leave)
- 6.2.2.3 Time Entry
- 6.2.2.4 Bulk Entry Mode
- 6.2.2.5 Attendance Correction
- 6.2.2.6 Audit Trail

### 6.2.3 Biometric Integration (Future Ready)
- 6.2.3.1 Fingerprint Reader Support
- 6.2.3.2 Face Recognition Support
- 6.2.3.3 Device Connection Status
- 6.2.3.4 Auto Clock In/Out
- 6.2.3.5 Sync with Server
- 6.2.3.6 Offline Mode & Fallback

---

## 6.3 Shift Scheduling

### 6.3.1 Schedule Board
- 6.3.1.1 Calendar View (Week/Month)
- 6.3.1.2 Employee Rows
- 6.3.1.3 Shift Cells (Color-coded)
- 6.3.1.4 Drag & Drop Assignment
- 6.3.1.5 Copy Week Function
- 6.3.1.6 Template Application

### 6.3.2 Shift Swap
- 6.3.2.1 Request Swap
- 6.3.2.2 Target Employee Accepts
- 6.3.2.3 Supervisor Approval
- 6.3.2.4 Schedule Update
- 6.3.2.5 Notifications
- 6.3.2.6 Audit Trail

---

## 6.4 Attendance Reports

### 6.4.1 Individual Reports
- 6.4.1.1 Monthly Summary
- 6.4.1.2 Days Present/Absent/Late
- 6.4.1.3 Overtime Hours
- 6.4.1.4 Leave Days
- 6.4.1.5 Export Option
- 6.4.1.6 Date Range Selection

### 6.4.2 Team/Department Reports
- 6.4.2.1 Attendance Rate
- 6.4.2.2 Absenteeism Rate
- 6.4.2.3 Overtime Analysis
- 6.4.2.4 Trend Charts
- 6.4.2.5 Export to Excel
- 6.4.2.6 Print Reports

---

# Module 7: Inventory Management

## 7.1 Inventory Categories

### 7.1.1 Weapons
- 7.1.1.1 Types: Pistol, Rifle, Shotgun, etc.
- 7.1.1.2 Serial Number Required
- 7.1.1.3 License Required
- 7.1.1.4 Inspection Required
- 7.1.1.5 High Security
- 7.1.1.6 Return Required

### 7.1.2 Equipment
- 7.1.2.1 Types: Radio, Handcuffs, Baton, Body Armor
- 7.1.2.2 Asset Tag Required
- 7.1.2.3 Condition Tracking
- 7.1.2.4 Maintenance Schedule
- 7.1.2.5 Return Required
- 7.1.2.6 Depreciation (Optional)

### 7.1.3 Uniforms
- 7.1.3.1 Types: Duty, Ceremonial, Combat, Boots, Cap
- 7.1.3.2 Size Tracking
- 7.1.3.3 Quantity Tracking
- 7.1.3.4 Replacement Cycle
- 7.1.3.5 Bulk Issue
- 7.1.3.6 Partial Return

---

## 7.2 Item Assignment

### 7.2.1 Assign Item
- 7.2.1.1 Select Employee
- 7.2.1.2 Select Item Category/Type
- 7.2.1.3 Serial/Asset Number
- 7.2.1.4 Condition at Assignment
- 7.2.1.5 Employee Signature
- 7.2.1.6 Print Assignment Form

### 7.2.2 Return Item
- 7.2.2.1 Select Assignment
- 7.2.2.2 Condition at Return
- 7.2.2.3 Damage Notes
- 7.2.2.4 Employee Signature
- 7.2.2.5 Cost Recovery (if damaged/lost)
- 7.2.2.6 Print Return Form

---

## 7.3 Retirement Clearance

### 7.3.1 Automatic Check
- 7.3.1.1 Triggered on Retirement
- 7.3.1.2 Check All Assigned Items
- 7.3.1.3 Generate Return List
- 7.3.1.4 Notify Inventory Department
- 7.3.1.5 Block Until Clear
- 7.3.1.6 Final Clearance Certificate

---

# Module 8: Organization Settings (Admin)

## 8.1 Address Lookup Configuration

### 8.1.1 Regions
- 8.1.1.1 Code, Name (English/Amharic)
- 8.1.1.2 Add/Edit/Deactivate
- 8.1.1.3 Sort Order
- 8.1.1.4 Sub-Cities Count
- 8.1.1.5 Bulk Import
- 8.1.1.6 Export

### 8.1.2 Sub-Cities (Cascades from Region)
- 8.1.2.1 Parent Region Filter
- 8.1.2.2 Code, Name
- 8.1.2.3 Woredas Count
- 8.1.2.4 Add/Edit/Deactivate
- 8.1.2.5 Sort Order
- 8.1.2.6 Bulk Import

### 8.1.3 Woredas (Cascades from Sub-City)
- 8.1.3.1 Parent Sub-City Filter
- 8.1.3.2 Code, Name
- 8.1.3.3 Add/Edit/Deactivate
- 8.1.3.4 Sort Order
- 8.1.3.5 Bulk Import
- 8.1.3.6 Export

---

## 8.2 Other Lookup Tables

### 8.2.1 Education Levels
- 8.2.1.1 8th Grade to PhD
- 8.2.1.2 Custom Levels
- 8.2.1.3 Sort Order
- 8.2.1.4 Requires Field of Study Flag
- 8.2.1.5 Is Active
- 8.2.1.6 Bilingual Names

### 8.2.2 Relationship Types
- 8.2.2.1 Father, Mother, Spouse, Child, Sibling
- 8.2.2.2 Grandparent, Uncle/Aunt, Cousin
- 8.2.2.3 Friend, Colleague, Neighbor
- 8.2.2.4 Other (Custom)
- 8.2.2.5 Sort Order
- 8.2.2.6 Bilingual Names

---

# Summary: Modules in Part 1

| # | Module | Key Features |
|---|--------|--------------|
| 1 | Employee Management | Registration (3 types), Profile (13+ tabs), Photo Management, Transfer |
| 2 | Leave Management | Types, Balance (5yr expiry), Calculation Engine, Calendar, Permit |
| 3 | Holiday Management | Public/Company Holidays, Ethiopian Calendar |
| 4 | Appraisal & Performance | 6-Month Review, Disciplinary (Art 30/31), Rank & Promotion |
| 5 | Salary Management | Military Scale (16 ranks, 9 steps), 2-Year Increment |
| 6 | Attendance & Shift | Schedule Types, Clock In/Out, Biometric Ready |
| 7 | Inventory Management | Weapons, Equipment, Uniforms, Clearance |
| 8 | Organization Settings | Address Lookups (Cascading), Other Lookups |

---

# Notes for Part 2

Part 2 will cover:
- Retirement Processing
- Complaint Management  
- Document Tracking
- Service Rewards
- Reports & Analytics
- Audit Log System
- User & Role Management
- System Settings
- Dashboard & Notifications

---

End of Features Part 1 (Updated)
