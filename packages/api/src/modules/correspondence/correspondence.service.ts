import { Injectable, NotFoundException } from "@nestjs/common";
import { DocumentDirection, Prisma } from "@prisma/client";
import { PaginatedResult } from "#api/common/interfaces/paginated-result.interface";
import { calculateSkip, paginate } from "#api/common/utils/pagination.util";
import { PrismaService } from "#api/database/prisma.service";
import { CreateDocumentDto, DocumentFilterDto, DocumentResponseDto, UpdateDocumentDto } from "./dto";

@Injectable()
export class CorrespondenceService {
	constructor(private readonly prisma: PrismaService) {}

	async getDocumentTypes(tenantId: string, direction?: DocumentDirection) {
		return this.prisma.documentType.findMany({
			where: {
				tenantId,
				isActive: true,
				...(direction && { direction }),
			},
			orderBy: { name: "asc" },
		});
	}

	async findAll(tenantId: string, filter: DocumentFilterDto): Promise<PaginatedResult<DocumentResponseDto>> {
		const {
			page = 1,
			limit = 10,
			direction,
			documentTypeId,
			status,
			priority,
			category,
			centerId,
			concernedEmployeeId,
			assignedDepartmentId,
			isUrgent,
			startDate,
			endDate,
			isOverdue,
			isResponseOverdue,
			search,
		} = filter;

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const where: Prisma.DocumentWhereInput = {
			tenantId,
			...(direction && { direction }),
			...(documentTypeId && { documentTypeId }),
			...(status && { status }),
			...(priority && { priority }),
			...(category && { category }),
			...(centerId && { centerId }),
			...(concernedEmployeeId && { concernedEmployeeId }),
			...(assignedDepartmentId && { assignedDepartmentId }),
			...(typeof isUrgent === "boolean" && { isUrgent }),
			...(startDate &&
				endDate && {
					documentDate: {
						gte: new Date(startDate),
						lte: new Date(endDate),
					},
				}),
			...(search && {
				OR: [
					{ referenceNumber: { contains: search, mode: "insensitive" } },
					{ subject: { contains: search, mode: "insensitive" } },
					{ sourceOrganization: { contains: search, mode: "insensitive" } },
					{ destinationOrganization: { contains: search, mode: "insensitive" } },
				],
			}),
		};

		const [documents, total] = await Promise.all([
			this.prisma.document.findMany({
				where,
				include: {
					documentType: { select: { name: true } },
					concernedEmployee: { select: { fullName: true } },
					center: { select: { name: true } },
					attachments: {
						where: { deletedAt: null },
						select: {
							id: true,
							filePath: true,
							fileName: true,
							fileSize: true,
							mimeType: true,
							uploadedBy: true,
							uploadedAt: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip: calculateSkip(page, limit),
				take: limit,
			}),
			this.prisma.document.count({ where }),
		]);

		let data = documents.map((doc) => this.mapToResponse(doc, today));

		if (isOverdue) {
			data = data.filter((d) => d.isOverdue);
		}
		if (isResponseOverdue) {
			data = data.filter((d) => d.isResponseOverdue);
		}

		return paginate(data, total, page, limit);
	}

	async findByEmployee(
		tenantId: string,
		employeeId: string,
		filter: DocumentFilterDto,
	): Promise<PaginatedResult<DocumentResponseDto>> {
		return this.findAll(tenantId, { ...filter, concernedEmployeeId: employeeId });
	}

	async findOverdue(tenantId: string, filter: DocumentFilterDto): Promise<PaginatedResult<DocumentResponseDto>> {
		return this.findAll(tenantId, { ...filter, isOverdue: true });
	}

	async findOne(tenantId: string, id: string): Promise<DocumentResponseDto> {
		const document = await this.prisma.document.findFirst({
			where: { id, tenantId },
			include: {
				documentType: { select: { name: true } },
				concernedEmployee: { select: { fullName: true } },
				center: { select: { name: true } },
				attachments: {
					where: { deletedAt: null },
					select: {
						id: true,
						filePath: true,
						fileName: true,
						fileSize: true,
						mimeType: true,
						uploadedBy: true,
						uploadedAt: true,
					},
				},
			},
		});

		if (!document) {
			throw new NotFoundException("Document not found");
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return this.mapToResponse(document, today);
	}

	async create(tenantId: string, userId: string, dto: CreateDocumentDto): Promise<DocumentResponseDto> {
		const documentType = await this.prisma.documentType.findFirst({
			where: { id: dto.documentTypeId, tenantId },
		});

		if (!documentType) {
			throw new NotFoundException("Document type not found");
		}

		const referenceNumber = await this.generateReferenceNumber(tenantId, dto.direction);

		const document = await this.prisma.document.create({
			data: {
				tenantId,
				documentTypeId: dto.documentTypeId,
				referenceNumber,
				direction: dto.direction,
				documentDate: new Date(dto.documentDate),
				receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : undefined,
				sentDate: dto.sentDate ? new Date(dto.sentDate) : undefined,
				sourceOrganization: dto.sourceOrganization,
				destinationOrganization: dto.destinationOrganization,
				subject: dto.subject,
				summary: dto.summary,
				priority: dto.priority ?? "NORMAL",
				actionRequired: dto.actionRequired,
				deadline: dto.deadline ? new Date(dto.deadline) : undefined,
				assignedTo: dto.assignedTo,
				assignedDepartmentId: dto.assignedDepartmentId,
				filePath: dto.filePath,
				registeredBy: userId,
				folderNumber: dto.folderNumber,
				shelfNumber: dto.shelfNumber,
				officeLocation: dto.officeLocation,
				responseDeadline: dto.responseDeadline ? new Date(dto.responseDeadline) : undefined,
				isUrgent: dto.isUrgent ?? false,
				concernedEmployeeId: dto.concernedEmployeeId,
				centerId: dto.centerId,
				category: dto.category,
			},
			include: {
				documentType: { select: { name: true } },
				concernedEmployee: { select: { fullName: true } },
				center: { select: { name: true } },
				attachments: {
					where: { deletedAt: null },
					select: {
						id: true,
						filePath: true,
						fileName: true,
						fileSize: true,
						mimeType: true,
						uploadedBy: true,
						uploadedAt: true,
					},
				},
			},
		});

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return this.mapToResponse(document, today);
	}

	async update(tenantId: string, id: string, dto: UpdateDocumentDto): Promise<DocumentResponseDto> {
		const existing = await this.prisma.document.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Document not found");
		}

		const document = await this.prisma.document.update({
			where: { id },
			data: {
				subject: dto.subject,
				summary: dto.summary,
				priority: dto.priority,
				actionRequired: dto.actionRequired,
				deadline: dto.deadline ? new Date(dto.deadline) : undefined,
				assignedTo: dto.assignedTo,
				assignedDepartmentId: dto.assignedDepartmentId,
				status: dto.status,
				folderNumber: dto.folderNumber,
				shelfNumber: dto.shelfNumber,
				officeLocation: dto.officeLocation,
				responseDeadline: dto.responseDeadline ? new Date(dto.responseDeadline) : undefined,
				responseDate: dto.responseDate ? new Date(dto.responseDate) : undefined,
				isUrgent: dto.isUrgent,
				concernedEmployeeId: dto.concernedEmployeeId,
				centerId: dto.centerId,
				category: dto.category,
			},
			include: {
				documentType: { select: { name: true } },
				concernedEmployee: { select: { fullName: true } },
				center: { select: { name: true } },
				attachments: {
					where: { deletedAt: null },
					select: {
						id: true,
						filePath: true,
						fileName: true,
						fileSize: true,
						mimeType: true,
						uploadedBy: true,
						uploadedAt: true,
					},
				},
			},
		});

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return this.mapToResponse(document, today);
	}

	async markAsResponded(tenantId: string, id: string, responseDate?: string): Promise<DocumentResponseDto> {
		const existing = await this.prisma.document.findFirst({
			where: { id, tenantId },
		});

		if (!existing) {
			throw new NotFoundException("Document not found");
		}

		const document = await this.prisma.document.update({
			where: { id },
			data: {
				responseDate: responseDate ? new Date(responseDate) : new Date(),
				status: "RESPONDED",
			},
			include: {
				documentType: { select: { name: true } },
				concernedEmployee: { select: { fullName: true } },
				center: { select: { name: true } },
				attachments: {
					where: { deletedAt: null },
					select: {
						id: true,
						filePath: true,
						fileName: true,
						fileSize: true,
						mimeType: true,
						uploadedBy: true,
						uploadedAt: true,
					},
				},
			},
		});

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return this.mapToResponse(document, today);
	}

	private async generateReferenceNumber(tenantId: string, direction: DocumentDirection): Promise<string> {
		const year = new Date().getFullYear();
		const prefix = direction === DocumentDirection.INCOMING ? "IN" : "OUT";

		const lastDoc = await this.prisma.document.findFirst({
			where: {
				tenantId,
				direction,
				referenceNumber: { startsWith: `${prefix}-${year}-` },
			},
			orderBy: { referenceNumber: "desc" },
		});

		let nextNumber = 1;
		if (lastDoc) {
			const parts = lastDoc.referenceNumber.split("-");
			const lastNumber = Number.parseInt(parts[2] ?? "0", 10);
			nextNumber = lastNumber + 1;
		}

		return `${prefix}-${year}-${nextNumber.toString().padStart(5, "0")}`;
	}

	private mapToResponse(
		document: {
			id: string;
			tenantId: string;
			documentTypeId: string;
			referenceNumber: string;
			direction: DocumentDirection;
			documentDate: Date;
			receivedDate: Date | null;
			sentDate: Date | null;
			sourceOrganization: string | null;
			destinationOrganization: string | null;
			subject: string;
			summary: string | null;
			priority: string;
			actionRequired: string | null;
			deadline: Date | null;
			assignedTo: string | null;
			assignedDepartmentId: string | null;
			filePath: string | null;
			status: string;
			registeredBy: string;
			folderNumber: string | null;
			shelfNumber: string | null;
			officeLocation: string | null;
			responseDeadline: Date | null;
			responseDate: Date | null;
			isUrgent: boolean;
			concernedEmployeeId: string | null;
			centerId: string | null;
			category: string | null;
			createdAt: Date;
			updatedAt: Date;
			documentType?: { name: string };
			concernedEmployee?: { fullName: string } | null;
			center?: { name: string } | null;
			attachments?: Array<{
				id: string;
				filePath: string;
				fileName: string;
				fileSize: number;
				mimeType: string;
				uploadedBy: string;
				uploadedAt: Date;
			}>;
		},
		today: Date,
	): DocumentResponseDto {
		const isOverdue = document.deadline !== null && document.deadline < today && document.status !== "COMPLETED";
		const isResponseOverdue =
			document.responseDeadline !== null && document.responseDeadline < today && document.responseDate === null;

		return {
			id: document.id,
			tenantId: document.tenantId,
			documentTypeId: document.documentTypeId,
			documentTypeName: document.documentType?.name,
			referenceNumber: document.referenceNumber,
			direction: document.direction,
			documentDate: document.documentDate,
			receivedDate: document.receivedDate ?? undefined,
			sentDate: document.sentDate ?? undefined,
			sourceOrganization: document.sourceOrganization ?? undefined,
			destinationOrganization: document.destinationOrganization ?? undefined,
			subject: document.subject,
			summary: document.summary ?? undefined,
			priority: document.priority,
			actionRequired: document.actionRequired ?? undefined,
			deadline: document.deadline ?? undefined,
			assignedTo: document.assignedTo ?? undefined,
			assignedDepartmentId: document.assignedDepartmentId ?? undefined,
			filePath: document.filePath ?? undefined,
			status: document.status,
			registeredBy: document.registeredBy,
			folderNumber: document.folderNumber ?? undefined,
			shelfNumber: document.shelfNumber ?? undefined,
			officeLocation: document.officeLocation ?? undefined,
			responseDeadline: document.responseDeadline ?? undefined,
			responseDate: document.responseDate ?? undefined,
			isUrgent: document.isUrgent,
			concernedEmployeeId: document.concernedEmployeeId ?? undefined,
			concernedEmployeeName: document.concernedEmployee?.fullName,
			centerId: document.centerId ?? undefined,
			centerName: document.center?.name,
			category: document.category ?? undefined,
			isOverdue,
			isResponseOverdue,
			attachments: document.attachments,
			createdAt: document.createdAt,
			updatedAt: document.updatedAt,
		};
	}
}
