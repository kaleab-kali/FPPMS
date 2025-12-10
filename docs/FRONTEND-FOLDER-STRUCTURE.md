# EPPMS Frontend Folder Structure

## Enterprise-Grade: React + Vite + TanStack Query/Table + i18next + Tailwind

```
apps/web/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── postcss.config.cjs
├── tailwind.config.ts
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── manifest.json
│
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── vite-env.d.ts
    │
    ├── config/
    │   ├── index.ts
    │   ├── app.ts
    │   ├── api.ts
    │   ├── routes.ts
    │   ├── query-client.ts
    │   └── constants.ts
    │
    ├── i18n/
    │   ├── index.ts
    │   ├── config.ts
    │   └── locales/
    │       ├── en/
    │       │   ├── common.json
    │       │   ├── auth.json
    │       │   ├── navigation.json
    │       │   ├── validation.json
    │       │   ├── errors.json
    │       │   ├── dashboard.json
    │       │   ├── employees.json
    │       │   ├── leave.json
    │       │   ├── holidays.json
    │       │   ├── appraisals.json
    │       │   ├── disciplinary.json
    │       │   ├── salary.json
    │       │   ├── attendance.json
    │       │   ├── inventory.json
    │       │   ├── retirement.json
    │       │   ├── rewards.json
    │       │   ├── complaints.json
    │       │   ├── documents.json
    │       │   ├── reports.json
    │       │   ├── audit.json
    │       │   ├── users.json
    │       │   ├── roles.json
    │       │   ├── organization.json
    │       │   ├── lookups.json
    │       │   └── notifications.json
    │       └── am/
    │           ├── common.json
    │           ├── auth.json
    │           ├── navigation.json
    │           ├── validation.json
    │           ├── errors.json
    │           ├── dashboard.json
    │           ├── employees.json
    │           ├── leave.json
    │           ├── holidays.json
    │           ├── appraisals.json
    │           ├── disciplinary.json
    │           ├── salary.json
    │           ├── attendance.json
    │           ├── inventory.json
    │           ├── retirement.json
    │           ├── rewards.json
    │           ├── complaints.json
    │           ├── documents.json
    │           ├── reports.json
    │           ├── audit.json
    │           ├── users.json
    │           ├── roles.json
    │           ├── organization.json
    │           ├── lookups.json
    │           └── notifications.json
    │
    ├── lib/
    │   ├── axios.ts
    │   ├── api-client.ts
    │   ├── query-client.ts
    │   ├── utils.ts
    │   ├── cn.ts
    │   ├── storage.ts
    │   ├── date.ts
    │   ├── ethiopian-calendar.ts
    │   ├── format.ts
    │   └── validators.ts
    │
    ├── types/
    │   ├── index.ts
    │   ├── api.ts
    │   ├── auth.ts
    │   ├── user.ts
    │   ├── role.ts
    │   ├── tenant.ts
    │   ├── center.ts
    │   ├── department.ts
    │   ├── position.ts
    │   ├── military-rank.ts
    │   ├── employee.ts
    │   ├── address.ts
    │   ├── education.ts
    │   ├── family.ts
    │   ├── leave.ts
    │   ├── holiday.ts
    │   ├── appraisal.ts
    │   ├── disciplinary.ts
    │   ├── salary.ts
    │   ├── attendance.ts
    │   ├── inventory.ts
    │   ├── retirement.ts
    │   ├── reward.ts
    │   ├── complaint.ts
    │   ├── document.ts
    │   ├── audit.ts
    │   ├── notification.ts
    │   ├── report.ts
    │   ├── lookup.ts
    │   └── common.ts
    │
    ├── stores/
    │   ├── index.ts
    │   ├── auth.store.ts
    │   ├── ui.store.ts
    │   ├── sidebar.store.ts
    │   └── notification.store.ts
    │
    ├── hooks/
    │   ├── index.ts
    │   ├── use-auth.ts
    │   ├── use-current-user.ts
    │   ├── use-tenant.ts
    │   ├── use-permissions.ts
    │   ├── use-debounce.ts
    │   ├── use-local-storage.ts
    │   ├── use-media-query.ts
    │   ├── use-mounted.ts
    │   ├── use-disclosure.ts
    │   └── use-toast.ts
    │
    ├── api/
    │   ├── index.ts
    │   ├── auth/
    │   │   ├── index.ts
    │   │   ├── auth.api.ts
    │   │   ├── auth.queries.ts
    │   │   ├── auth.mutations.ts
    │   │   └── auth.keys.ts
    │   ├── users/
    │   │   ├── index.ts
    │   │   ├── users.api.ts
    │   │   ├── users.queries.ts
    │   │   ├── users.mutations.ts
    │   │   └── users.keys.ts
    │   ├── roles/
    │   │   ├── index.ts
    │   │   ├── roles.api.ts
    │   │   ├── roles.queries.ts
    │   │   ├── roles.mutations.ts
    │   │   └── roles.keys.ts
    │   ├── tenants/
    │   │   ├── index.ts
    │   │   ├── tenants.api.ts
    │   │   ├── tenants.queries.ts
    │   │   ├── tenants.mutations.ts
    │   │   └── tenants.keys.ts
    │   ├── centers/
    │   │   ├── index.ts
    │   │   ├── centers.api.ts
    │   │   ├── centers.queries.ts
    │   │   ├── centers.mutations.ts
    │   │   └── centers.keys.ts
    │   ├── departments/
    │   │   ├── index.ts
    │   │   ├── departments.api.ts
    │   │   ├── departments.queries.ts
    │   │   ├── departments.mutations.ts
    │   │   └── departments.keys.ts
    │   ├── positions/
    │   │   ├── index.ts
    │   │   ├── positions.api.ts
    │   │   ├── positions.queries.ts
    │   │   ├── positions.mutations.ts
    │   │   └── positions.keys.ts
    │   ├── military-ranks/
    │   │   ├── index.ts
    │   │   ├── military-ranks.api.ts
    │   │   ├── military-ranks.queries.ts
    │   │   ├── military-ranks.mutations.ts
    │   │   └── military-ranks.keys.ts
    │   ├── lookups/
    │   │   ├── index.ts
    │   │   ├── lookups.api.ts
    │   │   ├── lookups.queries.ts
    │   │   ├── lookups.mutations.ts
    │   │   └── lookups.keys.ts
    │   ├── employees/
    │   │   ├── index.ts
    │   │   ├── employees.api.ts
    │   │   ├── employees.queries.ts
    │   │   ├── employees.mutations.ts
    │   │   └── employees.keys.ts
    │   ├── employee-addresses/
    │   │   ├── index.ts
    │   │   ├── employee-addresses.api.ts
    │   │   ├── employee-addresses.queries.ts
    │   │   ├── employee-addresses.mutations.ts
    │   │   └── employee-addresses.keys.ts
    │   ├── employee-photos/
    │   │   ├── index.ts
    │   │   ├── employee-photos.api.ts
    │   │   ├── employee-photos.queries.ts
    │   │   ├── employee-photos.mutations.ts
    │   │   └── employee-photos.keys.ts
    │   ├── employee-education/
    │   │   ├── index.ts
    │   │   ├── employee-education.api.ts
    │   │   ├── employee-education.queries.ts
    │   │   ├── employee-education.mutations.ts
    │   │   └── employee-education.keys.ts
    │   ├── employee-family/
    │   │   ├── index.ts
    │   │   ├── employee-family.api.ts
    │   │   ├── employee-family.queries.ts
    │   │   ├── employee-family.mutations.ts
    │   │   └── employee-family.keys.ts
    │   ├── employee-documents/
    │   │   ├── index.ts
    │   │   ├── employee-documents.api.ts
    │   │   ├── employee-documents.queries.ts
    │   │   ├── employee-documents.mutations.ts
    │   │   └── employee-documents.keys.ts
    │   ├── leave/
    │   │   ├── index.ts
    │   │   ├── leave.api.ts
    │   │   ├── leave.queries.ts
    │   │   ├── leave.mutations.ts
    │   │   └── leave.keys.ts
    │   ├── holidays/
    │   │   ├── index.ts
    │   │   ├── holidays.api.ts
    │   │   ├── holidays.queries.ts
    │   │   ├── holidays.mutations.ts
    │   │   └── holidays.keys.ts
    │   ├── appraisals/
    │   │   ├── index.ts
    │   │   ├── appraisals.api.ts
    │   │   ├── appraisals.queries.ts
    │   │   ├── appraisals.mutations.ts
    │   │   └── appraisals.keys.ts
    │   ├── disciplinary/
    │   │   ├── index.ts
    │   │   ├── disciplinary.api.ts
    │   │   ├── disciplinary.queries.ts
    │   │   ├── disciplinary.mutations.ts
    │   │   └── disciplinary.keys.ts
    │   ├── salary/
    │   │   ├── index.ts
    │   │   ├── salary.api.ts
    │   │   ├── salary.queries.ts
    │   │   ├── salary.mutations.ts
    │   │   └── salary.keys.ts
    │   ├── attendance/
    │   │   ├── index.ts
    │   │   ├── attendance.api.ts
    │   │   ├── attendance.queries.ts
    │   │   ├── attendance.mutations.ts
    │   │   └── attendance.keys.ts
    │   ├── inventory/
    │   │   ├── index.ts
    │   │   ├── inventory.api.ts
    │   │   ├── inventory.queries.ts
    │   │   ├── inventory.mutations.ts
    │   │   └── inventory.keys.ts
    │   ├── retirement/
    │   │   ├── index.ts
    │   │   ├── retirement.api.ts
    │   │   ├── retirement.queries.ts
    │   │   ├── retirement.mutations.ts
    │   │   └── retirement.keys.ts
    │   ├── rewards/
    │   │   ├── index.ts
    │   │   ├── rewards.api.ts
    │   │   ├── rewards.queries.ts
    │   │   ├── rewards.mutations.ts
    │   │   └── rewards.keys.ts
    │   ├── complaints/
    │   │   ├── index.ts
    │   │   ├── complaints.api.ts
    │   │   ├── complaints.queries.ts
    │   │   ├── complaints.mutations.ts
    │   │   └── complaints.keys.ts
    │   ├── documents/
    │   │   ├── index.ts
    │   │   ├── documents.api.ts
    │   │   ├── documents.queries.ts
    │   │   ├── documents.mutations.ts
    │   │   └── documents.keys.ts
    │   ├── reports/
    │   │   ├── index.ts
    │   │   ├── reports.api.ts
    │   │   ├── reports.queries.ts
    │   │   └── reports.keys.ts
    │   ├── audit/
    │   │   ├── index.ts
    │   │   ├── audit.api.ts
    │   │   ├── audit.queries.ts
    │   │   └── audit.keys.ts
    │   ├── dashboard/
    │   │   ├── index.ts
    │   │   ├── dashboard.api.ts
    │   │   ├── dashboard.queries.ts
    │   │   └── dashboard.keys.ts
    │   ├── notifications/
    │   │   ├── index.ts
    │   │   ├── notifications.api.ts
    │   │   ├── notifications.queries.ts
    │   │   ├── notifications.mutations.ts
    │   │   └── notifications.keys.ts
    │   └── file-upload/
    │       ├── index.ts
    │       ├── file-upload.api.ts
    │       └── file-upload.mutations.ts
    │
    ├── components/
    │   ├── ui/
    │   │   ├── index.ts
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── textarea.tsx
    │   │   ├── select.tsx
    │   │   ├── checkbox.tsx
    │   │   ├── radio-group.tsx
    │   │   ├── switch.tsx
    │   │   ├── label.tsx
    │   │   ├── form.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── alert-dialog.tsx
    │   │   ├── sheet.tsx
    │   │   ├── drawer.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── popover.tsx
    │   │   ├── tooltip.tsx
    │   │   ├── tabs.tsx
    │   │   ├── accordion.tsx
    │   │   ├── alert.tsx
    │   │   ├── badge.tsx
    │   │   ├── avatar.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── spinner.tsx
    │   │   ├── progress.tsx
    │   │   ├── separator.tsx
    │   │   ├── scroll-area.tsx
    │   │   ├── table.tsx
    │   │   ├── pagination.tsx
    │   │   ├── breadcrumb.tsx
    │   │   ├── calendar.tsx
    │   │   ├── date-picker.tsx
    │   │   ├── time-picker.tsx
    │   │   ├── command.tsx
    │   │   ├── combobox.tsx
    │   │   ├── multi-select.tsx
    │   │   ├── sonner.tsx
    │   │   └── toaster.tsx
    │   │
    │   ├── layout/
    │   │   ├── index.ts
    │   │   ├── root-layout.tsx
    │   │   ├── app-layout.tsx
    │   │   ├── auth-layout.tsx
    │   │   ├── header.tsx
    │   │   ├── sidebar.tsx
    │   │   ├── sidebar-nav.tsx
    │   │   ├── sidebar-item.tsx
    │   │   ├── sidebar-group.tsx
    │   │   ├── mobile-nav.tsx
    │   │   ├── footer.tsx
    │   │   ├── page-header.tsx
    │   │   ├── page-container.tsx
    │   │   └── breadcrumbs.tsx
    │   │
    │   ├── common/
    │   │   ├── index.ts
    │   │   ├── logo.tsx
    │   │   ├── theme-toggle.tsx
    │   │   ├── language-toggle.tsx
    │   │   ├── user-nav.tsx
    │   │   ├── notification-dropdown.tsx
    │   │   ├── search-command.tsx
    │   │   ├── loading-screen.tsx
    │   │   ├── error-boundary.tsx
    │   │   ├── not-found.tsx
    │   │   ├── unauthorized.tsx
    │   │   ├── confirm-dialog.tsx
    │   │   ├── delete-dialog.tsx
    │   │   ├── empty-state.tsx
    │   │   ├── page-loading.tsx
    │   │   ├── inline-loading.tsx
    │   │   ├── error-fallback.tsx
    │   │   └── suspense-wrapper.tsx
    │   │
    │   ├── data-table/
    │   │   ├── index.ts
    │   │   ├── data-table.tsx
    │   │   ├── data-table-toolbar.tsx
    │   │   ├── data-table-pagination.tsx
    │   │   ├── data-table-column-header.tsx
    │   │   ├── data-table-row-actions.tsx
    │   │   ├── data-table-faceted-filter.tsx
    │   │   ├── data-table-view-options.tsx
    │   │   └── data-table-skeleton.tsx
    │   │
    │   ├── forms/
    │   │   ├── index.ts
    │   │   ├── form-field.tsx
    │   │   ├── form-section.tsx
    │   │   ├── form-actions.tsx
    │   │   ├── ethiopian-date-picker.tsx
    │   │   ├── cascading-address.tsx
    │   │   ├── region-select.tsx
    │   │   ├── sub-city-select.tsx
    │   │   ├── woreda-select.tsx
    │   │   ├── center-select.tsx
    │   │   ├── department-select.tsx
    │   │   ├── position-select.tsx
    │   │   ├── rank-select.tsx
    │   │   ├── employee-select.tsx
    │   │   ├── leave-type-select.tsx
    │   │   ├── file-upload-field.tsx
    │   │   ├── image-upload-field.tsx
    │   │   └── phone-input.tsx
    │   │
    │   └── badges/
    │       ├── index.ts
    │       ├── status-badge.tsx
    │       ├── employee-type-badge.tsx
    │       ├── leave-status-badge.tsx
    │       ├── approval-status-badge.tsx
    │       ├── role-badge.tsx
    │       └── priority-badge.tsx
    │
    ├── features/
    │   ├── auth/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── login-form.tsx
    │   │   │   ├── change-password-form.tsx
    │   │   │   └── session-expired-dialog.tsx
    │   │   └── pages/
    │   │       ├── login.tsx
    │   │       └── change-password.tsx
    │   │
    │   ├── dashboard/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── stats-cards.tsx
    │   │   │   ├── employee-count-chart.tsx
    │   │   │   ├── leave-summary-chart.tsx
    │   │   │   ├── attendance-chart.tsx
    │   │   │   ├── upcoming-retirements.tsx
    │   │   │   ├── pending-approvals.tsx
    │   │   │   ├── recent-activities.tsx
    │   │   │   ├── quick-actions.tsx
    │   │   │   └── welcome-banner.tsx
    │   │   └── pages/
    │   │       └── dashboard.tsx
    │   │
    │   ├── users/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── user-form.tsx
    │   │   │   ├── users-table.tsx
    │   │   │   ├── users-columns.tsx
    │   │   │   ├── users-toolbar.tsx
    │   │   │   ├── user-details-card.tsx
    │   │   │   ├── user-role-assignment.tsx
    │   │   │   └── reset-password-dialog.tsx
    │   │   └── pages/
    │   │       ├── users-list.tsx
    │   │       ├── user-create.tsx
    │   │       ├── user-edit.tsx
    │   │       └── user-details.tsx
    │   │
    │   ├── roles/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── role-form.tsx
    │   │   │   ├── roles-table.tsx
    │   │   │   ├── roles-columns.tsx
    │   │   │   └── permissions-matrix.tsx
    │   │   └── pages/
    │   │       ├── roles-list.tsx
    │   │       ├── role-create.tsx
    │   │       └── role-edit.tsx
    │   │
    │   ├── organization/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── tenant-settings-form.tsx
    │   │   │   ├── centers-table.tsx
    │   │   │   ├── centers-columns.tsx
    │   │   │   ├── center-form.tsx
    │   │   │   ├── departments-table.tsx
    │   │   │   ├── departments-columns.tsx
    │   │   │   ├── department-form.tsx
    │   │   │   ├── positions-table.tsx
    │   │   │   ├── positions-columns.tsx
    │   │   │   ├── position-form.tsx
    │   │   │   ├── military-ranks-table.tsx
    │   │   │   ├── military-ranks-columns.tsx
    │   │   │   └── military-rank-form.tsx
    │   │   └── pages/
    │   │       ├── organization-settings.tsx
    │   │       ├── centers-list.tsx
    │   │       ├── center-create.tsx
    │   │       ├── center-edit.tsx
    │   │       ├── departments-list.tsx
    │   │       ├── department-create.tsx
    │   │       ├── department-edit.tsx
    │   │       ├── positions-list.tsx
    │   │       ├── position-create.tsx
    │   │       ├── position-edit.tsx
    │   │       ├── military-ranks-list.tsx
    │   │       ├── military-rank-create.tsx
    │   │       └── military-rank-edit.tsx
    │   │
    │   ├── lookups/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── regions-table.tsx
    │   │   │   ├── regions-columns.tsx
    │   │   │   ├── region-form.tsx
    │   │   │   ├── sub-cities-table.tsx
    │   │   │   ├── sub-cities-columns.tsx
    │   │   │   ├── sub-city-form.tsx
    │   │   │   ├── woredas-table.tsx
    │   │   │   ├── woredas-columns.tsx
    │   │   │   ├── woreda-form.tsx
    │   │   │   ├── education-levels-table.tsx
    │   │   │   ├── education-levels-columns.tsx
    │   │   │   ├── education-level-form.tsx
    │   │   │   ├── relationship-types-table.tsx
    │   │   │   ├── relationship-types-columns.tsx
    │   │   │   └── relationship-type-form.tsx
    │   │   └── pages/
    │   │       ├── regions-list.tsx
    │   │       ├── sub-cities-list.tsx
    │   │       ├── woredas-list.tsx
    │   │       ├── education-levels-list.tsx
    │   │       └── relationship-types-list.tsx
    │   │
    │   ├── employees/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── employees-table.tsx
    │   │   │   ├── employees-columns.tsx
    │   │   │   ├── employees-toolbar.tsx
    │   │   │   ├── employee-card.tsx
    │   │   │   ├── employee-profile-header.tsx
    │   │   │   ├── employee-status-badge.tsx
    │   │   │   ├── employee-search-dialog.tsx
    │   │   │   ├── transfer-dialog.tsx
    │   │   │   ├── forms/
    │   │   │   │   ├── basic-info-form.tsx
    │   │   │   │   ├── contact-info-form.tsx
    │   │   │   │   ├── address-form.tsx
    │   │   │   │   ├── mother-info-form.tsx
    │   │   │   │   ├── emergency-contact-form.tsx
    │   │   │   │   ├── military-info-form.tsx
    │   │   │   │   ├── civilian-info-form.tsx
    │   │   │   │   ├── temporary-info-form.tsx
    │   │   │   │   └── registration-wizard.tsx
    │   │   │   └── tabs/
    │   │   │       ├── profile-tab.tsx
    │   │   │       ├── addresses-tab.tsx
    │   │   │       ├── photos-tab.tsx
    │   │   │       ├── education-tab.tsx
    │   │   │       ├── family-tab.tsx
    │   │   │       ├── work-experience-tab.tsx
    │   │   │       ├── documents-tab.tsx
    │   │   │       ├── rank-history-tab.tsx
    │   │   │       ├── salary-history-tab.tsx
    │   │   │       ├── leave-history-tab.tsx
    │   │   │       ├── attendance-tab.tsx
    │   │   │       ├── appraisal-tab.tsx
    │   │   │       ├── disciplinary-tab.tsx
    │   │   │       └── inventory-tab.tsx
    │   │   └── pages/
    │   │       ├── employees-list.tsx
    │   │       ├── employee-register-military.tsx
    │   │       ├── employee-register-civilian.tsx
    │   │       ├── employee-register-temporary.tsx
    │   │       ├── employee-edit.tsx
    │   │       └── employee-profile.tsx
    │   │
    │   ├── leave/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── leave-requests-table.tsx
    │   │   │   ├── leave-requests-columns.tsx
    │   │   │   ├── leave-requests-toolbar.tsx
    │   │   │   ├── leave-request-form.tsx
    │   │   │   ├── leave-request-details.tsx
    │   │   │   ├── leave-approval-dialog.tsx
    │   │   │   ├── leave-rejection-dialog.tsx
    │   │   │   ├── leave-balance-card.tsx
    │   │   │   ├── leave-balances-table.tsx
    │   │   │   ├── leave-balance-adjustment-form.tsx
    │   │   │   ├── leave-calendar.tsx
    │   │   │   ├── leave-types-table.tsx
    │   │   │   ├── leave-types-columns.tsx
    │   │   │   ├── leave-type-form.tsx
    │   │   │   └── leave-permit-preview.tsx
    │   │   └── pages/
    │   │       ├── leave-requests-list.tsx
    │   │       ├── leave-request-create.tsx
    │   │       ├── leave-request-details.tsx
    │   │       ├── leave-approvals.tsx
    │   │       ├── leave-balances.tsx
    │   │       ├── leave-calendar.tsx
    │   │       ├── leave-types-list.tsx
    │   │       ├── leave-type-create.tsx
    │   │       └── leave-type-edit.tsx
    │   │
    │   ├── holidays/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── holidays-table.tsx
    │   │   │   ├── holidays-columns.tsx
    │   │   │   ├── holiday-form.tsx
    │   │   │   └── holidays-calendar.tsx
    │   │   └── pages/
    │   │       ├── holidays-list.tsx
    │   │       ├── holiday-create.tsx
    │   │       ├── holiday-edit.tsx
    │   │       └── holidays-calendar.tsx
    │   │
    │   ├── appraisals/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── appraisal-periods-table.tsx
    │   │   │   ├── appraisal-periods-columns.tsx
    │   │   │   ├── appraisal-period-form.tsx
    │   │   │   ├── appraisal-criteria-table.tsx
    │   │   │   ├── appraisal-criteria-columns.tsx
    │   │   │   ├── appraisal-criteria-form.tsx
    │   │   │   ├── appraisals-table.tsx
    │   │   │   ├── appraisals-columns.tsx
    │   │   │   ├── appraisals-toolbar.tsx
    │   │   │   ├── appraisal-form.tsx
    │   │   │   ├── appraisal-rating-form.tsx
    │   │   │   ├── appraisal-details.tsx
    │   │   │   ├── appraisal-approval-dialog.tsx
    │   │   │   ├── promotions-table.tsx
    │   │   │   ├── promotions-columns.tsx
    │   │   │   ├── promotion-form.tsx
    │   │   │   └── eligibility-check-result.tsx
    │   │   └── pages/
    │   │       ├── appraisal-periods-list.tsx
    │   │       ├── appraisal-period-create.tsx
    │   │       ├── appraisal-period-edit.tsx
    │   │       ├── appraisal-criteria-list.tsx
    │   │       ├── appraisal-criteria-create.tsx
    │   │       ├── appraisals-list.tsx
    │   │       ├── appraisal-create.tsx
    │   │       ├── appraisal-rate.tsx
    │   │       ├── appraisal-details.tsx
    │   │       ├── appraisal-approvals.tsx
    │   │       ├── promotions-list.tsx
    │   │       └── promotion-create.tsx
    │   │
    │   ├── disciplinary/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── disciplinary-table.tsx
    │   │   │   ├── disciplinary-columns.tsx
    │   │   │   ├── disciplinary-toolbar.tsx
    │   │   │   ├── disciplinary-form.tsx
    │   │   │   ├── disciplinary-details.tsx
    │   │   │   ├── investigations-table.tsx
    │   │   │   ├── investigations-columns.tsx
    │   │   │   └── investigation-form.tsx
    │   │   └── pages/
    │   │       ├── disciplinary-list.tsx
    │   │       ├── disciplinary-create.tsx
    │   │       ├── disciplinary-details.tsx
    │   │       ├── investigations-list.tsx
    │   │       ├── investigation-create.tsx
    │   │       └── investigation-details.tsx
    │   │
    │   ├── salary/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── salary-scales-table.tsx
    │   │   │   ├── salary-scales-columns.tsx
    │   │   │   ├── salary-scale-form.tsx
    │   │   │   ├── salary-adjustments-table.tsx
    │   │   │   ├── salary-adjustments-columns.tsx
    │   │   │   ├── salary-adjustment-form.tsx
    │   │   │   ├── salary-history-table.tsx
    │   │   │   ├── step-increment-form.tsx
    │   │   │   └── salary-summary-card.tsx
    │   │   └── pages/
    │   │       ├── salary-scales-list.tsx
    │   │       ├── salary-scale-create.tsx
    │   │       ├── salary-scale-edit.tsx
    │   │       ├── salary-adjustments-list.tsx
    │   │       ├── salary-adjustment-create.tsx
    │   │       ├── salary-history.tsx
    │   │       └── step-increments.tsx
    │   │
    │   ├── attendance/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── shift-definitions-table.tsx
    │   │   │   ├── shift-definitions-columns.tsx
    │   │   │   ├── shift-definition-form.tsx
    │   │   │   ├── shift-assignments-table.tsx
    │   │   │   ├── shift-assignments-columns.tsx
    │   │   │   ├── shift-assignment-form.tsx
    │   │   │   ├── shift-calendar.tsx
    │   │   │   ├── work-schedules-table.tsx
    │   │   │   ├── work-schedule-form.tsx
    │   │   │   ├── attendance-table.tsx
    │   │   │   ├── attendance-columns.tsx
    │   │   │   ├── attendance-toolbar.tsx
    │   │   │   ├── clock-in-out-form.tsx
    │   │   │   ├── attendance-summary-card.tsx
    │   │   │   └── attendance-calendar.tsx
    │   │   └── pages/
    │   │       ├── shift-definitions-list.tsx
    │   │       ├── shift-definition-create.tsx
    │   │       ├── shift-definition-edit.tsx
    │   │       ├── shift-assignments-list.tsx
    │   │       ├── shift-assignment-create.tsx
    │   │       ├── work-schedules-list.tsx
    │   │       ├── work-schedule-create.tsx
    │   │       ├── attendance-list.tsx
    │   │       ├── attendance-clock.tsx
    │   │       └── attendance-calendar.tsx
    │   │
    │   ├── inventory/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── categories-table.tsx
    │   │   │   ├── categories-columns.tsx
    │   │   │   ├── category-form.tsx
    │   │   │   ├── item-types-table.tsx
    │   │   │   ├── item-types-columns.tsx
    │   │   │   ├── item-type-form.tsx
    │   │   │   ├── assignments-table.tsx
    │   │   │   ├── assignments-columns.tsx
    │   │   │   ├── assignments-toolbar.tsx
    │   │   │   ├── assignment-form.tsx
    │   │   │   ├── return-form.tsx
    │   │   │   ├── clearance-form.tsx
    │   │   │   └── employee-inventory-list.tsx
    │   │   └── pages/
    │   │       ├── categories-list.tsx
    │   │       ├── category-create.tsx
    │   │       ├── category-edit.tsx
    │   │       ├── item-types-list.tsx
    │   │       ├── item-type-create.tsx
    │   │       ├── item-type-edit.tsx
    │   │       ├── assignments-list.tsx
    │   │       ├── assignment-create.tsx
    │   │       └── clearance.tsx
    │   │
    │   ├── retirement/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── retirements-table.tsx
    │   │   │   ├── retirements-columns.tsx
    │   │   │   ├── retirements-toolbar.tsx
    │   │   │   ├── upcoming-retirements-table.tsx
    │   │   │   ├── retirement-initiation-form.tsx
    │   │   │   ├── retirement-details.tsx
    │   │   │   ├── clearance-checklist.tsx
    │   │   │   ├── clearance-form.tsx
    │   │   │   ├── retirement-completion-form.tsx
    │   │   │   └── retirement-summary-card.tsx
    │   │   └── pages/
    │   │       ├── retirements-list.tsx
    │   │       ├── upcoming-retirements.tsx
    │   │       ├── retirement-initiate.tsx
    │   │       ├── retirement-details.tsx
    │   │       ├── retirement-clearances.tsx
    │   │       └── retirement-complete.tsx
    │   │
    │   ├── rewards/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── milestones-table.tsx
    │   │   │   ├── milestones-columns.tsx
    │   │   │   ├── milestone-form.tsx
    │   │   │   ├── rewards-table.tsx
    │   │   │   ├── rewards-columns.tsx
    │   │   │   ├── eligible-employees-table.tsx
    │   │   │   ├── award-form.tsx
    │   │   │   └── certificate-preview.tsx
    │   │   └── pages/
    │   │       ├── milestones-list.tsx
    │   │       ├── milestone-create.tsx
    │   │       ├── milestone-edit.tsx
    │   │       ├── rewards-list.tsx
    │   │       ├── eligible-employees.tsx
    │   │       └── award-reward.tsx
    │   │
    │   ├── complaints/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── complaints-table.tsx
    │   │   │   ├── complaints-columns.tsx
    │   │   │   ├── complaints-toolbar.tsx
    │   │   │   ├── complaint-form.tsx
    │   │   │   ├── complaint-details.tsx
    │   │   │   └── resolve-form.tsx
    │   │   └── pages/
    │   │       ├── complaints-list.tsx
    │   │       ├── complaint-create.tsx
    │   │       ├── complaint-details.tsx
    │   │       └── complaint-resolve.tsx
    │   │
    │   ├── documents/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── document-types-table.tsx
    │   │   │   ├── document-types-columns.tsx
    │   │   │   ├── document-type-form.tsx
    │   │   │   ├── incoming-table.tsx
    │   │   │   ├── incoming-columns.tsx
    │   │   │   ├── incoming-form.tsx
    │   │   │   ├── outgoing-table.tsx
    │   │   │   ├── outgoing-columns.tsx
    │   │   │   ├── outgoing-form.tsx
    │   │   │   ├── documents-toolbar.tsx
    │   │   │   ├── document-details.tsx
    │   │   │   └── tracking-timeline.tsx
    │   │   └── pages/
    │   │       ├── document-types-list.tsx
    │   │       ├── document-type-create.tsx
    │   │       ├── document-type-edit.tsx
    │   │       ├── incoming-list.tsx
    │   │       ├── incoming-register.tsx
    │   │       ├── outgoing-list.tsx
    │   │       ├── outgoing-register.tsx
    │   │       └── document-details.tsx
    │   │
    │   ├── reports/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── report-filters.tsx
    │   │   │   ├── report-export-button.tsx
    │   │   │   ├── report-table.tsx
    │   │   │   ├── report-chart.tsx
    │   │   │   └── report-summary-cards.tsx
    │   │   └── pages/
    │   │       ├── reports-dashboard.tsx
    │   │       ├── employee-reports.tsx
    │   │       ├── leave-reports.tsx
    │   │       ├── attendance-reports.tsx
    │   │       ├── appraisal-reports.tsx
    │   │       ├── salary-reports.tsx
    │   │       └── retirement-reports.tsx
    │   │
    │   ├── audit/
    │   │   ├── index.ts
    │   │   ├── components/
    │   │   │   ├── audit-logs-table.tsx
    │   │   │   ├── audit-logs-columns.tsx
    │   │   │   ├── audit-logs-toolbar.tsx
    │   │   │   └── audit-log-details.tsx
    │   │   └── pages/
    │   │       ├── audit-logs-list.tsx
    │   │       └── audit-log-details.tsx
    │   │
    │   └── notifications/
    │       ├── index.ts
    │       ├── components/
    │       │   ├── notifications-list.tsx
    │       │   ├── notification-item.tsx
    │       │   └── notification-settings-form.tsx
    │       └── pages/
    │           ├── notifications-list.tsx
    │           └── notification-settings.tsx
    │
    ├── routes/
    │   ├── index.tsx
    │   ├── routes.tsx
    │   ├── protected-route.tsx
    │   ├── role-guard.tsx
    │   ├── permission-guard.tsx
    │   ├── auth.routes.tsx
    │   ├── dashboard.routes.tsx
    │   ├── users.routes.tsx
    │   ├── roles.routes.tsx
    │   ├── organization.routes.tsx
    │   ├── lookups.routes.tsx
    │   ├── employees.routes.tsx
    │   ├── leave.routes.tsx
    │   ├── holidays.routes.tsx
    │   ├── appraisals.routes.tsx
    │   ├── disciplinary.routes.tsx
    │   ├── salary.routes.tsx
    │   ├── attendance.routes.tsx
    │   ├── inventory.routes.tsx
    │   ├── retirement.routes.tsx
    │   ├── rewards.routes.tsx
    │   ├── complaints.routes.tsx
    │   ├── documents.routes.tsx
    │   ├── reports.routes.tsx
    │   ├── audit.routes.tsx
    │   └── notifications.routes.tsx
    │
    └── styles/
        ├── globals.css
        ├── tailwind.css
        └── fonts.css
```

---

## Summary

| Category | Count |
|----------|-------|
| Config Files | 10 |
| i18n Namespaces | 25 × 2 languages = 50 files |
| Lib Files | 10 |
| Type Files | 31 |
| Store Files | 5 |
| Hook Files | 11 |
| API Modules | 30 (each with 5 files) = 150 files |
| UI Components | 42 |
| Layout Components | 14 |
| Common Components | 18 |
| Data Table Components | 9 |
| Form Components | 18 |
| Badge Components | 6 |
| Feature Modules | 17 |
| Route Files | 26 |
| Style Files | 3 |
| **Total** | **~500+ files** |
