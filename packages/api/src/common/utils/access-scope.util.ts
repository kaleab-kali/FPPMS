import { ForbiddenException } from "@nestjs/common";
import { ACCESS_SCOPES, ROLE_LEVELS } from "#api/common/constants/roles.constant";

const PERSONAL_FIELDS = new Set([
	"primaryPhone",
	"secondaryPhone",
	"email",
	"addressRegionId",
	"addressSubCityId",
	"addressWoredaId",
	"houseNumber",
	"uniqueAreaName",
	"emergencyContactName",
	"emergencyContactNameAm",
	"emergencyContactRelationship",
	"emergencyContactPhone",
	"emergencyContactAltPhone",
	"emergencyContactEmail",
	"emergencyRegionId",
	"emergencySubCityId",
	"emergencyWoredaId",
	"emergencyHouseNumber",
	"emergencyUniqueAreaName",
	"height",
	"weight",
	"distinguishingMarks",
	"motherFullName",
	"motherFullNameAm",
	"motherPhone",
	"motherIsAlive",
	"motherAddress",
]);

export const getMaxRoleLevel = (roles: string[]): number => {
	let max = 0;
	for (const role of roles) {
		const level = ROLE_LEVELS[role as keyof typeof ROLE_LEVELS] ?? 0;
		if (level > max) max = level;
	}
	return max;
};

export const isSelfEdit = (userEmployeeId: string | undefined, targetEmployeeId: string): boolean => {
	return !!userEmployeeId && userEmployeeId === targetEmployeeId;
};

export const validateSelfEditFields = (changedFields: string[]): void => {
	const sensitiveFields = changedFields.filter((f) => !PERSONAL_FIELDS.has(f));
	if (sensitiveFields.length > 0) {
		throw new ForbiddenException(
			`You cannot modify sensitive fields on your own record: ${sensitiveFields.join(", ")}`,
		);
	}
};

export const validateEditAuthorization = (
	userRoleLevel: number,
	targetRoleLevel: number,
	isSelf: boolean,
	changedFields?: string[],
): void => {
	if (isSelf) {
		if (changedFields) {
			validateSelfEditFields(changedFields);
		}
		return;
	}

	if (userRoleLevel < targetRoleLevel) {
		throw new ForbiddenException("Insufficient role level to edit this employee");
	}
};

export const validateDestructiveAction = (
	userEmployeeId: string | undefined,
	targetEmployeeId: string,
	userRoleLevel: number,
	targetRoleLevel: number,
): void => {
	if (isSelfEdit(userEmployeeId, targetEmployeeId)) {
		throw new ForbiddenException("You cannot perform this action on your own record");
	}

	if (userRoleLevel < targetRoleLevel) {
		throw new ForbiddenException("Insufficient role level to perform this action on this employee");
	}
};

export const canAccessAllCenters = (effectiveAccessScope: string): boolean => {
	return effectiveAccessScope === ACCESS_SCOPES.ALL_CENTERS;
};

export const canAccessCenter = (
	userCenterId: string | undefined,
	targetCenterId: string | undefined,
	effectiveAccessScope: string,
): boolean => {
	if (effectiveAccessScope === ACCESS_SCOPES.ALL_CENTERS) {
		return true;
	}
	if (effectiveAccessScope === ACCESS_SCOPES.OWN_CENTER) {
		return userCenterId === targetCenterId;
	}
	return false;
};

export const validateCenterAccess = (
	userCenterId: string | undefined,
	targetCenterId: string | undefined,
	effectiveAccessScope: string,
): void => {
	if (!canAccessCenter(userCenterId, targetCenterId, effectiveAccessScope)) {
		throw new ForbiddenException("You do not have access to this center's data");
	}
};

export interface CenterFilterOptions {
	tenantId: string;
	userCenterId: string | undefined;
	effectiveAccessScope: string;
}

export const buildCenterFilter = (options: CenterFilterOptions): { tenantId: string; centerId?: string } => {
	const { tenantId, userCenterId, effectiveAccessScope } = options;

	if (effectiveAccessScope === ACCESS_SCOPES.ALL_CENTERS) {
		return { tenantId };
	}

	return {
		tenantId,
		centerId: userCenterId,
	};
};

export const buildOptionalCenterFilter = (
	options: CenterFilterOptions,
): { tenantId: string; centerId?: string | null } => {
	const { tenantId, userCenterId, effectiveAccessScope } = options;

	if (effectiveAccessScope === ACCESS_SCOPES.ALL_CENTERS) {
		return { tenantId };
	}

	return {
		tenantId,
		centerId: userCenterId ?? null,
	};
};
