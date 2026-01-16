export type WeaponStatus = "IN_SERVICE" | "ASSIGNED" | "IN_MAINTENANCE" | "DECOMMISSIONED" | "LOST" | "STOLEN";
export type WeaponCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "UNSERVICEABLE";
export type AmmunitionTransactionType = "ISSUED" | "RETURNED" | "CONSUMED" | "TRANSFERRED" | "DAMAGED" | "EXPIRED";

export interface WeaponCategory {
	id: string;
	tenantId: string;
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface WeaponType {
	id: string;
	tenantId: string;
	categoryId: string;
	code: string;
	name: string;
	nameAm?: string;
	manufacturer?: string;
	model?: string;
	caliber?: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	category?: WeaponCategory;
	categoryName?: string;
	categoryNameAm?: string;
}

export interface Weapon {
	id: string;
	tenantId: string;
	weaponTypeId: string;
	centerId?: string;
	serialNumber: string;
	registrationNumber?: string;
	manufactureYear?: number;
	acquisitionDate?: string;
	acquisitionMethod?: string;
	purchasePrice?: number;
	status: WeaponStatus;
	condition: WeaponCondition;
	lastInspectionDate?: string;
	nextInspectionDate?: string;
	lastMaintenanceDate?: string;
	remarks?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	weaponType?: WeaponType;
	weaponTypeName?: string;
	weaponTypeNameAm?: string;
	categoryName?: string;
	categoryNameAm?: string;
	caliber?: string;
	centerName?: string;
	centerNameAm?: string;
	currentAssignment?: WeaponAssignment;
}

export interface WeaponAssignment {
	id: string;
	tenantId: string;
	weaponId: string;
	employeeId: string;
	assignedDate: string;
	assignedBy: string;
	expectedReturnDate?: string;
	conditionAtAssignment: WeaponCondition;
	issuedRounds?: number;
	isReturned: boolean;
	returnedDate?: string;
	returnedTo?: string;
	conditionAtReturn?: WeaponCondition;
	returnedRounds?: number;
	purpose?: string;
	remarks?: string;
	createdAt: string;
	updatedAt: string;
	weapon?: Weapon;
	weaponSerialNumber?: string;
	weaponTypeName?: string;
	weaponTypeNameAm?: string;
	employeeName?: string;
	employeeNameAm?: string;
	employeeCode?: string;
}

export interface AmmunitionType {
	id: string;
	tenantId: string;
	weaponTypeId?: string;
	code: string;
	name: string;
	nameAm?: string;
	caliber: string;
	manufacturer?: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	weaponType?: WeaponType;
}

export interface CenterAmmunitionStock {
	id: string;
	tenantId: string;
	centerId: string;
	ammunitionTypeId: string;
	totalQuantity: number;
	issuedQuantity: number;
	availableQuantity: number;
	minStockLevel?: number;
	remarks?: string;
	createdAt: string;
	updatedAt: string;
	centerName?: string;
	centerNameAm?: string;
	ammunitionTypeName?: string;
	ammunitionTypeNameAm?: string;
	caliber?: string;
}

export interface AmmunitionTransaction {
	id: string;
	tenantId: string;
	ammunitionTypeId: string;
	centerId: string;
	employeeId?: string;
	transactionType: AmmunitionTransactionType;
	quantity: number;
	transactionDate: string;
	processedBy: string;
	batchNumber?: string;
	expiryDate?: string;
	purpose?: string;
	remarks?: string;
	createdAt: string;
	ammunitionTypeName?: string;
	ammunitionTypeNameAm?: string;
	caliber?: string;
	centerName?: string;
	centerNameAm?: string;
	employeeName?: string;
	employeeNameAm?: string;
	employeeCode?: string;
}

export interface WeaponFilter {
	page?: number;
	limit?: number;
	search?: string;
	categoryId?: string;
	weaponTypeId?: string;
	centerId?: string;
	status?: WeaponStatus;
	condition?: WeaponCondition;
	isAssigned?: boolean;
}

export interface WeaponAssignmentFilter {
	page?: number;
	limit?: number;
	search?: string;
	employeeId?: string;
	weaponId?: string;
	isReturned?: boolean;
}

export interface AmmunitionFilter {
	page?: number;
	limit?: number;
	search?: string;
	centerId?: string;
	ammunitionTypeId?: string;
	transactionType?: AmmunitionTransactionType;
}

export interface CreateWeaponCategoryDto {
	code: string;
	name: string;
	nameAm?: string;
	description?: string;
}

export interface UpdateWeaponCategoryDto {
	name?: string;
	nameAm?: string;
	description?: string;
	isActive?: boolean;
}

export interface CreateWeaponTypeDto {
	categoryId: string;
	code: string;
	name: string;
	nameAm?: string;
	manufacturer?: string;
	model?: string;
	caliber?: string;
	description?: string;
}

export interface UpdateWeaponTypeDto {
	name?: string;
	nameAm?: string;
	manufacturer?: string;
	model?: string;
	caliber?: string;
	description?: string;
	isActive?: boolean;
}

export interface CreateWeaponDto {
	weaponTypeId: string;
	centerId?: string;
	serialNumber: string;
	registrationNumber?: string;
	manufactureYear?: number;
	acquisitionDate?: string;
	acquisitionMethod?: string;
	purchasePrice?: number;
	condition?: WeaponCondition;
	remarks?: string;
}

export interface UpdateWeaponDto {
	centerId?: string;
	registrationNumber?: string;
	manufactureYear?: number;
	acquisitionDate?: string;
	acquisitionMethod?: string;
	purchasePrice?: number;
	status?: WeaponStatus;
	condition?: WeaponCondition;
	lastInspectionDate?: string;
	nextInspectionDate?: string;
	lastMaintenanceDate?: string;
	remarks?: string;
	isActive?: boolean;
}

export interface CreateWeaponAssignmentDto {
	weaponId: string;
	employeeId: string;
	assignedDate: string;
	expectedReturnDate?: string;
	conditionAtAssignment: WeaponCondition;
	issuedRounds?: number;
	purpose?: string;
	remarks?: string;
}

export interface ReturnWeaponDto {
	returnedDate: string;
	conditionAtReturn: WeaponCondition;
	returnedRounds?: number;
	remarks?: string;
}

export interface CreateAmmunitionTypeDto {
	weaponTypeId?: string;
	code: string;
	name: string;
	nameAm?: string;
	caliber: string;
	manufacturer?: string;
	description?: string;
}

export interface UpdateAmmunitionTypeDto {
	name?: string;
	nameAm?: string;
	caliber?: string;
	manufacturer?: string;
	description?: string;
	isActive?: boolean;
}

export interface CreateAmmunitionTransactionDto {
	ammunitionTypeId: string;
	centerId: string;
	employeeId?: string;
	transactionType: AmmunitionTransactionType;
	quantity: number;
	transactionDate: string;
	batchNumber?: string;
	expiryDate?: string;
	purpose?: string;
	remarks?: string;
}

export interface AdjustStockDto {
	adjustment: number;
	reason: string;
}
