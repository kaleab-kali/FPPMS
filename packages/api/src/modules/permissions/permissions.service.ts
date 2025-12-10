import { Injectable } from "@nestjs/common";
import { PrismaService } from "#api/database/prisma.service";
import { PermissionResponseDto } from "#api/modules/permissions/dto/permission-response.dto";

@Injectable()
export class PermissionsService {
	constructor(private prisma: PrismaService) {}

	async findAll(): Promise<PermissionResponseDto[]> {
		const permissions = await this.prisma.permission.findMany({
			orderBy: [{ module: "asc" }, { resource: "asc" }, { action: "asc" }],
		});

		return permissions.map((p) => this.mapToResponse(p));
	}

	async findByModule(module: string): Promise<PermissionResponseDto[]> {
		const permissions = await this.prisma.permission.findMany({
			where: { module },
			orderBy: [{ resource: "asc" }, { action: "asc" }],
		});

		return permissions.map((p) => this.mapToResponse(p));
	}

	async getModules(): Promise<string[]> {
		const permissions = await this.prisma.permission.findMany({
			select: { module: true },
			distinct: ["module"],
			orderBy: { module: "asc" },
		});

		return permissions.map((p) => p.module);
	}

	private mapToResponse(permission: {
		id: string;
		module: string;
		action: string;
		resource: string;
		description: string | null;
	}): PermissionResponseDto {
		return {
			id: permission.id,
			module: permission.module,
			action: permission.action,
			resource: permission.resource,
			description: permission.description || undefined,
		};
	}
}
