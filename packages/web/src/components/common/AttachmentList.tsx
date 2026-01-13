import { Download, FileText, Image, Loader2, Trash2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { attachmentsApi } from "#web/api/attachments/attachments.api.ts";
import { useDeleteAttachment } from "#web/api/attachments/attachments.mutations.ts";
import { useAttachments } from "#web/api/attachments/attachments.queries.ts";
import { AttachmentUploader } from "#web/components/common/AttachmentUploader.tsx";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#web/components/ui/alert-dialog.tsx";
import { Badge } from "#web/components/ui/badge.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Skeleton } from "#web/components/ui/skeleton.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table.tsx";
import type { AttachableType, Attachment } from "#web/types/attachment.ts";

interface AttachmentListProps {
	attachableType: AttachableType;
	attachableId: string;
	category?: string;
	showUploader?: boolean;
	allowDelete?: boolean;
}

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getFileIcon = (mimeType: string): React.ReactNode => {
	if (mimeType.startsWith("image/")) {
		return <Image className="h-5 w-5 text-blue-500" />;
	}
	return <FileText className="h-5 w-5 text-gray-500" />;
};

export const AttachmentList = React.memo(
	({ attachableType, attachableId, category, showUploader = true, allowDelete = true }: AttachmentListProps) => {
		const { t } = useTranslation("common");
		const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
		const [attachmentToDelete, setAttachmentToDelete] = React.useState<Attachment | null>(null);

		const { data, isLoading, error, refetch } = useAttachments(attachableType, attachableId, category);
		const deleteMutation = useDeleteAttachment();

		const handleDownload = React.useCallback((attachment: Attachment) => {
			const url = attachmentsApi.getFileUrl(attachment.id);
			const link = globalThis.document.createElement("a");
			link.href = url;
			link.download = attachment.fileName;
			globalThis.document.body.appendChild(link);
			link.click();
			globalThis.document.body.removeChild(link);
		}, []);

		const handleDeleteClick = React.useCallback((attachment: Attachment) => {
			setAttachmentToDelete(attachment);
			setDeleteDialogOpen(true);
		}, []);

		const handleDeleteConfirm = React.useCallback(() => {
			if (!attachmentToDelete) return;

			deleteMutation.mutate(
				{
					id: attachmentToDelete.id,
					type: attachableType,
					recordId: attachableId,
				},
				{
					onSuccess: () => {
						setDeleteDialogOpen(false);
						setAttachmentToDelete(null);
					},
				},
			);
		}, [attachmentToDelete, attachableType, attachableId, deleteMutation]);

		const handleUploadSuccess = React.useCallback(() => {
			refetch();
		}, [refetch]);

		const renderEmptyState = React.useCallback(
			(): React.ReactNode => (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<FileText className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-semibold mb-2">No attachments yet</h3>
					<p className="text-muted-foreground text-sm max-w-md">
						{showUploader
							? "Upload files to attach documents, images, or other files to this record."
							: "No attachments have been added to this record."}
					</p>
				</div>
			),
			[showUploader],
		);

		const renderLoadingSkeleton = React.useCallback(
			(): React.ReactNode => (
				<div className="space-y-3">
					<Skeleton className="h-16" />
					<Skeleton className="h-16" />
					<Skeleton className="h-16" />
				</div>
			),
			[],
		);

		const renderAttachmentsTable = React.useCallback(
			(attachments: Attachment[]): React.ReactNode => (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">Type</TableHead>
							<TableHead>Title</TableHead>
							<TableHead className="hidden md:table-cell">File Name</TableHead>
							<TableHead className="hidden sm:table-cell text-right">Size</TableHead>
							<TableHead className="hidden lg:table-cell">Uploaded</TableHead>
							{category === undefined && <TableHead className="hidden md:table-cell">Category</TableHead>}
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{attachments.map((attachment) => (
							<TableRow key={attachment.id}>
								<TableCell>{getFileIcon(attachment.mimeType)}</TableCell>
								<TableCell>
									<div>
										<p className="font-medium">{attachment.title}</p>
										{attachment.description && (
											<p className="text-sm text-muted-foreground line-clamp-1">{attachment.description}</p>
										)}
									</div>
								</TableCell>
								<TableCell className="hidden md:table-cell">
									<span className="text-sm text-muted-foreground truncate max-w-[200px] block">
										{attachment.fileName}
									</span>
								</TableCell>
								<TableCell className="hidden sm:table-cell text-right">
									<span className="text-sm">{formatFileSize(attachment.fileSize)}</span>
								</TableCell>
								<TableCell className="hidden lg:table-cell">
									<span className="text-sm text-muted-foreground">{formatDate(attachment.uploadedAt)}</span>
								</TableCell>
								{category === undefined && (
									<TableCell className="hidden md:table-cell">
										{attachment.category && <Badge variant="outline">{attachment.category}</Badge>}
									</TableCell>
								)}
								<TableCell className="text-right">
									<div className="flex items-center justify-end gap-2">
										<Button variant="ghost" size="sm" onClick={() => handleDownload(attachment)} title={t("download")}>
											<Download className="h-4 w-4" />
										</Button>
										{allowDelete && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDeleteClick(attachment)}
												disabled={deleteMutation.isPending}
												title={t("delete")}
											>
												{deleteMutation.isPending && attachmentToDelete?.id === attachment.id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Trash2 className="h-4 w-4 text-destructive" />
												)}
											</Button>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			),
			[allowDelete, category, deleteMutation.isPending, attachmentToDelete, handleDownload, handleDeleteClick, t],
		);

		return (
			<div className="space-y-6">
				{showUploader && (
					<Card>
						<CardHeader>
							<CardTitle>Upload Attachment</CardTitle>
							<CardDescription>Add files to this record for documentation and reference</CardDescription>
						</CardHeader>
						<CardContent>
							<AttachmentUploader
								attachableType={attachableType}
								attachableId={attachableId}
								category={category}
								onUploadSuccess={handleUploadSuccess}
							/>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Attachments</CardTitle>
								<CardDescription>
									{data?.total ? `${data.total} ${data.total === 1 ? "file" : "files"} attached` : "No attachments"}
								</CardDescription>
							</div>
							{data?.total ? (
								<Button variant="outline" size="sm" onClick={() => refetch()}>
									{t("refresh")}
								</Button>
							) : null}
						</div>
					</CardHeader>
					<CardContent>
						{isLoading && renderLoadingSkeleton()}

						{error && (
							<div className="text-center py-8">
								<p className="text-destructive mb-4">
									{error instanceof Error ? error.message : "Failed to load attachments"}
								</p>
								<Button variant="outline" onClick={() => refetch()}>
									Try Again
								</Button>
							</div>
						)}

						{!isLoading && !error && data?.data && data.data.length === 0 && renderEmptyState()}

						{!isLoading && !error && data?.data && data.data.length > 0 && (
							<div className="rounded-md border">{renderAttachmentsTable(data.data)}</div>
						)}
					</CardContent>
				</Card>

				<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Attachment</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete "{attachmentToDelete?.title}"? This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDeleteConfirm}
								disabled={deleteMutation.isPending}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								{deleteMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Deleting...
									</>
								) : (
									"Delete"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		);
	},
	(prev, next) =>
		prev.attachableType === next.attachableType &&
		prev.attachableId === next.attachableId &&
		prev.category === next.category &&
		prev.showUploader === next.showUploader &&
		prev.allowDelete === next.allowDelete,
);

AttachmentList.displayName = "AttachmentList";
