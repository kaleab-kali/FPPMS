import { registerAs } from "@nestjs/config";

export const fileStorageConfig = registerAs("fileStorage", () => ({
	rootPath: process.env.FILE_STORAGE_ROOT || "./uploads",
	photosPath: process.env.PHOTOS_PATH || "photos",
	documentsPath: process.env.DOCUMENTS_PATH || "documents",
	certificatesPath: process.env.CERTIFICATES_PATH || "certificates",
	tempPath: process.env.TEMP_PATH || "temp",
	maxPhotoSize: parseInt(process.env.MAX_PHOTO_SIZE || "10485760", 10),
	maxDocumentSize: parseInt(process.env.MAX_DOCUMENT_SIZE || "52428800", 10),
	allowedPhotoTypes: ["image/jpeg", "image/png", "image/webp"],
	allowedDocumentTypes: ["application/pdf", "image/jpeg", "image/png"],
	thumbnailSizes: {
		thumb: 100,
		medium: 400,
		large: 800,
	},
}));
