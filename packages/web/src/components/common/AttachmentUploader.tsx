import { Upload, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useUploadAttachment } from "#web/api/attachments/attachments.mutations.ts";
import { Button } from "#web/components/ui/button.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Textarea } from "#web/components/ui/textarea.tsx";
import { cn } from "#web/lib/utils.ts";
import type { AttachableType } from "#web/types/attachment.ts";

interface AttachmentUploaderProps {
	attachableType: AttachableType;
	attachableId: string;
	category?: string;
	onUploadSuccess?: () => void;
	className?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const FILE_SIZE_DISPLAY_LIMIT = 50;

const ALLOWED_FILE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/plain",
	"text/csv",
] as const;

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export const AttachmentUploader = React.memo(
	({ attachableType, attachableId, category, onUploadSuccess, className }: AttachmentUploaderProps) => {
		const { t } = useTranslation("common");
		const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
		const [title, setTitle] = React.useState("");
		const [description, setDescription] = React.useState("");
		const [isDragging, setIsDragging] = React.useState(false);
		const [validationError, setValidationError] = React.useState<string | null>(null);
		const fileInputRef = React.useRef<HTMLInputElement>(null);

		const uploadMutation = useUploadAttachment();

		const validateFile = React.useCallback((file: File): string | null => {
			if (file.size > MAX_FILE_SIZE) {
				return `File is too large. Maximum size is ${FILE_SIZE_DISPLAY_LIMIT}MB`;
			}

			if (!ALLOWED_FILE_TYPES.includes(file.type as never)) {
				return "File type not allowed. Please upload images, PDFs, or common document formats.";
			}

			return null;
		}, []);

		const handleFileSelect = React.useCallback(
			(file: File | null) => {
				if (!file) {
					setSelectedFile(null);
					setValidationError(null);
					return;
				}

				const error = validateFile(file);
				if (error) {
					setValidationError(error);
					setSelectedFile(null);
					return;
				}

				setSelectedFile(file);
				setValidationError(null);
				if (!title) {
					setTitle(file.name.replace(/\.[^/.]+$/, ""));
				}
			},
			[title, validateFile],
		);

		const handleFileInputChange = React.useCallback(
			(event: React.ChangeEvent<HTMLInputElement>) => {
				const file = event.target.files?.[0] ?? null;
				handleFileSelect(file);
			},
			[handleFileSelect],
		);

		const handleDragOver = React.useCallback((event: React.DragEvent) => {
			event.preventDefault();
			setIsDragging(true);
		}, []);

		const handleDragLeave = React.useCallback((event: React.DragEvent) => {
			event.preventDefault();
			setIsDragging(false);
		}, []);

		const handleDrop = React.useCallback(
			(event: React.DragEvent) => {
				event.preventDefault();
				setIsDragging(false);

				const file = event.dataTransfer.files[0];
				if (file) {
					handleFileSelect(file);
				}
			},
			[handleFileSelect],
		);

		const handleRemoveFile = React.useCallback(() => {
			setSelectedFile(null);
			setValidationError(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}, []);

		const handleUpload = React.useCallback(() => {
			if (!selectedFile || !title.trim()) return;

			uploadMutation.mutate(
				{
					attachableType,
					attachableId,
					title: title.trim(),
					category,
					description: description.trim() || undefined,
					file: selectedFile,
				},
				{
					onSuccess: () => {
						setSelectedFile(null);
						setTitle("");
						setDescription("");
						setValidationError(null);
						if (fileInputRef.current) {
							fileInputRef.current.value = "";
						}
						onUploadSuccess?.();
					},
				},
			);
		}, [selectedFile, title, attachableType, attachableId, category, description, uploadMutation, onUploadSuccess]);

		const isUploadDisabled = !selectedFile || !title.trim() || uploadMutation.isPending;

		return (
			<div className={cn("space-y-4", className)}>
				<div
					className={cn(
						"border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
						isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
						validationError ? "border-destructive" : "",
					)}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={() => fileInputRef.current?.click()}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							fileInputRef.current?.click();
						}
					}}
					role="button"
					tabIndex={0}
				>
					<input
						ref={fileInputRef}
						type="file"
						className="hidden"
						onChange={handleFileInputChange}
						accept={ALLOWED_FILE_TYPES.join(",")}
					/>

					<div className="flex flex-col items-center justify-center gap-2 text-center">
						<Upload className={cn("h-10 w-10", isDragging ? "text-primary" : "text-muted-foreground")} />
						<div>
							<p className="text-sm font-medium">
								{isDragging ? "Drop file here" : "Click to upload or drag and drop"}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								Images, PDFs, and documents (max {FILE_SIZE_DISPLAY_LIMIT}MB)
							</p>
						</div>
					</div>

					{selectedFile && (
						<div className="mt-4 flex items-center justify-between p-3 bg-muted rounded-md">
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{selectedFile.name}</p>
								<p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									handleRemoveFile();
								}}
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}

					{validationError && <p className="mt-2 text-sm text-destructive text-center">{validationError}</p>}
				</div>

				<div className="space-y-3">
					<div>
						<Label htmlFor="attachment-title">
							Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id="attachment-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter attachment title"
							maxLength={200}
							disabled={uploadMutation.isPending}
						/>
					</div>

					<div>
						<Label htmlFor="attachment-description">Description (optional)</Label>
						<Textarea
							id="attachment-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Enter attachment description"
							rows={3}
							maxLength={500}
							disabled={uploadMutation.isPending}
						/>
					</div>

					<Button type="button" onClick={handleUpload} disabled={isUploadDisabled} className="w-full" size="lg">
						<Upload className="mr-2 h-4 w-4" />
						{uploadMutation.isPending ? "Uploading..." : t("upload")}
					</Button>

					{uploadMutation.isError && (
						<p className="text-sm text-destructive text-center">
							{uploadMutation.error instanceof Error ? uploadMutation.error.message : "Failed to upload file"}
						</p>
					)}
				</div>
			</div>
		);
	},
	(prev, next) =>
		prev.attachableType === next.attachableType &&
		prev.attachableId === next.attachableId &&
		prev.category === next.category,
);

AttachmentUploader.displayName = "AttachmentUploader";
