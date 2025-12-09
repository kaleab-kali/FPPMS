# Frontend Structure (packages/web/)

## Complete Folder Structure

```
packages/web/
├── src/
│   ├── main.tsx                        # Application entry point
│   ├── App.tsx                         # Root component with router
│   ├── index.css                       # Global styles + Tailwind
│   ├── vite-env.d.ts                   # Vite type declarations
│   │
│   ├── assets/                         # Static assets (imported in code)
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   └── logo-dark.svg
│   │   └── fonts/
│   │
│   ├── components/                     # Shared components
│   │   ├── ui/                         # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── command.tsx
│   │   │   ├── pagination.tsx
│   │   │   └── form.tsx
│   │   │
│   │   ├── layout/                     # Layout components
│   │   │   ├── root-layout.tsx
│   │   │   ├── auth-layout.tsx
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-nav.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   └── page-header.tsx
│   │   │
│   │   └── shared/                     # Shared custom components
│   │       ├── data-table.tsx
│   │       ├── data-table-pagination.tsx
│   │       ├── data-table-toolbar.tsx
│   │       ├── data-table-column-header.tsx
│   │       ├── search-input.tsx
│   │       ├── bilingual-input.tsx
│   │       ├── ethiopian-date-picker.tsx
│   │       ├── file-upload.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── empty-state.tsx
│   │       ├── error-boundary.tsx
│   │       ├── loading-screen.tsx
│   │       ├── offline-indicator.tsx
│   │       ├── status-badge.tsx
│   │       └── language-switcher.tsx
│   │
│   ├── features/                       # Feature modules
│   │   │
│   │   ├── auth/                       # Authentication
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── forgot-password-form.tsx
│   │   │   │   └── change-password-form.tsx
│   │   │   ├── pages/
│   │   │   │   ├── login-page.tsx
│   │   │   │   └── forgot-password-page.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-auth.ts
│   │   │   └── services/
│   │   │       └── auth.service.ts
│   │   │
│   │   ├── dashboard/                  # Dashboard
│   │   │   ├── components/
│   │   │   │   ├── stats-card.tsx
│   │   │   │   ├── recent-activity.tsx
│   │   │   │   ├── quick-actions.tsx
│   │   │   │   └── announcements.tsx
│   │   │   └── pages/
│   │   │       └── dashboard-page.tsx
│   │   │
│   │   ├── employees/                  # Employee Management
│   │   │   ├── components/
│   │   │   │   ├── employee-list.tsx
│   │   │   │   ├── employee-table.tsx
│   │   │   │   ├── employee-card.tsx
│   │   │   │   ├── employee-form.tsx
│   │   │   │   ├── military-employee-form.tsx
│   │   │   │   ├── civilian-employee-form.tsx
│   │   │   │   ├── temporary-employee-form.tsx
│   │   │   │   ├── employee-detail.tsx
│   │   │   │   ├── employee-tabs.tsx
│   │   │   │   ├── personal-info-tab.tsx
│   │   │   │   ├── employment-info-tab.tsx
│   │   │   │   ├── history-tab.tsx
│   │   │   │   ├── transfer-form.tsx
│   │   │   │   ├── transfer-dialog.tsx
│   │   │   │   └── employee-filters.tsx
│   │   │   ├── pages/
│   │   │   │   ├── employees-page.tsx
│   │   │   │   ├── employee-detail-page.tsx
│   │   │   │   ├── create-employee-page.tsx
│   │   │   │   └── edit-employee-page.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-employees.ts
│   │   │   │   └── use-employee.ts
│   │   │   └── services/
│   │   │       └── employees.service.ts
│   │   │
│   │   ├── leave/                      # Leave Management
│   │   │   ├── components/
│   │   │   │   ├── leave-request-list.tsx
│   │   │   │   ├── leave-request-table.tsx
│   │   │   │   ├── leave-request-form.tsx
│   │   │   │   ├── leave-request-detail.tsx
│   │   │   │   ├── leave-balance-card.tsx
│   │   │   │   ├── leave-balance-list.tsx
│   │   │   │   ├── leave-calendar.tsx
│   │   │   │   ├── approval-actions.tsx
│   │   │   │   ├── rejection-dialog.tsx
│   │   │   │   └── leave-filters.tsx
│   │   │   ├── pages/
│   │   │   │   ├── leave-page.tsx
│   │   │   │   ├── leave-requests-page.tsx
│   │   │   │   ├── leave-request-detail-page.tsx
│   │   │   │   ├── leave-balances-page.tsx
│   │   │   │   ├── leave-approvals-page.tsx
│   │   │   │   └── leave-calendar-page.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-leave-requests.ts
│   │   │   │   └── use-leave-balances.ts
│   │   │   └── services/
│   │   │       └── leave.service.ts
│   │   │
│   │   ├── appraisals/                 # Appraisal & Rank
│   │   │   ├── components/
│   │   │   │   ├── appraisal-list.tsx
│   │   │   │   ├── appraisal-table.tsx
│   │   │   │   ├── appraisal-form.tsx
│   │   │   │   ├── appraisal-detail.tsx
│   │   │   │   ├── criteria-rating.tsx
│   │   │   │   ├── criteria-form.tsx
│   │   │   │   ├── period-list.tsx
│   │   │   │   ├── period-form.tsx
│   │   │   │   ├── grade-badge.tsx
│   │   │   │   ├── promotion-form.tsx
│   │   │   │   ├── promotion-dialog.tsx
│   │   │   │   ├── rank-history.tsx
│   │   │   │   └── appraisal-filters.tsx
│   │   │   ├── pages/
│   │   │   │   ├── appraisals-page.tsx
│   │   │   │   ├── appraisal-detail-page.tsx
│   │   │   │   ├── create-appraisal-page.tsx
│   │   │   │   ├── appraisal-periods-page.tsx
│   │   │   │   ├── appraisal-criteria-page.tsx
│   │   │   │   └── promotions-page.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-appraisals.ts
│   │   │   │   └── use-periods.ts
│   │   │   └── services/
│   │   │       └── appraisals.service.ts
│   │   │
│   │   ├── salary/                     # Salary & Payroll
│   │   │   ├── components/
│   │   │   │   ├── salary-list.tsx
│   │   │   │   ├── salary-table.tsx
│   │   │   │   ├── salary-form.tsx
│   │   │   │   ├── salary-detail.tsx
│   │   │   │   ├── salary-history.tsx
│   │   │   │   ├── grade-list.tsx
│   │   │   │   ├── grade-form.tsx
│   │   │   │   ├── raise-form.tsx
│   │   │   │   ├── raise-batch-form.tsx
│   │   │   │   └── salary-filters.tsx
│   │   │   ├── pages/
│   │   │   │   ├── salary-page.tsx
│   │   │   │   ├── salary-records-page.tsx
│   │   │   │   ├── salary-grades-page.tsx
│   │   │   │   └── salary-raises-page.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-salary-records.ts
│   │   │   │   └── use-salary-grades.ts
│   │   │   └── services/
│   │   │       └── salary.service.ts
│   │   │
│   │   ├── rewards/                    # Service Rewards
│   │   │   ├── components/
│   │   │   │   ├── reward-list.tsx
│   │   │   │   ├── reward-table.tsx
│   │   │   │   ├── reward-form.tsx
│   │   │   │   ├── reward-detail.tsx
│   │   │   │   ├── eligible-list.tsx
│   │   │   │   ├── upcoming-list.tsx
│   │   │   │   └── reward-filters.tsx
│   │   │   ├── pages/
│   │   │   │   ├── rewards-page.tsx
│   │   │   │   ├── reward-detail-page.tsx
│   │   │   │   ├── eligible-rewards-page.tsx
│   │   │   │   └── upcoming-rewards-page.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-rewards.ts
│   │   │   └── services/
│   │   │       └── rewards.service.ts
│   │   │
│   │   ├── retirement/                 # Retirement
│   │   │   ├── components/
│   │   │   │   ├── retirement-list.tsx
│   │   │   │   ├── retirement-table.tsx
│   │   │   │   ├── retirement-form.tsx
│   │   │   │   ├── retirement-detail.tsx
│   │   │   │   ├── retirement-calculation.tsx
│   │   │   │   ├── clearance-checklist.tsx
│   │   │   │   ├── eligible-list.tsx
│   │   │   │   └── retirement-filters.tsx
│   │   │   ├── pages/
│   │   │   │   ├── retirement-page.tsx
│   │   │   │   ├── retirement-detail-page.tsx
│   │   │   │   ├── create-retirement-page.tsx
│   │   │   │   └── eligible-retirement-page.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-retirement.ts
│   │   │   └── services/
│   │   │       └── retirement.service.ts
│   │   │
│   │   ├── complaints/                 # Complaints
│   │   │   ├── components/
│   │   │   │   ├── complaint-list.tsx
│   │   │   │   ├── complaint-table.tsx
│   │   │   │   ├── complaint-form.tsx
│   │   │   │   ├── complaint-detail.tsx
│   │   │   │   ├── assignment-form.tsx
│   │   │   │   ├── resolution-form.tsx
│   │   │   │   ├── investigation-notes.tsx
│   │   │   │   └── complaint-filters.tsx
│   │   │   ├── pages/
│   │   │   │   ├── complaints-page.tsx
│   │   │   │   ├── complaint-detail-page.tsx
│   │   │   │   ├── create-complaint-page.tsx
│   │   │   │   └── my-complaints-page.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-complaints.ts
│   │   │   └── services/
│   │   │       └── complaints.service.ts
│   │   │
│   │   ├── documents/                  # Document Tracking
│   │   │   ├── components/
│   │   │   │   ├── document-list.tsx
│   │   │   │   ├── document-table.tsx
│   │   │   │   ├── document-form.tsx
│   │   │   │   ├── document-detail.tsx
│   │   │   │   ├── document-preview.tsx
│   │   │   │   └── document-filters.tsx
│   │   │   ├── pages/
│   │   │   │   ├── documents-page.tsx
│   │   │   │   ├── document-detail-page.tsx
│   │   │   │   ├── create-document-page.tsx
│   │   │   │   ├── incoming-documents-page.tsx
│   │   │   │   └── outgoing-documents-page.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-documents.ts
│   │   │   └── services/
│   │   │       └── documents.service.ts
│   │   │
│   │   ├── settings/                   # Settings
│   │   │   ├── components/
│   │   │   │   ├── tenant-settings.tsx
│   │   │   │   ├── user-settings.tsx
│   │   │   │   ├── department-settings.tsx
│   │   │   │   ├── position-settings.tsx
│   │   │   │   ├── rank-settings.tsx
│   │   │   │   └── leave-type-settings.tsx
│   │   │   └── pages/
│   │   │       ├── settings-page.tsx
│   │   │       ├── departments-settings-page.tsx
│   │   │       ├── positions-settings-page.tsx
│   │   │       └── leave-types-settings-page.tsx
│   │   │
│   │   ├── reports/                    # Reports
│   │   │   ├── components/
│   │   │   │   ├── report-filters.tsx
│   │   │   │   └── report-export.tsx
│   │   │   └── pages/
│   │   │       ├── reports-page.tsx
│   │   │       ├── employee-reports-page.tsx
│   │   │       ├── leave-reports-page.tsx
│   │   │       ├── appraisal-reports-page.tsx
│   │   │       └── salary-reports-page.tsx
│   │   │
│   │   └── audit/                      # Audit Log Viewer
│   │       ├── components/
│   │       │   ├── audit-log-list.tsx
│   │       │   ├── audit-log-detail.tsx
│   │       │   └── audit-filters.tsx
│   │       └── pages/
│   │           └── audit-logs-page.tsx
│   │
│   ├── hooks/                          # Global hooks
│   │   ├── use-api.ts
│   │   ├── use-pagination.ts
│   │   ├── use-debounce.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-media-query.ts
│   │   ├── use-toast.ts
│   │   └── use-theme.ts
│   │
│   ├── lib/                            # Utilities
│   │   ├── api-client.ts               # Axios instance
│   │   ├── query-client.ts             # React Query setup
│   │   ├── utils.ts                    # cn() and helpers
│   │   ├── validators.ts               # Zod schemas
│   │   ├── constants.ts                # App constants
│   │   └── ethiopian-calendar.ts       # Date conversion
│   │
│   ├── routes/                         # Routing
│   │   ├── index.tsx                   # Route definitions
│   │   ├── protected-route.tsx
│   │   └── routes.ts                   # Route constants
│   │
│   ├── stores/                         # State management
│   │   ├── auth-store.ts
│   │   ├── tenant-store.ts
│   │   ├── ui-store.ts
│   │   └── language-store.ts
│   │
│   ├── types/                          # TypeScript types
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── employee.types.ts
│   │   ├── leave.types.ts
│   │   ├── appraisal.types.ts
│   │   ├── salary.types.ts
│   │   ├── reward.types.ts
│   │   ├── retirement.types.ts
│   │   ├── complaint.types.ts
│   │   ├── document.types.ts
│   │   └── api.types.ts
│   │
│   └── locales/                        # i18n translations
│       ├── en/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── employees.json
│       │   ├── leave.json
│       │   ├── appraisals.json
│       │   ├── salary.json
│       │   ├── rewards.json
│       │   ├── retirement.json
│       │   ├── complaints.json
│       │   └── documents.json
│       └── am/
│           ├── common.json
│           ├── auth.json
│           ├── employees.json
│           └── ... (same structure)
│
├── public/                             # Static public assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── manifest.json
│
├── components.json                     # shadcn/ui config
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Import Convention

All imports use `#web/*` alias:

```typescript
import { Button } from '#web/components/ui/button';
import { useAuth } from '#web/features/auth/hooks/use-auth';
import { cn } from '#web/lib/utils';
```
