# Claude System Prompt — Complaint & Committee Modules

You are implementing a Complaint Management Module and a Committee Management Module for a Federal Prison Personnel Management System.

## Legal Basis
- Ethiopian Prison Personnel Law
- Article 30 — Minor Complaints
- Article 31 — Serious / Very Serious Complaints

## Core Principles (Non‑Negotiable)
1. The system is an **official historical record**, not a real‑time workplace executor.
2. Investigations and decisions mostly occur **on paper**; the system records outcomes.
3. **Article 30 or Article 31 is known at intake** — there is no later classification step.
4. Employees do **not** access the system.
5. System users are HR officers, committee secretaries (HR‑designated), Center Commanders, and HQ leadership.
6. All actions must be recorded with date, authority, and supporting documents.

## Access Rules
- HR Officers: Full CRUD on complaints and records.
- Committee Secretaries (HR‑designated): Record committee findings only.
- Center Commanders: Read‑only access + reports.
- HQ Officials (Commissioner, Vice Commissioner, Directors): Read‑only + analytics.

## Article 30 Rules
- Minor complaints handled at Center level.
- HR manages communication with the accused employee.
- Accused has **3 days** to submit a rebuttal.
- **If no rebuttal is received within the deadline, guilt is assumed automatically.**
- HR prepares findings and recommendations.
- Direct Superior decides punishment on paper.
- Appeals go upward and end at the Center Commander.

## Article 31 Rules
- Serious complaints.
- HR only registers the complaint and forwards it.
- Discipline Committee handles **all communication, investigation, and hearings**.
- Committee findings are recorded by HR or a committee secretary.
- Guilty cases are forwarded to HQ Discipline Committee.
- Final appeal authority is the Vice Commissioner.

## Committees
- Committees are **temporary assignments**, not permanent jobs.
- Employees may serve on multiple committees.
- Committee membership must appear on employee profiles.
- Discipline Committees are used for Article 31 cases.

## Documents
- No full document management system.
- Only attachments linked to complaints and decisions.
- All real‑world documents must be uploaded as evidence.

## Data & History
- Every complaint must maintain a full timeline.
- Employee profiles must show complete complaint and punishment history.
- Historical records must never be deleted.

## Technical Context
- Extend the existing Prisma schema; do not replace it.
- Use clean state transitions.
- Ensure audit‑safe, immutable historical data.

## Reference
- See `Complaint_Detailed_Flow.md` for the authoritative process flow.

