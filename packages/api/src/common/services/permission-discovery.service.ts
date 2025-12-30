import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "#api/common/decorators/permissions.decorator";
import { PrismaService } from "#api/database/prisma.service";

interface DiscoveredPermission {
	module: string;
	action: string;
	resource: string;
	description: string;
	controller: string;
	method: string;
}

@Injectable()
export class PermissionDiscoveryService implements OnModuleInit {
	private readonly logger = new Logger(PermissionDiscoveryService.name);

	constructor(
		private readonly discoveryService: DiscoveryService,
		private readonly metadataScanner: MetadataScanner,
		private readonly reflector: Reflector,
		private readonly prisma: PrismaService,
	) {}

	async onModuleInit() {
		await this.syncPermissions();
	}

	async syncPermissions(): Promise<void> {
		const discoveredPermissions = this.discoverPermissions();

		if (discoveredPermissions.length === 0) {
			this.logger.warn("No permissions discovered from controllers");
			return;
		}

		this.logger.log(`Discovered ${discoveredPermissions.length} permissions from controllers`);

		let created = 0;
		let existing = 0;

		for (const perm of discoveredPermissions) {
			const existingPerm = await this.prisma.permission.findFirst({
				where: {
					module: perm.module,
					action: perm.action,
					resource: perm.resource,
				},
			});

			if (existingPerm) {
				existing++;
				continue;
			}

			await this.prisma.permission.create({
				data: {
					module: perm.module,
					action: perm.action,
					resource: perm.resource,
					description: perm.description,
				},
			});
			created++;
		}

		this.logger.log(`Permissions sync complete: ${created} created, ${existing} already exist`);

		await this.assignAllPermissionsToItAdmin();
	}

	private discoverPermissions(): DiscoveredPermission[] {
		const permissions: DiscoveredPermission[] = [];
		const seenPermissions = new Set<string>();

		const controllers = this.discoveryService.getControllers();

		for (const wrapper of controllers) {
			const { instance } = wrapper;
			if (!instance) continue;

			const controllerName = wrapper.metatype?.name ?? "Unknown";
			const prototype = Object.getPrototypeOf(instance);

			const methodNames = this.metadataScanner.getAllMethodNames(prototype);

			for (const methodName of methodNames) {
				const methodPermissions = this.reflector.get<string[]>(PERMISSIONS_KEY, prototype[methodName]);

				if (!methodPermissions || methodPermissions.length === 0) continue;

				for (const permString of methodPermissions) {
					if (seenPermissions.has(permString)) continue;
					seenPermissions.add(permString);

					const parsed = this.parsePermissionString(permString);
					if (parsed) {
						permissions.push({
							...parsed,
							controller: controllerName,
							method: methodName,
						});
					}
				}
			}
		}

		return permissions;
	}

	private parsePermissionString(
		permString: string,
	): { module: string; action: string; resource: string; description: string } | null {
		const parts = permString.split(".");
		if (parts.length !== 3) {
			this.logger.warn(`Invalid permission format: ${permString}. Expected format: module.action.resource`);
			return null;
		}

		const [module, action, resource] = parts;
		const description = this.generateDescription(module, action, resource);

		return { module, action, resource, description };
	}

	private generateDescription(module: string, action: string, resource: string): string {
		const actionDescriptions: Record<string, string> = {
			create: "Create",
			read: "View",
			update: "Update",
			delete: "Delete",
			manage: "Manage",
			approve: "Approve",
			reject: "Reject",
			export: "Export",
			import: "Import",
		};

		const actionText = actionDescriptions[action] ?? action;
		const resourceText = resource.charAt(0).toUpperCase() + resource.slice(1);
		const moduleText = module.charAt(0).toUpperCase() + module.slice(1);

		return `${actionText} ${moduleText} ${resourceText}`;
	}

	private async assignAllPermissionsToItAdmin(): Promise<void> {
		const itAdminRole = await this.prisma.role.findFirst({ where: { code: "IT_ADMIN" } });
		if (!itAdminRole) {
			this.logger.warn("IT_ADMIN role not found, skipping auto-assignment");
			return;
		}

		const allPermissions = await this.prisma.permission.findMany();
		const existingAssignments = await this.prisma.rolePermission.findMany({
			where: { roleId: itAdminRole.id },
			select: { permissionId: true },
		});

		const existingPermissionIds = new Set(existingAssignments.map((a) => a.permissionId));
		const newPermissions = allPermissions.filter((p) => !existingPermissionIds.has(p.id));

		if (newPermissions.length === 0) return;

		await this.prisma.rolePermission.createMany({
			data: newPermissions.map((p) => ({
				roleId: itAdminRole.id,
				permissionId: p.id,
			})),
			skipDuplicates: true,
		});

		this.logger.log(`Assigned ${newPermissions.length} new permissions to IT_ADMIN role`);
	}
}
