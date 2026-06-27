# Project Management & Monitoring System – Implementation Plan

## Overview
Build a complete project intake-to-closure workflow with approval gates and project registry. MVP scope: core workflows end-to-end with mock data and simulated AI features. Focus on forms, approvals, status tracking, and checklists before advanced analytics.

## Current State
- **Existing:** Project registry page (Projects.tsx), intake modal, bulk import wizard, approval queue, project drawer with S-curve, closure checklist components
- **Data:** Mock project data in mockData.ts, draft projects and workflow samples in projectWorkflowData.ts
- **Gap:** Workflows are partially wired; several UI/logic pieces incomplete

## MVP Scope (Phase 1)

### 1. **Project Intake & Creation** (Forms + Data Entry)
**What:** Complete intake form capturing all required fields
- Title, description, sector
- Location (municipality/barangay, optional GIS pin drop)
- Fund source, contract amount
- Implementing office, contractor
- Target start/end dates
- AIP/CDP indicator
- File attachments (POW/contract)

**Deliverables:**
- Fix ProjectIntakeModal.tsx — ensure all fields map correctly to DraftProject type
- Add basic form validation (required fields, date logic)
- Mock duplicate detection (visual flag with hardcoded similarity scores)
- Mock AI auto-fill on file upload (pre-populate with plausible defaults)
- Mock auto-classification (suggest sector/fund based on keywords in description)

**Files to modify:** ProjectIntakeModal.tsx, types/index.ts (if needed)

### 2. **Intake Approval Workflow** (Multi-role Gate)
**What:** Sequential approval with role-based status transitions
- PPDO validates scope/location/AIP linkage → PEO confirms structural feasibility → Budget Office confirms fund availability
- Each role can approve with remarks or reject with reason
- Draft stays "pending" until final approval, then moves to "live" registry

**Current:** Mostly implemented in IntakeQueuePanel.tsx; verify:
- Status progression logic (pending_ppdo → pending_peo → pending_budget → approved/rejected)
- Approval remarks and audit trail
- Rejection flow with resubmit capability

**Deliverables:**
- Verify IntakeQueuePanel.tsx displays all pending projects with role-specific views
- Ensure handleApprove/handleReject in Projects.tsx correctly tracks approvals
- Add "Resubmit after rejection" button in intake queue
- Show full audit trail of approvals in project drawer

**Files to modify:** IntakeQueuePanel.tsx, Projects.tsx, ProjectDrawer.tsx

### 3. **Bulk Import** (Excel/AIP Upload)
**What:** Upload multiple projects at once; preview, validate, auto-reject duplicates, submit batch to intake
- File parser (CSV/Excel → DraftProject array)
- Validation summary (valid/duplicate/error rows)
- Duplicate flagging using mock geospatial + text matching
- Batch submission to workflow

**Current:** BulkImportWizard.tsx exists but needs completion

**Deliverables:**
- Complete BulkImportWizard: file upload → preview → validation → submit
- Mock duplicate detection logic (compare against existing projects)
- Show validation report (X valid, Y duplicates, Z errors)
- Submit all valid rows to intake queue at once

**Files to modify:** BulkImportWizard.tsx, projectWorkflowData.ts (if sample data needs expansion)

### 4. **Project Registry** (Live Projects Dashboard)
**What:** Searchable, filterable table of approved/live projects with status, fund, contract amount, progress
- Status: planned/ongoing/delayed/completed/suspended
- Filters: status, fund source, municipality
- Click to view details in drawer

**Current:** Projects.tsx registry tab mostly done

**Deliverables:**
- Verify filtering works (status, fund, municipality search)
- Add sorting (by name, status, contract amount, progress variance)
- Link to project drawer for details
- Show summary KPIs at top (total, ongoing, delayed, completed, suspended)

**Files to modify:** Projects.tsx (minimal), ensure mockData.ts has sample projects

### 5. **Project Status Tracking & S-Curve**
**What:** Track planned vs. actual progress; S-curve visualization of cumulative progress over time
- Progress bars (planned vs. actual)
- S-curve chart (months vs. %)
- Variance alerts (if actual behind planned)

**Current:** SCurveChart.tsx exists; Projects.tsx shows progress bars

**Deliverables:**
- Wire SCurveChart in ProjectDrawer to show project's sCurve data
- Ensure progress update API is mocked (manual update in drawer)
- Show variance indicators (on-track/behind/ahead)

**Files to modify:** ProjectDrawer.tsx, SCurveChart.tsx, Projects.tsx

### 6. **Edit History & Versioning**
**What:** Log every change (budget revision, timeline extension, contractor change, status update) with timestamp, user, reason
- Immutable log entry per change
- Searchable by project, field, date, user

**Current:** EditHistoryPanel.tsx exists; editHistory sample data in projectWorkflowData.ts

**Deliverables:**
- Wire EditHistoryPanel in ProjectDrawer
- Mock "update project" button (e.g., change status, budget, timeline)
- Each update creates log entry with reason/remarks
- Show reason/category for traceability

**Files to modify:** ProjectDrawer.tsx, EditHistoryPanel.tsx, Projects.tsx (add update handlers)

### 7. **Project Closure Checklist**
**What:** Final sign-off before "completed": inspection, photos, docs, liquidation
- Checklist items (final inspection, photos, punchlist, certificate, turnover, liquidation, warranty)
- Mark complete with attachment + user/date
- Block closure if required items incomplete

**Current:** ClosureChecklist.tsx exists; closure sample data in projectWorkflowData.ts

**Deliverables:**
- Wire ClosureChecklist in ProjectDrawer (for completed/near-complete projects)
- Mock upload attachments for checklist items
- Show "Ready for closure" button when all required items done
- Update project status to "completed" on final sign-off

**Files to modify:** ProjectDrawer.tsx, ClosureChecklist.tsx, Projects.tsx (add closure handler)

### 8. **Simulated AI Features** (Mock/UI-Only)
**What:** Show AI capabilities without real backend yet; placeholder for future integration

**Duplicate Detection:**
- On intake form submit, show hardcoded match flags (similarity % by location & scope)
- User can accept duplicate flag and cancel, or override and proceed
- Populated from bulkImportSampleRows duplicateOf field

**Auto-Fill from Documents:**
- File upload (POW/contract) → mock OCR (pre-fill form with hardcoded values)
- Show "Extracted from [filename]" label for each auto-filled field

**Auto-Classification:**
- Analyze description text → suggest sector, fund source, AIP indicator
- Show confidence % and allow user to accept/edit
- Mock logic: keyword matching (e.g., "irrigation" → Agriculture + NTA)

**Deliverables:**
- ProjectIntakeModal.tsx: add duplicate-detection warning + override
- Add file-upload handler that mock-extracts data
- Add AI classification suggestion card below description field
- Show all as "Demo Mode" so user knows it's simulated

**Files to modify:** ProjectIntakeModal.tsx, types/index.ts

---

## Implementation Order
1. **Fix ProjectIntakeModal** — all fields, validation, mock AI features
2. **Complete IntakeQueuePanel** — role-based approval, remarks, rejection
3. **Wire ProjectDrawer** — integrate EditHistoryPanel, ClosureChecklist, status updates
4. **Polish Projects.tsx** — filtering, sorting, summary stats
5. **Complete BulkImportWizard** — file parsing, validation, batch submit
6. **Add mock S-Curve and progress tracking** — link chart, variance alerts

## Key Data Flows
- **Intake:** User submits form → mock duplicate check → workflow queue (pending_ppdo) → sequential approvals → approved state
- **Approval:** Role reviews, adds remarks, approves → next role's turn (or rejection)
- **Registry:** Approved projects appear in live table; click → drawer with history/closure
- **Bulk Import:** Upload → parse → validate (mock duplicate check) → batch submit to intake
- **Closure:** Project status = "completed" → unlock closure checklist tab → check off items → final sign-off

## Mock Data Strategy
- mockData.ts: 8-10 approved live projects with various statuses
- projectWorkflowData.ts: 4 draft projects at different workflow stages + sample edits + closure checklists
- BulkImportWizard: sample rows (valid, duplicate, error) for demo

## Success Criteria
- ✓ User can submit new project intake form with all fields
- ✓ Draft projects flow through PPDO → PEO → Budget approval workflow
- ✓ Approved projects appear in registry with filters and sorting
- ✓ Click project → see full details, edit history, status updates, S-curve
- ✓ Completed projects can be closed with checklist
- ✓ Bulk import parses file and submits batch
- ✓ Mock AI features (duplicate, auto-fill, classification) show and respond to user input
- ✓ All workflows use mock data; no backend calls
