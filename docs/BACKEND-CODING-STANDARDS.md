# EPPMS Backend Coding Standards & Principles

## NestJS + TypeScript + Prisma Best Practices

---

# 1. SOLID Principles

## 1.1 Single Responsibility Principle (SRP)

### Rule
Each class/module should have only ONE reason to change.

### ❌ Bad Example
```typescript
// BAD: Service doing too many things
@Injectable()
export class EmployeeService {
  async createEmployee(dto: CreateEmployeeDto) { /* ... */ }
  async sendWelcomeEmail(employee: Employee) { /* ... */ }
  async generateEmployeeNumber() { /* ... */ }
  async calculateSalary(employee: Employee) { /* ... */ }
  async uploadPhoto(file: File) { /* ... */ }
}
```

### ✅ Good Example
```typescript
// GOOD: Separate services for separate concerns
@Injectable()
export class EmployeesService {
  constructor(
    private readonly employeeNumberService: EmployeeNumberService,
    private readonly notificationService: NotificationService,
  ) {}
  
  async create(dto: CreateEmployeeDto) { /* employee CRUD only */ }
}

@Injectable()
export class EmployeeNumberService {
  async generate(tenantId: string, type: EmployeeType) { /* ... */ }
}

@Injectable()
export class NotificationService {
  async sendWelcomeEmail(employee: Employee) { /* ... */ }
}
```

### Application in EPPMS
- `EmployeesService` - CRUD operations only
- `EmployeeNumberService` - Number generation logic
- `EmployeeTransferService` - Transfer logic
- `SalaryCalculationService` - Salary calculations
- `LeaveCalculationService` - Leave balance calculations

---

## 1.2 Open/Closed Principle (OCP)

### Rule
Classes should be open for extension but closed for modification.

### ❌ Bad Example
```typescript
// BAD: Need to modify this class for each new employee type
@Injectable()
export class SalaryService {
  calculateSalary(employee: Employee) {
    if (employee.type === 'MILITARY') {
      // military salary logic
    } else if (employee.type === 'CIVILIAN') {
      // civilian salary logic
    } else if (employee.type === 'TEMPORARY') {
      // temporary salary logic
    }
    // Need to add more if statements for new types
  }
}
```

### ✅ Good Example
```typescript
// GOOD: Use strategy pattern
interface SalaryCalculator {
  calculate(employee: Employee): SalaryResult;
  supports(type: EmployeeType): boolean;
}

@Injectable()
export class MilitarySalaryCalculator implements SalaryCalculator {
  supports(type: EmployeeType) { return type === 'MILITARY'; }
  calculate(employee: Employee) { /* military logic */ }
}

@Injectable()
export class CivilianSalaryCalculator implements SalaryCalculator {
  supports(type: EmployeeType) { return type === 'CIVILIAN'; }
  calculate(employee: Employee) { /* civilian logic */ }
}

@Injectable()
export class SalaryService {
  constructor(
    @Inject('SALARY_CALCULATORS')
    private readonly calculators: SalaryCalculator[],
  ) {}

  calculateSalary(employee: Employee) {
    const calculator = this.calculators.find(c => c.supports(employee.type));
    return calculator.calculate(employee);
  }
}
```

---

## 1.3 Liskov Substitution Principle (LSP)

### Rule
Subtypes must be substitutable for their base types.

### ❌ Bad Example
```typescript
// BAD: Subclass changes behavior unexpectedly
class Employee {
  getLeaveBalance(): number { return this.leaveBalance; }
}

class TemporaryEmployee extends Employee {
  getLeaveBalance(): number {
    throw new Error('Temporary employees have no leave'); // Breaks LSP
  }
}
```

### ✅ Good Example
```typescript
// GOOD: Use composition and interfaces
interface LeaveEligible {
  getLeaveBalance(): number;
}

class PermanentEmployee implements LeaveEligible {
  getLeaveBalance(): number { return this.leaveBalance; }
}

class TemporaryEmployee {
  // Does not implement LeaveEligible - no getLeaveBalance method
}

// Or use discriminated unions
type Employee = MilitaryEmployee | CivilianEmployee | TemporaryEmployee;

function processLeave(employee: LeaveEligible) {
  // Only accepts employees that have leave
}
```

---

## 1.4 Interface Segregation Principle (ISP)

### Rule
Clients should not depend on interfaces they don't use.

### ❌ Bad Example
```typescript
// BAD: Fat interface
interface IEmployeeRepository {
  create(data: CreateEmployeeDto): Promise<Employee>;
  update(id: string, data: UpdateEmployeeDto): Promise<Employee>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Employee>;
  findAll(): Promise<Employee[]>;
  calculateSalary(id: string): Promise<number>;
  sendNotification(id: string): Promise<void>;
  generateReport(id: string): Promise<Report>;
}
```

### ✅ Good Example
```typescript
// GOOD: Segregated interfaces
interface IReadRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: FilterDto): Promise<T[]>;
}

interface IWriteRepository<T> {
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
}

interface IEmployeeRepository extends IReadRepository<Employee>, IWriteRepository<Employee> {
  findByEmployeeNumber(number: string): Promise<Employee | null>;
  findByDepartment(departmentId: string): Promise<Employee[]>;
}
```

---

## 1.5 Dependency Inversion Principle (DIP)

### Rule
Depend on abstractions, not concretions.

### ❌ Bad Example
```typescript
// BAD: Direct dependency on concrete class
@Injectable()
export class EmployeesService {
  private prisma = new PrismaClient(); // Direct instantiation

  async findAll() {
    return this.prisma.employee.findMany();
  }
}
```

### ✅ Good Example
```typescript
// GOOD: Depend on abstraction via DI
@Injectable()
export class EmployeesService {
  constructor(
    private readonly repository: EmployeesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(filter: EmployeeFilterDto) {
    return this.repository.findAll(filter);
  }
}

// Repository abstracts the data layer
@Injectable()
export class EmployeesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: EmployeeFilterDto) {
    return this.prisma.employee.findMany({
      where: this.buildWhere(filter),
    });
  }
}
```

---

# 2. Clean Code Principles

## 2.1 Naming Conventions

### Files
```
# Services
employees.service.ts          ✅
employeesService.ts           ❌
EmployeesService.ts           ❌

# Controllers
employees.controller.ts       ✅

# DTOs
create-employee.dto.ts        ✅
CreateEmployeeDto.ts          ❌

# Interfaces
employee.interface.ts         ✅
IEmployee.ts                  ❌
```

### Classes and Methods
```typescript
// Classes: PascalCase
class EmployeesService {}
class CreateEmployeeDto {}

// Methods: camelCase, verb + noun
async createEmployee() {}     ✅
async create() {}             ⚠️ (OK if context is clear)
async employeeCreate() {}     ❌

// Boolean methods: is/has/can/should prefix
isEligibleForPromotion()      ✅
checkEligibility()            ❌

// Variables: camelCase, descriptive
const employeeCount = 10;     ✅
const ec = 10;                ❌
const count = 10;             ⚠️ (context-dependent)
```

---

## 2.2 Function Rules

### Small Functions
```typescript
// ❌ BAD: Function doing too much
async processEmployee(dto: CreateEmployeeDto) {
  // Validate
  // Generate number
  // Create employee
  // Create salary record
  // Send notification
  // Log audit
  // Return response
  // ... 200 lines
}

// ✅ GOOD: Small, focused functions
async create(dto: CreateEmployeeDto): Promise<Employee> {
  await this.validateDto(dto);
  const employeeNumber = await this.generateEmployeeNumber(dto);
  const employee = await this.repository.create({ ...dto, employeeNumber });
  await this.postCreationTasks(employee);
  return employee;
}

private async validateDto(dto: CreateEmployeeDto): Promise<void> {
  await this.validateNationalId(dto.nationalId);
  await this.validateDepartment(dto.departmentId);
}

private async postCreationTasks(employee: Employee): Promise<void> {
  await this.salaryService.createInitialRecord(employee);
  await this.notificationService.sendWelcome(employee);
  this.eventEmitter.emit('employee.created', employee);
}
```

### Single Level of Abstraction
```typescript
// ❌ BAD: Mixed abstraction levels
async createEmployee(dto: CreateEmployeeDto) {
  const employee = await this.prisma.employee.create({
    data: {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email?.toLowerCase(),
      // ... low-level details
    },
  });
  await this.sendWelcomeEmail(employee); // high-level
  return employee;
}

// ✅ GOOD: Consistent abstraction level
async createEmployee(dto: CreateEmployeeDto) {
  const sanitizedDto = this.sanitizeInput(dto);
  const employee = await this.repository.create(sanitizedDto);
  await this.handlePostCreation(employee);
  return employee;
}
```

---

## 2.3 Error Handling

### Use Custom Exceptions
```typescript
// Define domain exceptions
export class EmployeeNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Employee with ID ${id} not found`);
  }
}

export class DuplicateNationalIdException extends ConflictException {
  constructor(nationalId: string) {
    super(`Employee with National ID ${nationalId} already exists`);
  }
}

export class InsufficientLeaveBalanceException extends BadRequestException {
  constructor(requested: number, available: number) {
    super(`Insufficient leave balance. Requested: ${requested}, Available: ${available}`);
  }
}

// Use in service
async findById(id: string): Promise<Employee> {
  const employee = await this.repository.findById(id);
  if (!employee) {
    throw new EmployeeNotFoundException(id);
  }
  return employee;
}
```

### Never Swallow Exceptions
```typescript
// ❌ BAD
try {
  await this.someOperation();
} catch (error) {
  console.log(error); // Swallowed!
}

// ✅ GOOD
try {
  await this.someOperation();
} catch (error) {
  this.logger.error('Operation failed', error.stack);
  throw error; // Re-throw or throw appropriate exception
}
```

---

## 2.4 Comments

### Self-Documenting Code
```typescript
// ❌ BAD: Comment explains what code does
// Check if employee is eligible for promotion
if (employee.yearsInRank >= 2 && employee.appraisalScore >= 75) {
  // ...
}

// ✅ GOOD: Code is self-explanatory
if (this.isEligibleForPromotion(employee)) {
  // ...
}

private isEligibleForPromotion(employee: Employee): boolean {
  const MIN_YEARS_IN_RANK = 2;
  const MIN_APPRAISAL_SCORE = 75;
  
  return employee.yearsInRank >= MIN_YEARS_IN_RANK 
      && employee.appraisalScore >= MIN_APPRAISAL_SCORE;
}
```

### When to Comment
```typescript
// ✅ GOOD: Explain WHY, not WHAT

// Ethiopian calendar months have 30 days each, except the 13th month (Pagume)
// which has 5 or 6 days depending on leap year
const daysInMonth = month === 13 ? (isLeapYear ? 6 : 5) : 30;

// Fayda API has a rate limit of 100 requests/minute
// Adding delay to prevent hitting the limit during bulk verification
await this.delay(600);

// TODO: Replace with proper caching when Redis is configured
const cachedResult = this.inMemoryCache.get(key);
```

---

# 3. NestJS Specific Patterns

## 3.1 Module Organization

### Feature Module Pattern
```typescript
// employees/employees.module.ts
@Module({
  imports: [
    DatabaseModule,
    DepartmentsModule,
    forwardRef(() => SalaryModule), // Handle circular deps
  ],
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    EmployeesRepository,
    EmployeeNumberService,
    EmployeeTransferService,
  ],
  exports: [EmployeesService], // Only export what's needed
})
export class EmployeesModule {}
```

### Layer Separation
```
Controller → Service → Repository → Prisma
     ↓           ↓           ↓
   DTOs      Entities    Database
```

---

## 3.2 DTOs and Validation

### Always Use DTOs
```typescript
// create-employee.dto.ts
export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstNameAm?: string;

  @IsNotEmpty()
  @IsEnum(EmployeeType)
  type: EmployeeType;

  @IsNotEmpty()
  @IsUUID()
  departmentId: string;

  @ValidateIf((o) => o.type === 'MILITARY')
  @IsNotEmpty()
  @IsUUID()
  rankId?: string;
}

// Response DTO
export class EmployeeResponseDto {
  id: string;
  employeeNumber: string;
  fullName: string;
  department: DepartmentResponseDto;
  
  constructor(employee: Employee) {
    this.id = employee.id;
    this.employeeNumber = employee.employeeNumber;
    this.fullName = `${employee.firstName} ${employee.lastName}`;
    this.department = new DepartmentResponseDto(employee.department);
  }
}
```

### Pagination DTO
```typescript
// common/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };

  constructor(data: T[], total: number, pagination: PaginationDto) {
    this.data = data;
    this.meta = {
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      hasNext: pagination.page < Math.ceil(total / pagination.limit),
      hasPrevious: pagination.page > 1,
    };
  }
}
```

---

## 3.3 Repository Pattern

```typescript
// employees.repository.ts
@Injectable()
export class EmployeesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EmployeeCreateInput): Promise<Employee> {
    return this.prisma.employee.create({
      data,
      include: this.defaultInclude,
    });
  }

  async findById(id: string, tenantId: string): Promise<Employee | null> {
    return this.prisma.employee.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: this.defaultInclude,
    });
  }

  async findAll(
    filter: EmployeeFilterDto,
    pagination: PaginationDto,
    tenantId: string,
  ): Promise<{ data: Employee[]; total: number }> {
    const where = this.buildWhere(filter, tenantId);
    
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: this.defaultInclude,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { data, total };
  }

  private buildWhere(filter: EmployeeFilterDto, tenantId: string): Prisma.EmployeeWhereInput {
    return {
      tenantId,
      deletedAt: null,
      ...(filter.type && { type: filter.type }),
      ...(filter.status && { status: filter.status }),
      ...(filter.departmentId && { departmentId: filter.departmentId }),
      ...(filter.search && {
        OR: [
          { firstName: { contains: filter.search, mode: 'insensitive' } },
          { lastName: { contains: filter.search, mode: 'insensitive' } },
          { employeeNumber: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
    };
  }

  private defaultInclude: Prisma.EmployeeInclude = {
    department: true,
    position: true,
    currentRank: true,
  };
}
```

---

## 3.4 Guards and Interceptors

### Tenant Guard
```typescript
// common/guards/tenant.guard.ts
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    // Attach tenant to request for easy access
    request.tenantId = user.tenantId;
    return true;
  }
}
```

### Audit Interceptor
```typescript
// common/interceptors/audit.interceptor.ts
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        const duration = Date.now() - startTime;
        
        await this.auditService.log({
          userId: user?.id,
          tenantId: user?.tenantId,
          action: this.getActionType(method),
          module: this.getModule(url),
          ipAddress: ip,
          userAgent: headers['user-agent'],
          requestBody: this.sanitize(body),
          responseStatus: 'SUCCESS',
          duration,
        });
      }),
      catchError(async (error) => {
        await this.auditService.log({
          userId: user?.id,
          action: this.getActionType(method),
          responseStatus: 'FAILURE',
          errorMessage: error.message,
        });
        throw error;
      }),
    );
  }

  private sanitize(body: any): any {
    const sensitiveFields = ['password', 'token', 'secret'];
    // Remove sensitive fields
  }
}
```

---

# 4. Database Patterns

## 4.1 Soft Delete

```typescript
// prisma.extension.ts
export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      async delete({ model, args, query }) {
        return prisma[model].update({
          ...args,
          data: { deletedAt: new Date() },
        });
      },
      async findMany({ model, args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});
```

## 4.2 Multi-Tenancy

```typescript
// ALWAYS include tenantId in queries
async findAll(tenantId: string): Promise<Employee[]> {
  return this.prisma.employee.findMany({
    where: { 
      tenantId,  // REQUIRED
      deletedAt: null,
    },
  });
}

// Use middleware to enforce tenant isolation
prisma.$use(async (params, next) => {
  if (params.action === 'findMany' || params.action === 'findFirst') {
    if (!params.args.where?.tenantId) {
      throw new Error('tenantId is required for all queries');
    }
  }
  return next(params);
});
```

## 4.3 Transactions

```typescript
// Use transactions for related operations
async createEmployeeWithSalary(dto: CreateEmployeeDto): Promise<Employee> {
  return this.prisma.$transaction(async (tx) => {
    const employee = await tx.employee.create({
      data: this.mapToCreateInput(dto),
    });

    await tx.salaryRecord.create({
      data: {
        employeeId: employee.id,
        baseSalary: dto.baseSalary,
        effectiveDate: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Employee',
        entityId: employee.id,
        newValues: employee,
      },
    });

    return employee;
  });
}
```

---

# 5. Testing Standards

## 5.1 Unit Tests

```typescript
// employees.service.spec.ts
describe('EmployeesService', () => {
  let service: EmployeesService;
  let repository: MockType<EmployeesRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: EmployeesRepository,
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get(EmployeesService);
    repository = module.get(EmployeesRepository);
  });

  describe('findById', () => {
    it('should return employee when found', async () => {
      const mockEmployee = createMockEmployee();
      repository.findById.mockResolvedValue(mockEmployee);

      const result = await service.findById('id', 'tenantId');

      expect(result).toEqual(mockEmployee);
      expect(repository.findById).toHaveBeenCalledWith('id', 'tenantId');
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('id', 'tenantId'))
        .rejects.toThrow(EmployeeNotFoundException);
    });
  });
});
```

## 5.2 Test Naming Convention

```typescript
describe('MethodName', () => {
  it('should [expected behavior] when [condition]', () => {});
  it('should throw [Exception] when [condition]', () => {});
});

// Examples:
it('should return paginated employees when valid filter provided', () => {});
it('should throw DuplicateNationalIdException when national ID exists', () => {});
it('should create audit log when employee is created', () => {});
```

---

# 6. Project Structure Rules

## 6.1 File Organization

```
src/modules/employees/
├── employees.module.ts           # Module definition
├── employees.controller.ts       # HTTP layer
├── employees.service.ts          # Business logic
├── employees.repository.ts       # Data access
├── dto/
│   ├── create-employee.dto.ts
│   ├── update-employee.dto.ts
│   ├── employee-filter.dto.ts
│   └── employee-response.dto.ts
├── entities/
│   └── employee.entity.ts        # If not using Prisma types
├── interfaces/
│   └── employee.interface.ts
├── services/                     # Additional services
│   ├── employee-number.service.ts
│   └── employee-transfer.service.ts
└── __tests__/
    ├── employees.service.spec.ts
    └── employees.controller.spec.ts
```

## 6.2 Import Order

```typescript
// 1. Node.js built-in modules
import { join } from 'path';

// 2. NestJS modules
import { Injectable, NotFoundException } from '@nestjs/common';

// 3. Third-party modules
import { Prisma } from '@prisma/client';

// 4. Internal modules (using path alias)
import { PrismaService } from '#api/database/prisma.service';
import { PaginationDto } from '#api/common/dto/pagination.dto';

// 5. Relative imports (same module)
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeesRepository } from './employees.repository';
```

---

# 7. Security Rules

## 7.1 Input Validation

```typescript
// ALWAYS validate input
@Post()
async create(
  @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  dto: CreateEmployeeDto,
) {
  return this.service.create(dto);
}
```

## 7.2 Sensitive Data

```typescript
// Never log sensitive data
this.logger.log(`Creating employee: ${dto.firstName}`); // ✅
this.logger.log(`Creating employee: ${JSON.stringify(dto)}`); // ❌ May contain sensitive data

// Exclude sensitive fields from responses
@Exclude()
passwordHash: string;

@Exclude()
nationalId: string; // Show masked version instead
```

## 7.3 SQL Injection Prevention

```typescript
// Always use parameterized queries (Prisma handles this)
// Never concatenate user input into queries

// ❌ BAD (if using raw SQL)
const result = await prisma.$queryRaw`
  SELECT * FROM employees WHERE name = '${userInput}'
`;

// ✅ GOOD
const result = await prisma.$queryRaw`
  SELECT * FROM employees WHERE name = ${userInput}
`;
```

---

# 8. Performance Rules

## 8.1 Database Queries

```typescript
// Use select to limit fields
const employees = await prisma.employee.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    // Only fields needed
  },
});

// Use pagination
const employees = await prisma.employee.findMany({
  skip: (page - 1) * limit,
  take: limit,
});

// Avoid N+1 queries
// ❌ BAD
const employees = await prisma.employee.findMany();
for (const emp of employees) {
  emp.department = await prisma.department.findUnique({ where: { id: emp.departmentId } });
}

// ✅ GOOD
const employees = await prisma.employee.findMany({
  include: { department: true },
});
```

## 8.2 Caching

```typescript
// Cache frequently accessed, rarely changed data
@Injectable()
export class DepartmentsService {
  constructor(
    private readonly cacheManager: Cache,
    private readonly repository: DepartmentsRepository,
  ) {}

  async findAll(tenantId: string): Promise<Department[]> {
    const cacheKey = `departments:${tenantId}`;
    
    let departments = await this.cacheManager.get<Department[]>(cacheKey);
    
    if (!departments) {
      departments = await this.repository.findAll(tenantId);
      await this.cacheManager.set(cacheKey, departments, 3600); // 1 hour
    }
    
    return departments;
  }
}
```

---

# Summary Checklist

## Before Every Commit

- [ ] All functions are small (< 20 lines ideally)
- [ ] All classes have single responsibility
- [ ] No hardcoded values (use constants/config)
- [ ] Input is validated
- [ ] Errors are handled properly
- [ ] Sensitive data is not logged
- [ ] TenantId is included in all queries
- [ ] Soft delete is used (not hard delete)
- [ ] DTOs are used for input/output
- [ ] Tests are written/updated
- [ ] No console.log (use Logger)
- [ ] Imports are organized

## Code Review Checklist

- [ ] SOLID principles followed
- [ ] No code duplication
- [ ] Clear naming
- [ ] Proper error handling
- [ ] Security considerations
- [ ] Performance considerations
- [ ] Tests included
