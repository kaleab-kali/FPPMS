import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMedicalRecordDto {
	@IsString()
	@IsNotEmpty()
	employeeId: string;

	@IsString()
	@IsOptional()
	familyMemberId?: string;

	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	visitDate: Date;

	@IsString()
	@IsNotEmpty()
	institutionName: string;

	@IsString()
	@IsOptional()
	institutionNameAm?: string;

	@IsString()
	@IsOptional()
	institutionAddress?: string;

	@IsString()
	@IsOptional()
	institutionCity?: string;

	@IsString()
	@IsOptional()
	visitType?: string;

	@IsString()
	@IsOptional()
	diagnosis?: string;

	@IsString()
	@IsOptional()
	diagnosisAm?: string;

	@IsString()
	@IsOptional()
	treatment?: string;

	@IsString()
	@IsOptional()
	treatmentAm?: string;

	@IsString()
	@IsOptional()
	prescribedMedication?: string;

	@IsString()
	@IsOptional()
	doctorName?: string;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	amountCovered?: number;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	amountPaidByEmployee?: number;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	totalBillAmount?: number;

	@IsString()
	@IsOptional()
	insuranceClaimNumber?: string;

	@IsString()
	@IsOptional()
	insuranceProvider?: string;

	@Type(() => Date)
	@IsDate()
	@IsOptional()
	followUpDate?: Date;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class UpdateMedicalRecordDto {
	@Type(() => Date)
	@IsDate()
	@IsOptional()
	visitDate?: Date;

	@IsString()
	@IsOptional()
	institutionName?: string;

	@IsString()
	@IsOptional()
	institutionNameAm?: string;

	@IsString()
	@IsOptional()
	institutionAddress?: string;

	@IsString()
	@IsOptional()
	institutionCity?: string;

	@IsString()
	@IsOptional()
	visitType?: string;

	@IsString()
	@IsOptional()
	diagnosis?: string;

	@IsString()
	@IsOptional()
	diagnosisAm?: string;

	@IsString()
	@IsOptional()
	treatment?: string;

	@IsString()
	@IsOptional()
	treatmentAm?: string;

	@IsString()
	@IsOptional()
	prescribedMedication?: string;

	@IsString()
	@IsOptional()
	doctorName?: string;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	amountCovered?: number;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	amountPaidByEmployee?: number;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	totalBillAmount?: number;

	@IsString()
	@IsOptional()
	insuranceClaimNumber?: string;

	@IsString()
	@IsOptional()
	insuranceProvider?: string;

	@Type(() => Date)
	@IsDate()
	@IsOptional()
	followUpDate?: Date;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class MedicalRecordResponseDto {
	id: string;
	employeeId: string;
	familyMemberId: string | null;
	isForSelf: boolean;
	visitDate: Date;
	institutionName: string;
	institutionNameAm: string | null;
	institutionAddress: string | null;
	institutionCity: string | null;
	visitType: string | null;
	diagnosis: string | null;
	treatment: string | null;
	doctorName: string | null;
	amountCovered: number | null;
	amountPaidByEmployee: number | null;
	totalBillAmount: number | null;
	insuranceClaimNumber: string | null;
	insuranceProvider: string | null;
	followUpDate: Date | null;
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
	familyMember?: {
		id: string;
		fullName: string;
		fullNameAm: string | null;
		relationship: string;
	};
}

export class MedicalStatsResponseDto {
	totalFamilyMembers: number;
	eligibleMembers: number;
	totalRecords: number;
	selfRecords: number;
	familyRecords: number;
	totalAmountCovered: number;
}
