export interface InventoryAssignment {
	id: string;
	tenantId: string;
	employeeId: string;
	employeeName?: string;
	employeeCode?: string;
	itemTypeId: string;
	itemTypeName?: string;
	itemTypeNameAm?: string;
	categoryName?: string;
	centerId?: string;
	centerName?: string;
	serialNumber?: string;
	assetTag?: string;
	size?: string;
	quantity: number;
	isPermanent: boolean;
	expectedReturnDate?: string;
	assignedDate: string;
	assignedBy: string;
	conditionAtAssignment: string;
	isReturned: boolean;
	returnedDate?: string;
	returnedTo?: string;
	conditionAtReturn?: string;
	isLost: boolean;
	isDamaged: boolean;
	damageNotes?: string;
	costRecovery?: string;
	remarks?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CenterInventory {
	id: string;
	tenantId: string;
	centerId: string;
	centerName?: string;
	itemTypeId: string;
	itemTypeName?: string;
	itemTypeNameAm?: string;
	categoryName?: string;
	totalQuantity: number;
	assignedQuantity: number;
	availableQuantity: number;
	minStockLevel?: number;
	isBelowMinStock: boolean;
	remarks?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateInventoryAssignmentInput {
	employeeId: string;
	itemTypeId: string;
	centerId?: string;
	serialNumber?: string;
	assetTag?: string;
	size?: string;
	quantity: number;
	isPermanent: boolean;
	expectedReturnDate?: string;
	assignedDate: string;
	conditionAtAssignment: string;
	remarks?: string;
}

export interface UpdateInventoryAssignmentInput {
	serialNumber?: string;
	assetTag?: string;
	size?: string;
	isPermanent?: boolean;
	expectedReturnDate?: string;
	remarks?: string;
}

export interface ReturnInventoryInput {
	returnedDate?: string;
	conditionAtReturn?: string;
	isLost?: boolean;
	isDamaged?: boolean;
	damageNotes?: string;
	costRecovery?: string;
}

export interface CreateCenterInventoryInput {
	centerId: string;
	itemTypeId: string;
	totalQuantity: number;
	minStockLevel?: number;
	remarks?: string;
}

export interface UpdateCenterInventoryInput {
	totalQuantity?: number;
	minStockLevel?: number;
	remarks?: string;
}

export interface AdjustCenterInventoryInput {
	adjustment: number;
	reason?: string;
}

export interface InventoryAssignmentFilter {
	page?: number;
	limit?: number;
	employeeId?: string;
	centerId?: string;
	itemTypeId?: string;
	categoryId?: string;
	isReturned?: boolean;
	isPermanent?: boolean;
	isLost?: boolean;
	isDamaged?: boolean;
	search?: string;
}

export interface CenterInventoryFilter {
	page?: number;
	limit?: number;
	centerId?: string;
	itemTypeId?: string;
	categoryId?: string;
	lowStock?: boolean;
	search?: string;
}
