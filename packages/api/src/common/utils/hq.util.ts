import { ACCESS_SCOPES } from "#api/common/constants/roles.constant";

export const isHqPersonnel = (centerId: string | null | undefined): boolean => {
	return centerId === null || centerId === undefined;
};

export const isHqCenter = (centerId: string | null | undefined): boolean => {
	return centerId === null || centerId === undefined;
};

export const formatCenterDisplay = (centerId: string | null | undefined, centerName?: string): string => {
	if (isHqPersonnel(centerId)) {
		return "Headquarters";
	}
	return centerName ?? "Unknown Center";
};

export interface HqAwareCenterFilter {
	tenantId: string;
	userCenterId: string | null | undefined;
	accessScope: string;
}

export const buildHqAwareCenterFilter = (
	options: HqAwareCenterFilter,
): { tenantId: string; centerId?: string | null } => {
	const { tenantId, userCenterId, accessScope } = options;

	if (accessScope === ACCESS_SCOPES.ALL_CENTERS) {
		return { tenantId };
	}

	return {
		tenantId,
		centerId: userCenterId ?? null,
	};
};

export const canUserAccessResourceWithHq = (
	userCenterId: string | null | undefined,
	resourceCenterId: string | null | undefined,
	accessScope: string,
): boolean => {
	if (accessScope === ACCESS_SCOPES.ALL_CENTERS) {
		return true;
	}

	if (accessScope === ACCESS_SCOPES.OWN_CENTER) {
		const userIsHq = isHqPersonnel(userCenterId);
		const resourceIsHq = isHqCenter(resourceCenterId);

		if (userIsHq && resourceIsHq) {
			return true;
		}

		if (!userIsHq && !resourceIsHq) {
			return userCenterId === resourceCenterId;
		}

		return false;
	}

	return false;
};

export interface TransferCenterIds {
	fromCenterId: string | null | undefined;
	toCenterId: string | null | undefined;
}

export const validateTransferCenters = (transfer: TransferCenterIds): { isValid: boolean; error?: string } => {
	const { fromCenterId, toCenterId } = transfer;

	const fromIsHq = isHqCenter(fromCenterId);
	const toIsHq = isHqCenter(toCenterId);

	if (fromIsHq && toIsHq) {
		return { isValid: false, error: "Cannot transfer between HQ and HQ" };
	}

	if (fromCenterId === toCenterId && !fromIsHq) {
		return { isValid: false, error: "Source and target center cannot be the same" };
	}

	return { isValid: true };
};

export const getTransferDescription = (
	fromCenterId: string | null | undefined,
	toCenterId: string | null | undefined,
	fromCenterName?: string,
	toCenterName?: string,
): string => {
	const fromDisplay = formatCenterDisplay(fromCenterId, fromCenterName);
	const toDisplay = formatCenterDisplay(toCenterId, toCenterName);
	return `${fromDisplay} -> ${toDisplay}`;
};
