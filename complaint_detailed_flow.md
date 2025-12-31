# Complaint Management Module — Detailed Flow (System Reference)

This document defines the **authoritative operational flow** for the Complaint Management Module. The system records real‑world actions after they occur.

---

## 1. Intake — Single Entry Point

### Real World
- Complaint is submitted to HR on paper.
- HR reviews the content and immediately knows whether the case is Article 30 or Article 31.

### System Record (Mandatory)
**Form: Register Complaint**
- Accused employee
- Complainant
- Article: 30 or 31 (required)
- Center / HQ
- Complaint summary
- Initial evidence (attachments)

**System Result**
- Complaint ID generated
- Status set automatically:
  - Article 30 → `UNDER_HR_REVIEW`
  - Article 31 → `WITH_DISCIPLINE_COMMITTEE`

---

## 2. Article 30 Flow — Minor Complaints

### Step 2.1 — Notification to Accused
- HR sends paper notice to accused.
- 3‑day rebuttal deadline is given.

**System Update**
- Status → `WAITING_FOR_REBUTTAL`
- Notification date
- Deadline date

---

### Step 2.2 — Rebuttal Handling

#### Case A: Rebuttal Submitted
- Employee submits rebuttal on paper.

**System Update**
- Upload rebuttal and counter‑evidence
- Rebuttal received date
- Status → `UNDER_HR_ANALYSIS`

#### Case B: No Rebuttal Submitted
- Deadline passes with no response.

**System Rule**
- Guilt is **automatically assumed**.

**System Update**
- Finding = Guilty (no rebuttal)
- Status → `AWAITING_SUPERIOR_DECISION`

---

### Step 2.3 — HR Finding
- HR evaluates complaint and rebuttal (if any).

**System Update**
- Finding: Guilty / Not Guilty
- Legal reasoning
- Recommendation (if guilty)

If not guilty:
- Status → `CLOSED_NO_LIABILITY`

If guilty:
- Status → `AWAITING_SUPERIOR_DECISION`

---

### Step 2.4 — Direct Superior Decision
- Decision is made on paper.

**System Update**
- Punishment details
- Decision date
- Upload signed decision
- Status → `DECIDED`

---

### Step 2.5 — Appeal Process
- Appeals handled on paper.
- Final authority: Center Commander.

**System Update (per appeal)**
- Appeal authority
- Decision
- Upload appeal document

Final status:
- `CLOSED_FINAL`

---

## 3. Article 31 Flow — Serious Complaints

### Step 3.1 — Immediate Committee Handling
- HR forwards the case immediately after intake.

**System State**
- Status = `WITH_DISCIPLINE_COMMITTEE`

---

### Step 3.2 — Committee Investigation (Off‑System)
- Discipline Committee:
  - Notifies accused
  - Conducts hearings
  - Collects evidence

---

### Step 3.3 — Committee Finding Recorded

**System Update**
- Finding: Guilty / Not Guilty
- Upload committee investigation report

If not guilty:
- Status → `CLOSED_NO_LIABILITY`

If guilty:
- Status → `FORWARDED_TO_HQ`

---

### Step 3.4 — HQ Discipline Committee Decision

**System Update**
- Punishment decision
- Upload HQ verdict
- Status → `DECIDED_BY_HQ`

---

### Step 3.5 — Appeal to Vice Commissioner

**System Update**
- Upload appeal decision
- Status → `CLOSED_FINAL`

---

## 4. Status Reference

```
UNDER_HR_REVIEW
WAITING_FOR_REBUTTAL
UNDER_HR_ANALYSIS
AWAITING_SUPERIOR_DECISION
WITH_DISCIPLINE_COMMITTEE
FORWARDED_TO_HQ
DECIDED
DECIDED_BY_HQ
CLOSED_NO_LIABILITY
CLOSED_FINAL
```

---

## 5. Purpose of the System
- Maintain permanent legal history
- Support audits and leadership decisions
- Preserve institutional memory

This document is the **single source of truth** for workflow implementation.

