import { STORAGE_KEYS } from "#web/config/constants.ts";
import { api, apiClient } from "#web/lib/api-client.ts";
import type {
	AttachableType,
	Attachment,
	AttachmentDeleteResponse,
	AttachmentListResponse,
	UploadAttachmentRequest,
} from "#web/types/attachment.ts";

const BASE_URL = "/attachments";

export const attachmentsApi = {
	getAttachments: (type: AttachableType, recordId: string, category?: string) => {
		const params = category ? `?category=${encodeURIComponent(category)}` : "";
		return api.get<AttachmentListResponse>(`${BASE_URL}/${type}/${recordId}${params}`);
	},

	uploadAttachment: async (request: UploadAttachmentRequest) => {
		const formData = new FormData();
		formData.append("file", request.file);
		formData.append("attachableType", request.attachableType);
		formData.append("attachableId", request.attachableId);
		formData.append("title", request.title);
		if (request.category) {
			formData.append("category", request.category);
		}
		if (request.description) {
			formData.append("description", request.description);
		}

		return api.post<Attachment>(BASE_URL, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
	},

	deleteAttachment: (id: string) => api.delete<AttachmentDeleteResponse>(`${BASE_URL}/${id}`),

	getFileUrl: (id: string) => {
		const token = globalThis.localStorage.getItem(STORAGE_KEYS.accessToken);
		const baseUrl = apiClient.defaults.baseURL ?? "";
		return `${baseUrl}${BASE_URL}/file/${id}?token=${encodeURIComponent(token ?? "")}`;
	},
} as const;
