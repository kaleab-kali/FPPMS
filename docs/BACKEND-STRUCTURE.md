# Backend Structure (packages/api/)

## Complete Folder Structure

```
packages/api/
├── src/
│   ├── main.ts                         # Application entry point
│   ├── app.module.ts                   # Root module
│   │
│   ├── config/                         # Configuration
│   │   ├── config.module.ts
│   │   ├── database.config.ts
│   │   ├── auth.config.ts
│   │   └── app.config.ts
│   │
│   ├── database/                       # Database layer
│   │   ├── database.module.ts
│   │   ├── prisma.service.ts
│   │   ├── prisma.extension.ts         # Soft delete, audit extensions
│   │   └── seeds/
│   │       ├── index.ts
│   │       ├── tenants.seed.ts
│   │       ├── roles.seed.ts
│   │       ├── leave-types.seed.ts
│   │       └── military-ranks.seed.ts
│   │
│   ├── common/                         # Shared utilities
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-tenant.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── api-pagination.decorator.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── tenant.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   ├── audit.interceptor.ts
│   │   │   ├── tenant-context.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   │
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   │
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts
│   │   │   └── parse-uuid.pipe.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── tenant.middleware.ts
│   │   │   └── logger.middleware.ts
│   │   │
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   ├── pagination-response.dto.ts
│   │   │   └── api-response.dto.ts
│   │   │
│   │   ├── interfaces/
│   │   │   ├── request-with-user.interface.ts
│   │   │   ├── paginated-result.interface.ts
│   │   │   └── audit-context.interface.ts
│   │   │
│   │   └── utils/
│   │       ├── ethiopian-calendar.util.ts
│   │       ├── hash.util.ts
│   │       ├── date.util.ts
│   │       └── string.util.ts
│   │
│   └── modules/                        # Feature modules
│       │
│       ├── auth/                       # Authentication
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   │   └── jwt.strategy.ts
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   ├── register.dto.ts
│       │   │   ├── change-password.dto.ts
│       │   │   ├── reset-password.dto.ts
│       │   │   └── auth-response.dto.ts
│       │   └── interfaces/
│       │       └── jwt-payload.interface.ts
│       │
│       ├── users/                      # User management
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── users.repository.ts
│       │   └── dto/
│       │       ├── create-user.dto.ts
│       │       ├── update-user.dto.ts
│       │       └── user-response.dto.ts
│       │
│       ├── tenants/                    # Multi-tenancy
│       │   ├── tenants.module.ts
│       │   ├── tenants.controller.ts
│       │   ├── tenants.service.ts
│       │   ├── tenants.repository.ts
│       │   └── dto/
│       │       ├── create-tenant.dto.ts
│       │       ├── update-tenant.dto.ts
│       │       └── tenant-response.dto.ts
│       │
│       ├── employees/                  # Employee management
│       │   ├── employees.module.ts
│       │   ├── employees.controller.ts
│       │   ├── employees.service.ts
│       │   ├── employees.repository.ts
│       │   ├── dto/
│       │   │   ├── create-employee.dto.ts
│       │   │   ├── create-military-employee.dto.ts
│       │   │   ├── create-civilian-employee.dto.ts
│       │   │   ├── create-temporary-employee.dto.ts
│       │   │   ├── update-employee.dto.ts
│       │   │   ├── transfer-employee.dto.ts
│       │   │   ├── employee-filter.dto.ts
│       │   │   └── employee-response.dto.ts
│       │   └── services/
│       │       ├── employee-transfer.service.ts
│       │       └── employee-number.service.ts
│       │
│       ├── departments/                # Department management
│       │   ├── departments.module.ts
│       │   ├── departments.controller.ts
│       │   ├── departments.service.ts
│       │   ├── departments.repository.ts
│       │   └── dto/
│       │       ├── create-department.dto.ts
│       │       ├── update-department.dto.ts
│       │       └── department-response.dto.ts
│       │
│       ├── positions/                  # Position management
│       │   ├── positions.module.ts
│       │   ├── positions.controller.ts
│       │   ├── positions.service.ts
│       │   ├── positions.repository.ts
│       │   └── dto/
│       │       ├── create-position.dto.ts
│       │       ├── update-position.dto.ts
│       │       └── position-response.dto.ts
│       │
│       ├── military-ranks/             # Military rank management
│       │   ├── military-ranks.module.ts
│       │   ├── military-ranks.controller.ts
│       │   ├── military-ranks.service.ts
│       │   ├── military-ranks.repository.ts
│       │   └── dto/
│       │       ├── create-rank.dto.ts
│       │       ├── update-rank.dto.ts
│       │       └── rank-response.dto.ts
│       │
│       ├── leave/                      # Leave management
│       │   ├── leave.module.ts
│       │   ├── controllers/
│       │   │   ├── leave-requests.controller.ts
│       │   │   ├── leave-types.controller.ts
│       │   │   └── leave-balances.controller.ts
│       │   ├── services/
│       │   │   ├── leave-requests.service.ts
│       │   │   ├── leave-types.service.ts
│       │   │   ├── leave-balances.service.ts
│       │   │   └── leave-calculation.service.ts
│       │   ├── repositories/
│       │   │   ├── leave-requests.repository.ts
│       │   │   ├── leave-types.repository.ts
│       │   │   └── leave-balances.repository.ts
│       │   └── dto/
│       │       ├── create-leave-request.dto.ts
│       │       ├── update-leave-request.dto.ts
│       │       ├── approve-leave.dto.ts
│       │       ├── reject-leave.dto.ts
│       │       ├── leave-filter.dto.ts
│       │       ├── adjust-balance.dto.ts
│       │       └── leave-response.dto.ts
│       │
│       ├── appraisals/                 # Appraisal & Rank
│       │   ├── appraisals.module.ts
│       │   ├── controllers/
│       │   │   ├── appraisals.controller.ts
│       │   │   ├── appraisal-periods.controller.ts
│       │   │   ├── appraisal-criteria.controller.ts
│       │   │   └── promotions.controller.ts
│       │   ├── services/
│       │   │   ├── appraisals.service.ts
│       │   │   ├── appraisal-periods.service.ts
│       │   │   ├── appraisal-criteria.service.ts
│       │   │   ├── appraisal-calculation.service.ts
│       │   │   └── promotions.service.ts
│       │   ├── repositories/
│       │   │   ├── appraisals.repository.ts
│       │   │   ├── appraisal-periods.repository.ts
│       │   │   └── appraisal-criteria.repository.ts
│       │   └── dto/
│       │       ├── create-appraisal.dto.ts
│       │       ├── update-appraisal.dto.ts
│       │       ├── submit-appraisal.dto.ts
│       │       ├── rate-criteria.dto.ts
│       │       ├── create-period.dto.ts
│       │       ├── create-criteria.dto.ts
│       │       ├── promote-employee.dto.ts
│       │       └── appraisal-response.dto.ts
│       │
│       ├── salary/                     # Salary & Payroll
│       │   ├── salary.module.ts
│       │   ├── controllers/
│       │   │   ├── salary-records.controller.ts
│       │   │   ├── salary-grades.controller.ts
│       │   │   └── salary-raises.controller.ts
│       │   ├── services/
│       │   │   ├── salary-records.service.ts
│       │   │   ├── salary-grades.service.ts
│       │   │   ├── salary-raises.service.ts
│       │   │   └── salary-calculation.service.ts
│       │   ├── repositories/
│       │   │   ├── salary-records.repository.ts
│       │   │   └── salary-grades.repository.ts
│       │   └── dto/
│       │       ├── create-salary-record.dto.ts
│       │       ├── update-salary-record.dto.ts
│       │       ├── create-salary-grade.dto.ts
│       │       ├── process-raise.dto.ts
│       │       └── salary-response.dto.ts
│       │
│       ├── rewards/                    # Service Rewards
│       │   ├── rewards.module.ts
│       │   ├── rewards.controller.ts
│       │   ├── rewards.service.ts
│       │   ├── rewards.repository.ts
│       │   ├── services/
│       │   │   └── eligibility.service.ts
│       │   └── dto/
│       │       ├── create-reward.dto.ts
│       │       ├── update-reward.dto.ts
│       │       ├── approve-reward.dto.ts
│       │       └── reward-response.dto.ts
│       │
│       ├── retirement/                 # Retirement
│       │   ├── retirement.module.ts
│       │   ├── retirement.controller.ts
│       │   ├── retirement.service.ts
│       │   ├── retirement.repository.ts
│       │   ├── services/
│       │   │   ├── retirement-calculation.service.ts
│       │   │   └── clearance.service.ts
│       │   └── dto/
│       │       ├── create-retirement.dto.ts
│       │       ├── update-retirement.dto.ts
│       │       ├── approve-retirement.dto.ts
│       │       └── retirement-response.dto.ts
│       │
│       ├── complaints/                 # Complaints
│       │   ├── complaints.module.ts
│       │   ├── complaints.controller.ts
│       │   ├── complaints.service.ts
│       │   ├── complaints.repository.ts
│       │   ├── services/
│       │   │   └── complaint-assignment.service.ts
│       │   └── dto/
│       │       ├── create-complaint.dto.ts
│       │       ├── update-complaint.dto.ts
│       │       ├── assign-complaint.dto.ts
│       │       ├── resolve-complaint.dto.ts
│       │       └── complaint-response.dto.ts
│       │
│       ├── documents/                  # Document Tracking
│       │   ├── documents.module.ts
│       │   ├── documents.controller.ts
│       │   ├── documents.service.ts
│       │   ├── documents.repository.ts
│       │   ├── services/
│       │   │   └── file-upload.service.ts
│       │   └── dto/
│       │       ├── create-document.dto.ts
│       │       ├── update-document.dto.ts
│       │       ├── document-filter.dto.ts
│       │       └── document-response.dto.ts
│       │
│       ├── audit/                      # Audit Logging
│       │   ├── audit.module.ts
│       │   ├── audit.controller.ts
│       │   ├── audit.service.ts
│       │   ├── audit.repository.ts
│       │   └── dto/
│       │       ├── audit-filter.dto.ts
│       │       └── audit-response.dto.ts
│       │
│       └── reports/                    # Reports
│           ├── reports.module.ts
│           ├── reports.controller.ts
│           └── services/
│               ├── employee-reports.service.ts
│               ├── leave-reports.service.ts
│               ├── appraisal-reports.service.ts
│               └── salary-reports.service.ts
│
├── prisma/
│   ├── schema.prisma                   # Database schema
│   ├── migrations/                     # Database migrations
│   └── seed.ts                         # Seed script entry
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Import Convention

All imports use `#api/*` alias:

```typescript
import { PrismaService } from '#api/database/prisma.service';
import { AuthGuard } from '#api/common/guards/auth.guard';
import { EmployeesService } from '#api/modules/employees/employees.service';
```
