# Security Guide

> Security best practices for PPMS - OWASP Top 10 and API security

**CRITICAL:** All code must follow these security guidelines. AI assistants MUST check this document before implementing any feature that handles user input, authentication, authorization, or data access.

---

## OWASP Top 10 Web Application Security Risks (2021)

### 1. A01:2021 - Broken Access Control

**Risk:** Users acting outside their intended permissions.

**PPMS Implementation:**

```typescript
// ALWAYS use guards and decorators
@Roles("IT_ADMIN", "HR_DIRECTOR")
@Permissions("employees:write")
@Delete(":id")
async remove(
  @CurrentTenant() tenantId: string,  // ALWAYS include
  @CurrentUser() user: User,           // ALWAYS include
  @Param("id") id: string
) {
  // Verify ownership/access before action
  const entity = await this.service.findOne(tenantId, id);

  // Check if user has access to this specific record
  if (!this.canAccess(user, entity)) {
    throw new ForbiddenException("Access denied");
  }

  return this.service.remove(tenantId, id);
}
```

**Checklist:**
- [ ] ALWAYS include `tenantId` in every database query
- [ ] ALWAYS verify user has permission for the specific resource
- [ ] NEVER trust client-side authorization checks alone
- [ ] Use `@Roles()` and `@Permissions()` decorators on all protected endpoints
- [ ] Implement row-level security (user can only access their allowed data)
- [ ] Deny by default - require explicit permission grants

**NEVER DO:**
```typescript
// BAD: No tenant isolation
const employee = await this.prisma.employee.findUnique({
  where: { id }
});

// BAD: Trusting user-provided tenantId
const employee = await this.prisma.employee.findFirst({
  where: { id, tenantId: dto.tenantId }  // User could fake this!
});
```

**ALWAYS DO:**
```typescript
// GOOD: Get tenantId from authenticated JWT
const employee = await this.prisma.employee.findFirst({
  where: { id, tenantId }  // tenantId from @CurrentTenant()
});
```

---

### 2. A02:2021 - Cryptographic Failures

**Risk:** Exposure of sensitive data due to weak cryptography.

**PPMS Implementation:**

```typescript
// Password hashing - ALWAYS use bcrypt with sufficient rounds
import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 12;  // Minimum 10, recommended 12+

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

**Checklist:**
- [ ] NEVER store passwords in plain text
- [ ] NEVER log passwords or sensitive data
- [ ] Use bcrypt with 12+ salt rounds for passwords
- [ ] Use HTTPS in production (TLS 1.2+)
- [ ] Store JWT secrets in environment variables, never in code
- [ ] Use strong, random JWT secrets (minimum 256 bits)
- [ ] Encrypt sensitive data at rest if required

**Sensitive Data to Protect:**
- Passwords
- JWT tokens
- Personal identification numbers
- Medical records
- Financial information

---

### 3. A03:2021 - Injection

**Risk:** Untrusted data sent to an interpreter as part of a command or query.

**PPMS Implementation (Prisma handles SQL injection):**

```typescript
// GOOD: Prisma uses parameterized queries automatically
const employees = await this.prisma.employee.findMany({
  where: {
    tenantId,
    firstName: { contains: search, mode: "insensitive" },
  },
});

// GOOD: Even with raw queries, use parameters
const result = await this.prisma.$queryRaw`
  SELECT * FROM "Employee"
  WHERE "tenantId" = ${tenantId}
  AND "firstName" ILIKE ${`%${search}%`}
`;
```

**NEVER DO:**
```typescript
// BAD: String concatenation in queries
const result = await this.prisma.$queryRawUnsafe(
  `SELECT * FROM "Employee" WHERE name = '${userInput}'`
);

// BAD: eval() or dynamic code execution
eval(userInput);
new Function(userInput)();
```

**Other Injection Types to Prevent:**

```typescript
// Command Injection - NEVER use user input in shell commands
// BAD:
exec(`convert ${userFilename} output.png`);

// GOOD: Use libraries that don't invoke shell, validate input
const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "");
```

---

### 4. A04:2021 - Insecure Design

**Risk:** Missing or ineffective security controls in design.

**PPMS Security Controls:**

```typescript
// Rate limiting (implement in main.ts or use guard)
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

ThrottlerModule.forRoot({
  ttl: 60,      // Time window in seconds
  limit: 100,   // Max requests per window
});

// Separate rate limits for sensitive endpoints
@Throttle(5, 60)  // 5 requests per minute
@Post("login")
async login() { }

@Throttle(3, 3600)  // 3 requests per hour
@Post("reset-password")
async resetPassword() { }
```

**Checklist:**
- [ ] Implement rate limiting on all endpoints
- [ ] Stricter limits on authentication endpoints
- [ ] Implement account lockout after failed attempts
- [ ] Use CAPTCHA for public-facing forms
- [ ] Design with least privilege principle
- [ ] Implement proper session management

---

### 5. A05:2021 - Security Misconfiguration

**Risk:** Insecure default configurations, incomplete configurations.

**PPMS Configuration Checklist:**

```typescript
// main.ts - Security configuration
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with specific origins (not *)
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  }));

  // Disable X-Powered-By header
  app.getHttpAdapter().getInstance().disable("x-powered-by");

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Throw on unknown properties
    transform: true,
  }));
}
```

**Environment Variables (NEVER commit to git):**
```env
# .env (add to .gitignore)
DATABASE_URL=postgresql://...
JWT_SECRET=minimum-32-character-random-string
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

**Checklist:**
- [ ] Remove default credentials
- [ ] Disable debug mode in production
- [ ] Configure proper CORS settings
- [ ] Set security headers (Helmet)
- [ ] Disable directory listing
- [ ] Remove unnecessary features/endpoints
- [ ] Keep dependencies updated

---

### 6. A06:2021 - Vulnerable and Outdated Components

**Risk:** Using components with known vulnerabilities.

**PPMS Dependency Management:**

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Update packages (carefully, test after)
npm update
```

**Checklist:**
- [ ] Run `npm audit` regularly
- [ ] Keep dependencies updated
- [ ] Remove unused dependencies
- [ ] Use exact versions in package.json
- [ ] Review changelogs before major updates
- [ ] Test thoroughly after updates

---

### 7. A07:2021 - Identification and Authentication Failures

**Risk:** Weak authentication mechanisms.

**PPMS Authentication Implementation:**

```typescript
// Strong password requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

// Password validation
const validatePassword = (password: string): boolean => {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*]/.test(password)) return false;
  return true;
};

// Account lockout
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

// JWT configuration
const JWT_CONFIG = {
  accessTokenExpiry: "15m",    // Short-lived
  refreshTokenExpiry: "7d",     // Longer, but limited
  algorithm: "HS256",
};
```

**Checklist:**
- [ ] Enforce strong password policy
- [ ] Implement account lockout after failed attempts
- [ ] Use short-lived access tokens (15 minutes)
- [ ] Implement secure token refresh mechanism
- [ ] Force password change on first login
- [ ] Implement session timeout/inactivity logout
- [ ] Log all authentication events

---

### 8. A08:2021 - Software and Data Integrity Failures

**Risk:** Code and infrastructure not protected against integrity violations.

**PPMS Implementation:**

```typescript
// File upload validation
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const validateFile = (file: Express.Multer.File): boolean => {
  // Check MIME type (don't trust Content-Type header alone)
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new BadRequestException("Invalid file type");
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestException("File too large");
  }

  // Verify file signature (magic bytes)
  const fileSignature = file.buffer.slice(0, 4).toString("hex");
  const validSignatures = {
    "ffd8ffe0": "image/jpeg",
    "ffd8ffe1": "image/jpeg",
    "89504e47": "image/png",
    "52494646": "image/webp",
  };

  if (!validSignatures[fileSignature]) {
    throw new BadRequestException("Invalid file signature");
  }

  return true;
};
```

**Checklist:**
- [ ] Validate file uploads (type, size, content)
- [ ] Use SRI (Subresource Integrity) for external scripts
- [ ] Verify package integrity with lock files
- [ ] Sign and verify critical data transfers

---

### 9. A09:2021 - Security Logging and Monitoring Failures

**Risk:** Insufficient logging to detect attacks.

**PPMS Audit Logging:**

```typescript
// Log all security-relevant events
const AUDITED_ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "LOGIN_FAILED",
  "PASSWORD_CHANGE",
  "PERMISSION_CHANGE",
  "DATA_EXPORT",
  "ADMIN_ACTION",
  "SENSITIVE_DATA_ACCESS",
];

// Audit log entry
interface AuditLogEntry {
  timestamp: Date;
  action: AuditAction;
  userId: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  changes?: object;
  success: boolean;
  errorMessage?: string;
}

// NEVER log sensitive data
// BAD:
logger.log(`Login attempt: ${username} with password ${password}`);

// GOOD:
logger.log(`Login attempt: ${username} from IP ${ipAddress}`);
```

**Checklist:**
- [ ] Log all authentication events
- [ ] Log all authorization failures
- [ ] Log all data modifications
- [ ] Include timestamp, user, IP, action in logs
- [ ] NEVER log passwords or tokens
- [ ] Implement log rotation and retention
- [ ] Set up alerts for suspicious activity

---

### 10. A10:2021 - Server-Side Request Forgery (SSRF)

**Risk:** Server makes requests to unintended locations.

**PPMS Prevention:**

```typescript
// Validate URLs before fetching
const ALLOWED_DOMAINS = ["api.example.com", "cdn.example.com"];

const isAllowedUrl = (url: string): boolean => {
  const parsed = new URL(url);
  return ALLOWED_DOMAINS.includes(parsed.hostname);
};

// NEVER fetch user-provided URLs without validation
// BAD:
const response = await fetch(userProvidedUrl);

// GOOD:
if (!isAllowedUrl(userProvidedUrl)) {
  throw new BadRequestException("URL not allowed");
}
const response = await fetch(userProvidedUrl);
```

---

## API-Specific Security

### Input Validation

```typescript
// ALWAYS validate all input with class-validator
import { IsString, IsUUID, IsEmail, MinLength, MaxLength, Matches } from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9-]+$/, { message: "Invalid characters" })
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: "Password too weak",
  })
  password: string;

  @IsUUID()
  departmentId: string;
}
```

### Output Encoding

```typescript
// NEVER return sensitive fields
export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  // NEVER include: password, tokens, internal IDs

  // Use @Exclude() decorator for sensitive fields
  @Exclude()
  password: string;
}

// Use class-transformer to serialize
import { plainToInstance } from "class-transformer";
return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
```

### Error Handling

```typescript
// NEVER expose internal errors to clients
// BAD:
catch (error) {
  throw new InternalServerErrorException(error.message);
}

// GOOD:
catch (error) {
  this.logger.error("Database error", error.stack);
  throw new InternalServerErrorException("An error occurred");
}
```

---

## Frontend Security

### XSS Prevention

```typescript
// React automatically escapes by default - GOOD
<div>{userInput}</div>

// DANGER: dangerouslySetInnerHTML bypasses protection
// NEVER use with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // BAD!

// If HTML is needed, sanitize first
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

### Secure Storage

```typescript
// Store tokens securely
// Access tokens: Memory or short-lived localStorage
// Refresh tokens: httpOnly cookies (preferred) or localStorage

// NEVER store sensitive data in:
// - sessionStorage (accessible via XSS)
// - URL parameters (logged, shared, cached)
// - localStorage for long periods without expiry
```

### CSRF Protection

```typescript
// Use SameSite cookies
// Backend sets: Set-Cookie: token=xxx; SameSite=Strict; Secure; HttpOnly

// For API calls, include CSRF token in header
headers: {
  "X-CSRF-Token": csrfToken,
  "Authorization": `Bearer ${accessToken}`,
}
```

---

## Security Checklist for Every Feature

### Before Coding

- [ ] Review this security guide
- [ ] Identify sensitive data involved
- [ ] Plan authentication/authorization requirements
- [ ] Consider rate limiting needs

### During Coding

- [ ] Validate ALL input (whitelist, not blacklist)
- [ ] Use parameterized queries (Prisma does this)
- [ ] Include tenant isolation in every query
- [ ] Use proper guards and decorators
- [ ] Sanitize output / use DTOs
- [ ] Handle errors without exposing internals
- [ ] Add audit logging for sensitive operations

### After Coding

- [ ] Review for OWASP Top 10 vulnerabilities
- [ ] Test with invalid/malicious input
- [ ] Verify tenant isolation works
- [ ] Check that errors don't leak information
- [ ] Run `npm audit`

---

## Quick Reference: Security Patterns

### Secure Endpoint Pattern

```typescript
@ApiTags("entities")
@Controller("entities")
export class EntityController {
  @Post()
  @Roles("HR_OFFICER")                    // Role required
  @Permissions("entities:write")          // Permission required
  @Throttle(10, 60)                       // Rate limit: 10/minute
  @ApiOperation({ summary: "Create entity" })
  async create(
    @CurrentTenant() tenantId: string,    // Tenant from JWT
    @CurrentUser() user: User,            // User from JWT
    @Body() dto: CreateEntityDto,         // Validated DTO
  ) {
    // Log the action
    this.auditService.log({
      action: "CREATE",
      entityType: "Entity",
      userId: user.id,
      tenantId,
    });

    return this.service.create(tenantId, dto);
  }
}
```

### Secure Service Pattern

```typescript
@Injectable()
export class EntityService {
  async findOne(tenantId: string, id: string) {
    const entity = await this.prisma.entity.findFirst({
      where: {
        id,
        tenantId,  // ALWAYS include tenant
      },
    });

    if (!entity) {
      // Generic error - don't reveal if ID exists in other tenant
      throw new NotFoundException("Entity not found");
    }

    return entity;
  }
}
```

---

## Related Documentation

- [AI-MODULE-GUIDE.md](./AI-MODULE-GUIDE.md) - Module patterns
- [BUSINESS-RULES.md](../business/BUSINESS-RULES.md) - Access rules
- [API-REFERENCE.md](../reference/API-REFERENCE.md) - API endpoints

---

*Last Updated: 2025-01-18*
