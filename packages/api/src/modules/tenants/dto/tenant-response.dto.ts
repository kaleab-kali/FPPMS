export class TenantResponseDto {
	id: string;
	name: string;
	code: string;
	nameAm: string | undefined;
	type: string;
	isActive: boolean;
	settings: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}
