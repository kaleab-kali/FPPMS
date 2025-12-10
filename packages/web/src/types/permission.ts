export interface Permission {
	id: string;
	module: string;
	action: string;
	resource: string;
	description?: string;
}
