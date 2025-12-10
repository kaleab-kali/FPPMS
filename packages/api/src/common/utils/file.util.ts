import * as crypto from "node:crypto";
import * as path from "node:path";

export const generateFilePath = (tenantId: string, category: string, filename: string): string => {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return path.join(tenantId, category, String(year), month, filename);
};

export const generateUniqueFilename = (originalFilename: string): string => {
	const ext = path.extname(originalFilename);
	const timestamp = Date.now();
	const random = crypto.randomBytes(8).toString("hex");
	return `${timestamp}-${random}${ext}`;
};

export const getFileExtension = (filename: string): string => {
	return path.extname(filename).toLowerCase();
};

export const isAllowedFileType = (filename: string, allowedExtensions: string[]): boolean => {
	const ext = getFileExtension(filename);
	return allowedExtensions.includes(ext);
};

export const calculateFileHash = (buffer: Buffer): string => {
	return crypto.createHash("sha256").update(buffer).digest("hex");
};

export const formatFileSize = (bytes: number): string => {
	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const sanitizeFilename = (filename: string): string => {
	return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
};
