import { api } from "#web/lib/api-client";
import type { PaginatedResponse } from "#web/types/api";
import type {
	CorrespondenceDocument,
	CorrespondenceFilter,
	CreateCorrespondenceDto,
	DocumentDirection,
	UpdateCorrespondenceDto,
} from "#web/types/correspondence";

const BASE_URL = "/correspondence";

export interface DocumentType {
	id: string;
	name: string;
	nameAm?: string;
	code: string;
	direction: DocumentDirection;
}

export const correspondenceApi = {
	getDocumentTypes: (direction?: DocumentDirection): Promise<DocumentType[]> =>
		api.get(`${BASE_URL}/document-types`, {
			params: direction ? { direction } : undefined,
		}),

	getAll: (filter?: CorrespondenceFilter): Promise<PaginatedResponse<CorrespondenceDocument>> =>
		api.get(BASE_URL, { params: filter }),

	getIncoming: (filter?: CorrespondenceFilter): Promise<PaginatedResponse<CorrespondenceDocument>> =>
		api.get(`${BASE_URL}/incoming`, { params: filter }),

	getOutgoing: (filter?: CorrespondenceFilter): Promise<PaginatedResponse<CorrespondenceDocument>> =>
		api.get(`${BASE_URL}/outgoing`, { params: filter }),

	getOverdue: (filter?: CorrespondenceFilter): Promise<PaginatedResponse<CorrespondenceDocument>> =>
		api.get(`${BASE_URL}/overdue`, { params: filter }),

	getByEmployee: (
		employeeId: string,
		filter?: CorrespondenceFilter,
	): Promise<PaginatedResponse<CorrespondenceDocument>> =>
		api.get(`${BASE_URL}/employee/${employeeId}`, { params: filter }),

	getById: (id: string): Promise<CorrespondenceDocument> => api.get(`${BASE_URL}/${id}`),

	create: (dto: CreateCorrespondenceDto): Promise<CorrespondenceDocument> => api.post(BASE_URL, dto),

	update: (id: string, dto: UpdateCorrespondenceDto): Promise<CorrespondenceDocument> =>
		api.patch(`${BASE_URL}/${id}`, dto),

	markAsResponded: (id: string, responseDate?: string): Promise<CorrespondenceDocument> =>
		api.patch(`${BASE_URL}/${id}/respond`, { responseDate }),
};
