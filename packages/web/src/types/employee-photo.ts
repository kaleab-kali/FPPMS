export interface EmployeePhoto {
	id: string;
	tenantId: string;
	employeeId: string;
	filePath: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	fileHash: string;
	captureMethod: string;
	capturedAt: string;
	capturedBy: string;
	isActive: boolean;
	activatedAt: string | null;
	employee?: {
		id: string;
		employeeId: string;
		fullName: string;
		fullNameAm: string | null;
	};
}

export interface CreateEmployeePhotoRequest {
	employeeId: string;
	captureMethod: string;
}

export const CAPTURE_METHODS = {
	WEBCAM: "WEBCAM",
	UPLOAD: "UPLOAD",
} as const;
