# EPPMS Backend Folder Structure

## All 17 Modules Included

```
packages/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── index.ts
│   │   ├── config.module.ts
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── auth.config.ts
│   │   └── file-storage.config.ts
│   │
│   ├── database/
│   │   ├── index.ts
│   │   ├── database.module.ts
│   │   ├── prisma.service.ts
│   │   └── seeds/
│   │       ├── seed.ts
│   │       ├── tenants.seed.ts
│   │       ├── roles.seed.ts
│   │       ├── permissions.seed.ts
│   │       ├── military-ranks.seed.ts
│   │       ├── regions.seed.ts
│   │       ├── leave-types.seed.ts
│   │       └── users.seed.ts
│   │
│   ├── common/
│   │   ├── index.ts
│   │   │
│   │   ├── decorators/
│   │   │   ├── index.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-tenant.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   └── public.decorator.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── index.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── permissions.guard.ts
│   │   │   └── tenant.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── index.ts
│   │   │   ├── audit.interceptor.ts
│   │   │   ├── tenant-context.interceptor.ts
│   │   │   ├── transform-response.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   │
│   │   ├── filters/
│   │   │   ├── index.ts
│   │   │   ├── all-exceptions.filter.ts
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   │
│   │   ├── pipes/
│   │   │   ├── index.ts
│   │   │   ├── validation.pipe.ts
│   │   │   └── parse-cuid.pipe.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── index.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   └── logger.middleware.ts
│   │   │
│   │   ├── dto/
│   │   │   ├── index.ts
│   │   │   ├── pagination-query.dto.ts
│   │   │   ├── paginated-response.dto.ts
│   │   │   └── api-response.dto.ts
│   │   │
│   │   ├── interfaces/
│   │   │   ├── index.ts
│   │   │   ├── request-with-user.interface.ts
│   │   │   ├── jwt-payload.interface.ts
│   │   │   └── paginated-result.interface.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── index.ts
│   │   │   ├── roles.constant.ts
│   │   │   ├── permissions.constant.ts
│   │   │   └── employee-types.constant.ts
│   │   │
│   │   └── utils/
│   │       ├── index.ts
│   │       ├── hash.util.ts
│   │       ├── date.util.ts
│   │       ├── ethiopian-calendar.util.ts
│   │       ├── string.util.ts
│   │       ├── file.util.ts
│   │       └── pagination.util.ts
│   │
│   └── modules/
│       │
│       │── ========================================
│       │   CORE MODULES (Auth, Users, Roles)
│       │── ========================================
│       │
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   │   ├── jwt.strategy.ts
│       │   │   └── local.strategy.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── login.dto.ts
│       │       ├── login-response.dto.ts
│       │       ├── change-password.dto.ts
│       │       └── reset-password.dto.ts
│       │
│       ├── users/                                    # Module 15
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── users.repository.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-user.dto.ts
│       │       ├── update-user.dto.ts
│       │       ├── user-filter.dto.ts
│       │       └── user-response.dto.ts
│       │
│       ├── roles/                                    # Module 15
│       │   ├── roles.module.ts
│       │   ├── roles.controller.ts
│       │   ├── roles.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-role.dto.ts
│       │       ├── update-role.dto.ts
│       │       └── role-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 8 & 16: ORGANIZATION SETTINGS
│       │── ========================================
│       │
│       ├── tenants/
│       │   ├── tenants.module.ts
│       │   ├── tenants.controller.ts
│       │   ├── tenants.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-tenant.dto.ts
│       │       ├── update-tenant.dto.ts
│       │       └── tenant-response.dto.ts
│       │
│       ├── centers/
│       │   ├── centers.module.ts
│       │   ├── centers.controller.ts
│       │   ├── centers.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-center.dto.ts
│       │       ├── update-center.dto.ts
│       │       └── center-response.dto.ts
│       │
│       ├── departments/
│       │   ├── departments.module.ts
│       │   ├── departments.controller.ts
│       │   ├── departments.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-department.dto.ts
│       │       ├── update-department.dto.ts
│       │       └── department-response.dto.ts
│       │
│       ├── positions/
│       │   ├── positions.module.ts
│       │   ├── positions.controller.ts
│       │   ├── positions.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-position.dto.ts
│       │       ├── update-position.dto.ts
│       │       └── position-response.dto.ts
│       │
│       ├── military-ranks/
│       │   ├── military-ranks.module.ts
│       │   ├── military-ranks.controller.ts
│       │   ├── military-ranks.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-rank.dto.ts
│       │       ├── update-rank.dto.ts
│       │       └── rank-response.dto.ts
│       │
│       ├── lookups/
│       │   ├── lookups.module.ts
│       │   ├── controllers/
│       │   │   ├── regions.controller.ts
│       │   │   ├── sub-cities.controller.ts
│       │   │   ├── woredas.controller.ts
│       │   │   ├── education-levels.controller.ts
│       │   │   └── relationship-types.controller.ts
│       │   ├── services/
│       │   │   ├── regions.service.ts
│       │   │   ├── sub-cities.service.ts
│       │   │   ├── woredas.service.ts
│       │   │   ├── education-levels.service.ts
│       │   │   └── relationship-types.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-region.dto.ts
│       │       ├── create-sub-city.dto.ts
│       │       ├── create-woreda.dto.ts
│       │       └── lookup-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 1: EMPLOYEE MANAGEMENT
│       │── ========================================
│       │
│       ├── employees/
│       │   ├── employees.module.ts
│       │   ├── employees.controller.ts
│       │   ├── employees.service.ts
│       │   ├── employees.repository.ts
│       │   ├── services/
│       │   │   ├── employee-id-generator.service.ts
│       │   │   ├── employee-transfer.service.ts
│       │   │   └── employee-retirement-calc.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-employee.dto.ts
│       │       ├── create-military-employee.dto.ts
│       │       ├── create-civilian-employee.dto.ts
│       │       ├── create-temporary-employee.dto.ts
│       │       ├── update-employee.dto.ts
│       │       ├── transfer-employee.dto.ts
│       │       ├── employee-filter.dto.ts
│       │       └── employee-response.dto.ts
│       │
│       ├── employee-addresses/
│       │   ├── employee-addresses.module.ts
│       │   ├── employee-addresses.controller.ts
│       │   ├── employee-addresses.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-address.dto.ts
│       │       ├── update-address.dto.ts
│       │       └── address-response.dto.ts
│       │
│       ├── employee-photos/
│       │   ├── employee-photos.module.ts
│       │   ├── employee-photos.controller.ts
│       │   ├── employee-photos.service.ts
│       │   ├── services/
│       │   │   └── photo-processor.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── upload-photo.dto.ts
│       │       ├── approve-photo.dto.ts
│       │       └── photo-response.dto.ts
│       │
│       ├── employee-education/
│       │   ├── employee-education.module.ts
│       │   ├── employee-education.controller.ts
│       │   ├── employee-education.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-education.dto.ts
│       │       ├── update-education.dto.ts
│       │       └── education-response.dto.ts
│       │
│       ├── employee-family/
│       │   ├── employee-family.module.ts
│       │   ├── employee-family.controller.ts
│       │   ├── employee-family.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-family-member.dto.ts
│       │       ├── update-family-member.dto.ts
│       │       └── family-member-response.dto.ts
│       │
│       ├── employee-work-experience/
│       │   ├── employee-work-experience.module.ts
│       │   ├── employee-work-experience.controller.ts
│       │   ├── employee-work-experience.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-work-experience.dto.ts
│       │       ├── update-work-experience.dto.ts
│       │       └── work-experience-response.dto.ts
│       │
│       ├── employee-documents/
│       │   ├── employee-documents.module.ts
│       │   ├── employee-documents.controller.ts
│       │   ├── employee-documents.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── upload-document.dto.ts
│       │       ├── update-document.dto.ts
│       │       └── document-response.dto.ts
│       │
│       ├── employee-mother-info/
│       │   ├── employee-mother-info.module.ts
│       │   ├── employee-mother-info.controller.ts
│       │   ├── employee-mother-info.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-mother-info.dto.ts
│       │       ├── update-mother-info.dto.ts
│       │       └── mother-info-response.dto.ts
│       │
│       ├── employee-emergency-contacts/
│       │   ├── employee-emergency-contacts.module.ts
│       │   ├── employee-emergency-contacts.controller.ts
│       │   ├── employee-emergency-contacts.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-emergency-contact.dto.ts
│       │       ├── update-emergency-contact.dto.ts
│       │       └── emergency-contact-response.dto.ts
│       │
│       ├── employee-rank-history/
│       │   ├── employee-rank-history.module.ts
│       │   ├── employee-rank-history.controller.ts
│       │   ├── employee-rank-history.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       └── rank-history-response.dto.ts
│       │
│       ├── employee-salary-history/
│       │   ├── employee-salary-history.module.ts
│       │   ├── employee-salary-history.controller.ts
│       │   ├── employee-salary-history.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       └── salary-history-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 2: LEAVE MANAGEMENT
│       │── ========================================
│       │
│       ├── leave/
│       │   ├── leave.module.ts
│       │   ├── controllers/
│       │   │   ├── leave-types.controller.ts
│       │   │   ├── leave-requests.controller.ts
│       │   │   └── leave-balances.controller.ts
│       │   ├── services/
│       │   │   ├── leave-types.service.ts
│       │   │   ├── leave-requests.service.ts
│       │   │   ├── leave-balances.service.ts
│       │   │   ├── leave-calculation.service.ts
│       │   │   └── leave-permit.service.ts
│       │   ├── repositories/
│       │   │   ├── leave-types.repository.ts
│       │   │   ├── leave-requests.repository.ts
│       │   │   └── leave-balances.repository.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-leave-type.dto.ts
│       │       ├── create-leave-request.dto.ts
│       │       ├── approve-leave.dto.ts
│       │       ├── reject-leave.dto.ts
│       │       ├── leave-filter.dto.ts
│       │       ├── adjust-balance.dto.ts
│       │       └── leave-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 3: HOLIDAY MANAGEMENT
│       │── ========================================
│       │
│       ├── holidays/
│       │   ├── holidays.module.ts
│       │   ├── holidays.controller.ts
│       │   ├── holidays.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-holiday.dto.ts
│       │       ├── update-holiday.dto.ts
│       │       └── holiday-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 4: APPRAISAL & PERFORMANCE
│       │── ========================================
│       │
│       ├── appraisals/
│       │   ├── appraisals.module.ts
│       │   ├── controllers/
│       │   │   ├── appraisal-periods.controller.ts
│       │   │   ├── appraisal-criteria.controller.ts
│       │   │   ├── appraisals.controller.ts
│       │   │   └── promotions.controller.ts
│       │   ├── services/
│       │   │   ├── appraisal-periods.service.ts
│       │   │   ├── appraisal-criteria.service.ts
│       │   │   ├── appraisals.service.ts
│       │   │   ├── appraisal-calculation.service.ts
│       │   │   ├── eligibility-check.service.ts
│       │   │   └── promotions.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-period.dto.ts
│       │       ├── create-criteria.dto.ts
│       │       ├── create-appraisal.dto.ts
│       │       ├── rate-criteria.dto.ts
│       │       ├── submit-appraisal.dto.ts
│       │       ├── promote-employee.dto.ts
│       │       └── appraisal-response.dto.ts
│       │
│       ├── disciplinary/
│       │   ├── disciplinary.module.ts
│       │   ├── controllers/
│       │   │   ├── disciplinary-records.controller.ts
│       │   │   └── investigations.controller.ts
│       │   ├── services/
│       │   │   ├── disciplinary-records.service.ts
│       │   │   └── investigations.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-disciplinary.dto.ts
│       │       ├── update-disciplinary.dto.ts
│       │       ├── create-investigation.dto.ts
│       │       └── disciplinary-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 5: SALARY MANAGEMENT
│       │── ========================================
│       │
│       ├── salary/
│       │   ├── salary.module.ts
│       │   ├── controllers/
│       │   │   ├── salary-scales.controller.ts
│       │   │   ├── salary-adjustments.controller.ts
│       │   │   └── salary-history.controller.ts
│       │   ├── services/
│       │   │   ├── salary-scales.service.ts
│       │   │   ├── salary-adjustments.service.ts
│       │   │   ├── salary-calculation.service.ts
│       │   │   └── step-increment.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-salary-scale.dto.ts
│       │       ├── adjust-salary.dto.ts
│       │       ├── process-increment.dto.ts
│       │       └── salary-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 6: ATTENDANCE & SHIFT
│       │── ========================================
│       │
│       ├── attendance/
│       │   ├── attendance.module.ts
│       │   ├── controllers/
│       │   │   ├── shift-definitions.controller.ts
│       │   │   ├── shift-assignments.controller.ts
│       │   │   ├── work-schedules.controller.ts
│       │   │   └── attendance-records.controller.ts
│       │   ├── services/
│       │   │   ├── shift-definitions.service.ts
│       │   │   ├── shift-assignments.service.ts
│       │   │   ├── work-schedules.service.ts
│       │   │   ├── attendance-records.service.ts
│       │   │   └── attendance-calculation.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-shift.dto.ts
│       │       ├── create-work-schedule.dto.ts
│       │       ├── assign-shift.dto.ts
│       │       ├── clock-in.dto.ts
│       │       ├── clock-out.dto.ts
│       │       ├── attendance-filter.dto.ts
│       │       └── attendance-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 7: INVENTORY MANAGEMENT
│       │── ========================================
│       │
│       ├── inventory/
│       │   ├── inventory.module.ts
│       │   ├── controllers/
│       │   │   ├── inventory-categories.controller.ts
│       │   │   ├── inventory-item-types.controller.ts
│       │   │   └── inventory-assignments.controller.ts
│       │   ├── services/
│       │   │   ├── inventory-categories.service.ts
│       │   │   ├── inventory-item-types.service.ts
│       │   │   ├── inventory-assignments.service.ts
│       │   │   └── inventory-clearance.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-category.dto.ts
│       │       ├── create-item-type.dto.ts
│       │       ├── assign-item.dto.ts
│       │       ├── return-item.dto.ts
│       │       └── inventory-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 9: RETIREMENT MANAGEMENT
│       │── ========================================
│       │
│       ├── retirement/
│       │   ├── retirement.module.ts
│       │   ├── retirement.controller.ts
│       │   ├── retirement.service.ts
│       │   ├── services/
│       │   │   ├── retirement-calculation.service.ts
│       │   │   ├── clearance.service.ts
│       │   │   └── retirement-notification.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── initiate-retirement.dto.ts
│       │       ├── update-clearance.dto.ts
│       │       ├── complete-retirement.dto.ts
│       │       └── retirement-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 10: SERVICE REWARDS
│       │── ========================================
│       │
│       ├── rewards/
│       │   ├── rewards.module.ts
│       │   ├── controllers/
│       │   │   ├── reward-milestones.controller.ts
│       │   │   └── service-rewards.controller.ts
│       │   ├── services/
│       │   │   ├── reward-milestones.service.ts
│       │   │   ├── service-rewards.service.ts
│       │   │   └── reward-eligibility.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-milestone.dto.ts
│       │       ├── check-eligibility.dto.ts
│       │       ├── award-reward.dto.ts
│       │       └── reward-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 11: COMPLAINT MANAGEMENT
│       │── ========================================
│       │
│       ├── complaints/
│       │   ├── complaints.module.ts
│       │   ├── complaints.controller.ts
│       │   ├── complaints.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-complaint.dto.ts
│       │       ├── update-complaint.dto.ts
│       │       ├── resolve-complaint.dto.ts
│       │       └── complaint-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 12: DOCUMENT TRACKING
│       │── ========================================
│       │
│       ├── documents/
│       │   ├── documents.module.ts
│       │   ├── controllers/
│       │   │   ├── document-types.controller.ts
│       │   │   ├── incoming-documents.controller.ts
│       │   │   └── outgoing-documents.controller.ts
│       │   ├── services/
│       │   │   ├── document-types.service.ts
│       │   │   ├── incoming-documents.service.ts
│       │   │   ├── outgoing-documents.service.ts
│       │   │   └── document-tracking.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-document-type.dto.ts
│       │       ├── register-incoming.dto.ts
│       │       ├── register-outgoing.dto.ts
│       │       ├── document-filter.dto.ts
│       │       └── document-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 13: REPORTS & ANALYTICS
│       │── ========================================
│       │
│       ├── reports/
│       │   ├── reports.module.ts
│       │   ├── reports.controller.ts
│       │   └── services/
│       │       ├── employee-reports.service.ts
│       │       ├── leave-reports.service.ts
│       │       ├── attendance-reports.service.ts
│       │       ├── appraisal-reports.service.ts
│       │       ├── salary-reports.service.ts
│       │       ├── retirement-reports.service.ts
│       │       └── report-export.service.ts
│       │
│       │── ========================================
│       │   MODULE 14: AUDIT LOG SYSTEM
│       │── ========================================
│       │
│       ├── audit/
│       │   ├── audit.module.ts
│       │   ├── audit.controller.ts
│       │   ├── audit.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── audit-filter.dto.ts
│       │       └── audit-response.dto.ts
│       │
│       │── ========================================
│       │   MODULE 17: DASHBOARD & NOTIFICATIONS
│       │── ========================================
│       │
│       ├── dashboard/
│       │   ├── dashboard.module.ts
│       │   ├── dashboard.controller.ts
│       │   └── services/
│       │       ├── stats.service.ts
│       │       ├── employee-stats.service.ts
│       │       ├── leave-stats.service.ts
│       │       ├── attendance-stats.service.ts
│       │       └── retirement-stats.service.ts
│       │
│       ├── notifications/
│       │   ├── notifications.module.ts
│       │   ├── notifications.controller.ts
│       │   ├── notifications.service.ts
│       │   └── dto/
│       │       ├── index.ts
│       │       ├── create-notification.dto.ts
│       │       └── notification-response.dto.ts
│       │
│       │── ========================================
│       │   SHARED FILE STORAGE
│       │── ========================================
│       │
│       └── file-storage/
│           ├── file-storage.module.ts
│           ├── file-storage.service.ts
│           ├── services/
│           │   └── image-processor.service.ts
│           └── dto/
│               └── file-upload.dto.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/
│       └── seed.ts
│
├── uploads/
│   ├── photos/
│   ├── documents/
│   └── temp/
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```


