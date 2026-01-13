import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attachmentsApi } from "#web/api/attachments/attachments.api.ts";
import { attachmentKeys } from "#web/api/attachments/attachments.queries.ts";
import type { UploadAttachmentRequest } from "#web/types/attachment.ts";

export const useUploadAttachment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: UploadAttachmentRequest) => attachmentsApi.uploadAttachment(request),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: attachmentKeys.list(data.attachableType, data.attachableId),
			});
		},
	});
};

export const useDeleteAttachment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string; type: string; recordId: string }) => attachmentsApi.deleteAttachment(id),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: attachmentKeys.list(variables.type as never, variables.recordId),
			});
		},
	});
};
