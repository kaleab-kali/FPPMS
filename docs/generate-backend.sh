#!/bin/bash

# EPPMS Backend Generator Script
# Creates NestJS folder structure with sample code in every file
# Usage: chmod +x generate-backend.sh && ./generate-backend.sh

set -e

PROJECT_ROOT="${1:-packages/api}"

echo "🚀 Generating EPPMS Backend Structure in $PROJECT_ROOT..."
echo "========================================"

# Create root directories
mkdir -p $PROJECT_ROOT/{src,prisma,uploads,test}
mkdir -p $PROJECT_ROOT/uploads/{photos,documents,temp}
mkdir -p $PROJECT_ROOT/src/{config,database,common,modules}
mkdir -p $PROJECT_ROOT/src/database/seeds
mkdir -p $PROJECT_ROOT/src/common/{decorators,guards,interceptors,filters,pipes,middleware,dto,interfaces,constants,utils}

# Create all module directories
MODULES="auth users roles tenants centers employees employee-addresses employee-photos employee-education employee-family employee-documents departments positions military-ranks lookups leave holidays appraisals disciplinary attendance inventory retirement rewards documents complaints audit reports dashboard file-storage"

for module in $MODULES; do
  mkdir -p $PROJECT_ROOT/src/modules/$module/dto
done

# Special modules with extra folders
mkdir -p $PROJECT_ROOT/src/modules/auth/strategies
mkdir -p $PROJECT_ROOT/src/modules/employees/services
mkdir -p $PROJECT_ROOT/src/modules/leave/{controllers,services,repositories}
mkdir -p $PROJECT_ROOT/src/modules/appraisals/{controllers,services}
mkdir -p $PROJECT_ROOT/src/modules/attendance/{controllers,services}
mkdir -p $PROJECT_ROOT/src/modules/inventory/{controllers,services}
mkdir -p $PROJECT_ROOT/src/modules/rewards/{controllers,services}
mkdir -p $PROJECT_ROOT/src/modules/lookups/{controllers,services}
mkdir -p $PROJECT_ROOT/src/modules/disciplinary/{controllers,services}
mkdir -p $PROJECT_ROOT/src/modules/reports/services
mkdir -p $PROJECT_ROOT/src/modules/dashboard/services
mkdir -p $PROJECT_ROOT/src/modules/file-storage/services
mkdir -p $PROJECT_ROOT/src/modules/retirement/services

echo "✅ Directories created"

# ============================================================================
# main.ts
# ============================================================================
cat > $PROJECT_ROOT/src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '#api/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.CORS_ORIGIN || '*', credentials: true });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('EPPMS API')
      .setDescription('Ethiopian Prison Police Management System')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 EPPMS API running on http://localhost:${process.env.PORT || 3000}`);
}
bootstrap();
EOF

# ============================================================================
# app.module.ts
# ============================================================================
cat > $PROJECT_ROOT/src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '#api/database/database.module';
import { AuthModule } from '#api/modules/auth/auth.module';
import { UsersModule } from '#api/modules/users/users.module';
import { EmployeesModule } from '#api/modules/employees/employees.module';
// Import other modules as needed

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    // Add other modules here
  ],
})
export class AppModule {}
EOF

# ============================================================================
# Database Module
# ============================================================================
cat > $PROJECT_ROOT/src/database/database.module.ts << 'EOF'
import { Global, Module } from '@nestjs/common';
import { PrismaService } from '#api/database/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
EOF

cat > $PROJECT_ROOT/src/database/prisma.service.ts << 'EOF'
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
EOF

# ============================================================================
# Common Files (Essential ones)
# ============================================================================

# Decorators
cat > $PROJECT_ROOT/src/common/decorators/current-user.decorator.ts << 'EOF'
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  tenantId: string;
  centerId?: string;
  username: string;
  roles: string[];
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  },
);
EOF

cat > $PROJECT_ROOT/src/common/decorators/current-tenant.decorator.ts << 'EOF'
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId || request.user?.tenantId;
  },
);
EOF

cat > $PROJECT_ROOT/src/common/decorators/roles.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
EOF

cat > $PROJECT_ROOT/src/common/decorators/public.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
EOF

# Guards
cat > $PROJECT_ROOT/src/common/guards/jwt-auth.guard.ts << 'EOF'
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '#api/common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) throw err || new UnauthorizedException();
    return user;
  }
}
EOF

cat > $PROJECT_ROOT/src/common/guards/roles.guard.ts << 'EOF'
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '#api/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;
    const { user } = context.switchToHttp().getRequest();
    if (!user?.roles?.some((r: string) => requiredRoles.includes(r))) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
EOF

# DTOs
cat > $PROJECT_ROOT/src/common/dto/pagination-query.dto.ts << 'EOF'
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 20;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc' = 'desc';
  @IsOptional() @IsString() search?: string;

  get skip(): number { return (this.page - 1) * this.limit; }
  get take(): number { return this.limit; }
}
EOF

# Utils
cat > $PROJECT_ROOT/src/common/utils/hash.util.ts << 'EOF'
import * as bcrypt from 'bcrypt';

export class HashUtil {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
EOF

# Index files
echo "export * from '#api/common/decorators/current-user.decorator';" > $PROJECT_ROOT/src/common/decorators/index.ts
echo "export * from '#api/common/decorators/current-tenant.decorator';" >> $PROJECT_ROOT/src/common/decorators/index.ts
echo "export * from '#api/common/decorators/roles.decorator';" >> $PROJECT_ROOT/src/common/decorators/index.ts
echo "export * from '#api/common/decorators/public.decorator';" >> $PROJECT_ROOT/src/common/decorators/index.ts

echo "export * from '#api/common/guards/jwt-auth.guard';" > $PROJECT_ROOT/src/common/guards/index.ts
echo "export * from '#api/common/guards/roles.guard';" >> $PROJECT_ROOT/src/common/guards/index.ts

echo "export * from '#api/common/dto/pagination-query.dto';" > $PROJECT_ROOT/src/common/dto/index.ts
echo "export * from '#api/common/utils/hash.util';" > $PROJECT_ROOT/src/common/utils/index.ts

# ============================================================================
# Auth Module (Complete)
# ============================================================================
cat > $PROJECT_ROOT/src/modules/auth/auth.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '#api/modules/auth/auth.controller';
import { AuthService } from '#api/modules/auth/auth.service';
import { JwtStrategy } from '#api/modules/auth/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '30m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
EOF

cat > $PROJECT_ROOT/src/modules/auth/auth.controller.ts << 'EOF'
import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '#api/modules/auth/auth.service';
import { LoginDto } from '#api/modules/auth/dto/login.dto';
import { Public } from '#api/common/decorators/public.decorator';
import { CurrentUser, CurrentUserData } from '#api/common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: CurrentUserData) {
    return this.authService.logout(user.id);
  }

  @Get('me')
  @ApiBearerAuth()
  me(@CurrentUser() user: CurrentUserData) {
    return this.authService.getCurrentUser(user.id);
  }
}
EOF

cat > $PROJECT_ROOT/src/modules/auth/auth.service.ts << 'EOF'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '#api/database/prisma.service';
import { HashUtil } from '#api/common/utils/hash.util';
import { LoginDto } from '#api/modules/auth/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { username: dto.username, deletedAt: null },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user || !(await HashUtil.comparePassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.userRoles.map((ur) => ur.role.code);
    const token = this.jwtService.sign({
      sub: user.id,
      tenantId: user.tenantId,
      centerId: user.centerId,
      username: user.username,
      roles,
    });

    return {
      accessToken: token,
      user: { id: user.id, username: user.username, tenantId: user.tenantId, roles },
    };
  }

  async logout(userId: string) {
    return { message: 'Logged out' };
  }

  async getCurrentUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, tenantId: true },
    });
  }
}
EOF

cat > $PROJECT_ROOT/src/modules/auth/strategies/jwt.strategy.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  validate(payload: any) {
    return {
      id: payload.sub,
      tenantId: payload.tenantId,
      centerId: payload.centerId,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
EOF

cat > $PROJECT_ROOT/src/modules/auth/dto/login.dto.ts << 'EOF'
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
EOF

echo "export * from '#api/modules/auth/dto/login.dto';" > $PROJECT_ROOT/src/modules/auth/dto/index.ts

# ============================================================================
# Create stub modules function
# ============================================================================
create_stub_module() {
  local name=$1
  local pascal=$(echo $name | sed -r 's/(^|-)(\w)/\U\2/g')
  local path=$PROJECT_ROOT/src/modules/$name

  cat > $path/$name.module.ts << MODEOF
import { Module } from '@nestjs/common';
import { ${pascal}Controller } from './${name}.controller';
import { ${pascal}Service } from './${name}.service';

@Module({
  controllers: [${pascal}Controller],
  providers: [${pascal}Service],
  exports: [${pascal}Service],
})
export class ${pascal}Module {}
MODEOF

  cat > $path/$name.controller.ts << CTRLEOF
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ${pascal}Service } from './${name}.service';

@ApiTags('${pascal}')
@ApiBearerAuth()
@Controller('${name}')
export class ${pascal}Controller {
  constructor(private service: ${pascal}Service) {}

  @Get()
  findAll(@Query() query: any) { return this.service.findAll(query); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: any) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Delete(':id')
  delete(@Param('id') id: string) { return this.service.delete(id); }
}
CTRLEOF

  cat > $path/$name.service.ts << SVCEOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '#api/database/prisma.service';

@Injectable()
export class ${pascal}Service {
  constructor(private prisma: PrismaService) {}

  findAll(query: any) { return { data: [], total: 0 }; }
  findOne(id: string) { return { id }; }
  create(dto: any) { return { id: 'new', ...dto }; }
  update(id: string, dto: any) { return { id, ...dto }; }
  delete(id: string) { return { deleted: true }; }
}
SVCEOF

  echo "// DTOs for $name module" > $path/dto/index.ts
}

# Create stub modules
for mod in users roles tenants centers departments positions military-ranks lookups leave holidays appraisals disciplinary attendance inventory retirement rewards documents complaints audit reports dashboard file-storage employee-addresses employee-photos employee-education employee-family employee-documents; do
  create_stub_module $mod
done

# ============================================================================
# Employees Module (More complete)
# ============================================================================
mkdir -p $PROJECT_ROOT/src/modules/employees/services

cat > $PROJECT_ROOT/src/modules/employees/employees.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
EOF

cat > $PROJECT_ROOT/src/modules/employees/employees.controller.ts << 'EOF'
import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CurrentTenant } from '#api/common/decorators/current-tenant.decorator';
import { CurrentUser, CurrentUserData } from '#api/common/decorators/current-user.decorator';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private service: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees' })
  findAll(@CurrentTenant() tenantId: string, @Query() query: any) {
    return this.service.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post('military')
  @ApiOperation({ summary: 'Register military employee (HQ only)' })
  createMilitary(@CurrentTenant() tenantId: string, @CurrentUser() user: CurrentUserData, @Body() dto: any) {
    return this.service.createMilitary(tenantId, user, dto);
  }

  @Post('civilian')
  @ApiOperation({ summary: 'Register civilian employee' })
  createCivilian(@CurrentTenant() tenantId: string, @CurrentUser() user: CurrentUserData, @Body() dto: any) {
    return this.service.createCivilian(tenantId, user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }
}
EOF

cat > $PROJECT_ROOT/src/modules/employees/employees.service.ts << 'EOF'
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '#api/database/prisma.service';
import { CurrentUserData } from '#api/common/decorators/current-user.decorator';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: any) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, deletedAt: null },
      take: query.limit || 20,
      skip: ((query.page || 1) - 1) * (query.limit || 20),
    });
    const total = await this.prisma.employee.count({ where: { tenantId, deletedAt: null } });
    return { data: employees, meta: { total, page: query.page || 1 } };
  }

  async findOne(tenantId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async createMilitary(tenantId: string, user: CurrentUserData, dto: any) {
    // Only HQ can register military
    if (!user.roles.includes('HQ_HR_MANAGER') && !user.roles.includes('IT_ADMIN')) {
      throw new ForbiddenException('Only HQ can register military employees');
    }
    // Generate employee ID and create
    const count = await this.prisma.employee.count({ where: { tenantId } });
    const employeeId = `FPC-${String(count + 1).padStart(6, '0')}`;
    return this.prisma.employee.create({
      data: { ...dto, tenantId, employeeId, employeeType: 'MILITARY', createdBy: user.id },
    });
  }

  async createCivilian(tenantId: string, user: CurrentUserData, dto: any) {
    const count = await this.prisma.employee.count({ where: { tenantId } });
    const employeeId = `FPC-${String(count + 1).padStart(6, '0')}`;
    return this.prisma.employee.create({
      data: { ...dto, tenantId, employeeId, employeeType: 'CIVILIAN', createdBy: user.id },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.findOne(tenantId, id);
    return this.prisma.employee.update({ where: { id }, data: dto });
  }
}
EOF

echo "// Employee DTOs" > $PROJECT_ROOT/src/modules/employees/dto/index.ts

# ============================================================================
# Prisma Schema (Basic)
# ============================================================================
cat > $PROJECT_ROOT/prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id        String   @id @default(cuid())
  code      String   @unique
  name      String
  nameAm    String?  @map("name_am")
  type      String   @default("CENTER")
  settings  Json     @default("{}")
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("tenants")
}

model User {
  id                  String    @id @default(cuid())
  tenantId            String    @map("tenant_id")
  centerId            String?   @map("center_id")
  employeeId          String?   @unique @map("employee_id")
  username            String
  email               String?
  passwordHash        String    @map("password_hash")
  status              String    @default("ACTIVE")
  failedLoginAttempts Int       @default(0)
  lockedUntil         DateTime?
  lastLoginAt         DateTime?
  mustChangePassword  Boolean   @default(true)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?
  userRoles           UserRole[]
  @@unique([tenantId, username])
  @@map("users")
}

model Role {
  id           String   @id @default(cuid())
  tenantId     String?  @map("tenant_id")
  code         String
  name         String
  nameAm       String?
  isSystemRole Boolean  @default(false)
  accessScope  String   @default("OWN_CENTER")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  userRoles    UserRole[]
  @@unique([tenantId, code])
  @@map("roles")
}

model UserRole {
  userId     String   @map("user_id")
  roleId     String   @map("role_id")
  assignedAt DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role       Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  @@id([userId, roleId])
  @@map("user_roles")
}

model Employee {
  id             String    @id @default(cuid())
  tenantId       String    @map("tenant_id")
  centerId       String?   @map("center_id")
  employeeId     String    @unique @map("employee_id")
  employeeType   String    @map("employee_type")
  firstName      String    @map("first_name")
  middleName     String    @map("middle_name")
  lastName       String    @map("last_name")
  fullName       String    @map("full_name")
  gender         String
  dateOfBirth    DateTime  @map("date_of_birth")
  primaryPhone   String    @map("primary_phone")
  email          String?
  status         String    @default("ACTIVE")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  createdBy      String?
  deletedAt      DateTime?
  @@map("employees")
  @@index([tenantId])
}
EOF

# Seed file
cat > $PROJECT_ROOT/prisma/seeds/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  const tenant = await prisma.tenant.upsert({
    where: { code: 'HQ' },
    update: {},
    create: { code: 'HQ', name: 'Federal Prison Commission HQ', nameAm: 'ዋና መስሪያ ቤት', type: 'HQ' },
  });

  const roles = [
    { code: 'IT_ADMIN', name: 'IT Administrator' },
    { code: 'HQ_HR_MANAGER', name: 'HQ HR Manager' },
    { code: 'HR_OFFICER', name: 'HR Officer' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: r.code } },
      update: {},
      create: { ...r, tenantId: tenant.id, isSystemRole: true },
    });
  }

  const hash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: 'admin' } },
    update: {},
    create: { tenantId: tenant.id, username: 'admin', email: 'admin@eppms.gov.et', passwordHash: hash, status: 'ACTIVE' },
  });

  const itRole = await prisma.role.findFirst({ where: { tenantId: tenant.id, code: 'IT_ADMIN' } });
  if (itRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: itRole.id } },
      update: {},
      create: { userId: admin.id, roleId: itRole.id },
    });
  }

  console.log('✅ Seeding complete! Admin: admin / Admin@123');
}

main().finally(() => prisma.$disconnect());
EOF

# .gitignore
cat > $PROJECT_ROOT/.gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
uploads/*
!uploads/.gitkeep
coverage/
*.log
EOF

touch $PROJECT_ROOT/uploads/.gitkeep

echo ""
echo "========================================"
echo "🎉 EPPMS Backend Generated Successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_ROOT"
echo "  npm install"
echo "  cp .env.example .env  # Edit with your DB credentials"
echo "  npx prisma generate"
echo "  npx prisma migrate dev --name init"
echo "  npm run prisma:seed"
echo "  npm run start:dev"
echo ""
echo "Default login: admin / Admin@123"
echo "API Docs: http://localhost:3000/api/docs"
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ImageProcessorService {
  async resize(buffer: Buffer, width: number, height: number): Promise<Buffer> {
    return sharp(buffer).resize(width, height, { fit: 'cover' }).toBuffer();
  }

  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return this.resize(buffer, 100, 100);
  }

  async generateMedium(buffer: Buffer): Promise<Buffer> {
    return this.resize(buffer, 400, 400);
  }

  async generateLarge(buffer: Buffer): Promise<Buffer> {
    return this.resize(buffer, 800, 800);
  }
}
EOF

echo "// File storage DTOs" > $PROJECT/src/modules/file-storage/dto/file-upload.dto.ts

echo "✅ File storage module created"

# =============================================================================
# PRISMA SCHEMA
# =============================================================================

cat > $PROJECT/prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// See DATABASE-ARCHITECTURE-UPDATED.md for complete schema
// This is a basic starter schema

model Tenant {
  id        String   @id @default(cuid())
  code      String   @unique
  name      String
  nameAm    String?  @map("name_am")
  type      String   @default("CENTER")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("tenants")
}

model User {
  id                  String    @id @default(cuid())
  tenantId            String    @map("tenant_id")
  centerId            String?   @map("center_id")
  username            String
  email               String?
  passwordHash        String    @map("password_hash")
  status              String    @default("ACTIVE")
  failedLoginAttempts Int       @default(0)
  lockedUntil         DateTime?
  lastLoginAt         DateTime?
  mustChangePassword  Boolean   @default(true)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  createdBy           String?
  deletedAt           DateTime?
  userRoles           UserRole[]
  @@unique([tenantId, username])
  @@map("users")
}

model Role {
  id           String     @id @default(cuid())
  tenantId     String?    @map("tenant_id")
  code         String
  name         String
  nameAm       String?
  isSystemRole Boolean    @default(false)
  accessScope  String     @default("OWN_CENTER")
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  userRoles    UserRole[]
  @@unique([tenantId, code])
  @@map("roles")
}

model UserRole {
  userId     String   @map("user_id")
  roleId     String   @map("role_id")
  assignedAt DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role       Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  @@id([userId, roleId])
  @@map("user_roles")
}

model Employee {
  id             String    @id @default(cuid())
  tenantId       String    @map("tenant_id")
  centerId       String?   @map("center_id")
  employeeId     String    @unique @map("employee_id")
  employeeType   String    @map("employee_type")
  firstName      String    @map("first_name")
  middleName     String    @map("middle_name")
  lastName       String    @map("last_name")
  fullName       String    @map("full_name")
  gender         String
  dateOfBirth    DateTime  @map("date_of_birth")
  primaryPhone   String    @map("primary_phone")
  email          String?
  status         String    @default("ACTIVE")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  createdBy      String?
  updatedBy      String?
  deletedAt      DateTime?
  @@index([tenantId])
  @@index([centerId])
  @@map("employees")
}

// Add more models from DATABASE-ARCHITECTURE-UPDATED.md
EOF

echo "✅ Prisma schema created"

# =============================================================================
# SEED FILE
# =============================================================================

cat > $PROJECT/prisma/seeds/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { code: 'HQ' },
    update: {},
    create: {
      code: 'HQ',
      name: 'Federal Prison Commission HQ',
      nameAm: 'የፌዴራል ማረሚያ ቤት ኮሚሽን',
      type: 'HQ',
    },
  });
  console.log('✓ Tenant created');

  // Create roles
  const roles = [
    { code: 'IT_ADMIN', name: 'IT Administrator', nameAm: 'የአይቲ አስተዳዳሪ' },
    { code: 'HQ_HR_MANAGER', name: 'HQ HR Manager', nameAm: 'የዋና መስሪያ ቤት HR' },
    { code: 'CENTER_HR_MANAGER', name: 'Center HR Manager', nameAm: 'የማዕከል HR' },
    { code: 'HR_OFFICER', name: 'HR Officer', nameAm: 'HR ኦፊሰር' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: role.code } },
      update: {},
      create: { ...role, tenantId: tenant.id, isSystemRole: true },
    });
  }
  console.log('✓ Roles created');

  // Create admin user
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: 'admin' } },
    update: {},
    create: {
      tenantId: tenant.id,
      username: 'admin',
      email: 'admin@eppms.gov.et',
      passwordHash,
      status: 'ACTIVE',
      mustChangePassword: true,
    },
  });

  // Assign IT_ADMIN role
  const itAdminRole = await prisma.role.findFirst({
    where: { tenantId: tenant.id, code: 'IT_ADMIN' },
  });

  if (itAdminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: itAdminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: itAdminRole.id },
    });
  }
  console.log('✓ Admin user created');

  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('Default credentials:');
  console.log('  Username: admin');
  console.log('  Password: Admin@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
EOF

echo "✅ Seed file created"

# =============================================================================
# TEST FILES
# =============================================================================

cat > $PROJECT/test/app.e2e-spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'Admin@123' })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
EOF

cat > $PROJECT/test/jest-e2e.json << 'EOF'
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
EOF

echo "✅ Test files created"

# =============================================================================
# DONE
# =============================================================================

echo ""
echo "=================================================="
echo "🎉 EPPMS Backend Structure Generated Successfully!"
echo "=================================================="
echo ""
echo "📁 Project location: $PROJECT"
echo ""
echo "📋 Next steps:"
echo "   cd $PROJECT"
echo "   npm install"
echo "   cp .env.example .env"
echo "   # Edit .env with your database credentials"
echo "   npx prisma generate"
echo "   npx prisma migrate dev --name init"
echo "   npm run prisma:seed"
echo "   npm run start:dev"
echo ""
echo "🔐 Default credentials:"
echo "   Username: admin"
echo "   Password: Admin@123"
echo ""
echo "📚 API Docs: http://localhost:3000/api/docs"
echo ""
