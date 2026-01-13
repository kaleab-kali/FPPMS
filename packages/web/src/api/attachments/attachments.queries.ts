import { useQuery } from "@tanstack/react-query";
import { attachmentsApi } from "#web/api/attachments/attachments.api.ts";
import type { AttachableType } from "#web/types/attachment.ts";

export const attachmentKeys = {
	all: ["attachments"] as const,
	lists: () => [...attachmentKeys.all, "list"] as const,
	list: (type: AttachableType, recordId: string, category?: string) =>
		[...attachmentKeys.lists(), { type, recordId, category }] as const,
	details: () => [...attachmentKeys.all, "detail"] as const,
	detail: (id: string) => [...attachmentKeys.details(), id] as const,
} as const;

export const useAttachments = (type: AttachableType, recordId: string, category?: string) =>
	useQuery({
		queryKey: attachmentKeys.list(type, recordId, category),
		queryFn: () => attachmentsApi.getAttachments(type, recordId, category),
		enabled: !!type && !!recordId,
	});
