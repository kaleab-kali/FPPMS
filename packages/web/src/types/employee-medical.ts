export interface MedicalRecord {
	id: string;
	tenantId: string;
	employeeId: string;
	familyMemberId: string | null;
	isForSelf: boolean;
	visitDate: string;
	institutionName: string;
	institutionNameAm: string | null;
	institutionAddress: string | null;
	institutionCity: string | null;
	visitType: string | null;
	diagnosis: string | null;
	diagnosisAm: string | null;
	treatment: string | null;
	treatmentAm: string | null;
	prescribedMedication: string | null;
	doctorName: string | null;
	amountCovered: number | null;
	amountPaidByEmployee: number | null;
	totalBillAmount: number | null;
	insuranceClaimNumber: string | null;
	insuranceProvider: string | null;
	followUpDate: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	familyMember?: {
		id: string;
		fullName: string;
		fullNameAm: string | null;
		relationship: string;
	} | null;
}

export interface CreateMedicalRecordRequest {
	employeeId: string;
	familyMemberId?: string;
	visitDate: string;
	institutionName: string;
	institutionNameAm?: string;
	institutionAddress?: string;
	institutionCity?: string;
	visitType?: string;
	diagnosis?: string;
	diagnosisAm?: string;
	treatment?: string;
	treatmentAm?: string;
	prescribedMedication?: string;
	doctorName?: string;
	amountCovered?: number;
	amountPaidByEmployee?: number;
	totalBillAmount?: number;
	insuranceClaimNumber?: string;
	insuranceProvider?: string;
	followUpDate?: string;
	notes?: string;
}

export interface UpdateMedicalRecordRequest {
	visitDate?: string;
	institutionName?: string;
	institutionNameAm?: string;
	institutionAddress?: string;
	institutionCity?: string;
	visitType?: string;
	diagnosis?: string;
	diagnosisAm?: string;
	treatment?: string;
	treatmentAm?: string;
	prescribedMedication?: string;
	doctorName?: string;
	amountCovered?: number;
	amountPaidByEmployee?: number;
	totalBillAmount?: number;
	insuranceClaimNumber?: string;
	insuranceProvider?: string;
	followUpDate?: string;
	notes?: string;
}

export interface MedicalStats {
	totalFamilyMembers: number;
	eligibleMembers: number;
	totalRecords: number;
	selfRecords: number;
	familyRecords: number;
	totalAmountCovered: number;
}

export interface EligibleFamilyMember {
	id: string;
	fullName: string;
	fullNameAm: string | null;
	relationship: string;
	dateOfBirth: string | null;
}

export const VISIT_TYPES = {
	CHECKUP: "CHECKUP",
	EMERGENCY: "EMERGENCY",
	SURGERY: "SURGERY",
	CONSULTATION: "CONSULTATION",
	DENTAL: "DENTAL",
	VISION: "VISION",
	MATERNITY: "MATERNITY",
	OTHER: "OTHER",
} as const;
