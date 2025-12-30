import { ForbiddenException } from "@nestjs/common";
import { ACCESS_SCOPES } from "#api/common/constants/roles.constant";

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
