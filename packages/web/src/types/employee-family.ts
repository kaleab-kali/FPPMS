import type { Gender } from "#web/types/employee.ts";

export interface FamilyMember {
	id: string;
	tenantId: string;
	employeeId: string;
	relationship: string;
	fullName: string;
	fullNameAm: string | null;
	gender: Gender | null;
	dateOfBirth: string | null;
	nationalId: string | null;
	phone: string | null;
	occupation: string | null;
	marriageDate: string | null;
	schoolName: string | null;
	isAlive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateFamilyMemberRequest {
	employeeId: string;
	relationship: string;
	fullName: string;
	fullNameAm?: string;
	gender?: Gender;
	dateOfBirth?: string;
	nationalId?: string;
	phone?: string;
	occupation?: string;
	marriageDate?: string;
	schoolName?: string;
	isAlive?: boolean;
}

export interface UpdateFamilyMemberRequest {
	relationship?: string;
	fullName?: string;
	fullNameAm?: string;
	gender?: Gender;
	dateOfBirth?: string;
	nationalId?: string;
	phone?: string;
	occupation?: string;
	marriageDate?: string;
	schoolName?: string;
	isAlive?: boolean;
}

export const FAMILY_RELATIONSHIPS = {
	SPOUSE: "SPOUSE",
	CHILD: "CHILD",
	PARENT: "PARENT",
	SIBLING: "SIBLING",
} as const;
