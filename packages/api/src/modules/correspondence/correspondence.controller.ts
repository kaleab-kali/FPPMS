import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentTenant } from "#api/common/decorators/current-tenant.decorator";
import { CurrentUser } from "#api/common/decorators/current-user.decorator";
import { PaginatedResponseDto } from "#api/common/dto/paginated-response.dto";
import { CorrespondenceService } from "./correspondence.service";
import { CreateDocumentDto, DocumentFilterDto, DocumentResponseDto, UpdateDocumentDto } from "./dto";

@ApiTags("correspondence")
@Controller("correspondence")
export class CorrespondenceController {
	constructor(private readonly correspondenceService: CorrespondenceService) {}

	@Get()
	@ApiOperation({ summary: "Get all documents with filtering and pagination" })
	@ApiResponse({
		status: 200,
		description: "List of documents returned successfully",
		type: PaginatedResponseDto,
	})
	async findAll(@CurrentTenant() tenantId: string, @Query() filter: DocumentFilterDto) {
		return this.correspondenceService.findAll(tenantId, filter);
	}

	@Get("incoming")
	@ApiOperation({ summary: "Get all incoming documents" })
	@ApiResponse({
		status: 200,
		description: "List of incoming documents returned successfully",
		type: PaginatedResponseDto,
	})
	async findIncoming(@CurrentTenant() tenantId: string, @Query() filter: DocumentFilterDto) {
		return this.correspondenceService.findAll(tenantId, { ...filter, direction: "INCOMING" as const });
	}

	@Get("outgoing")
	@ApiOperation({ summary: "Get all outgoing documents" })
	@ApiResponse({
		status: 200,
		description: "List of outgoing documents returned successfully",
		type: PaginatedResponseDto,
	})
	async findOutgoing(@CurrentTenant() tenantId: string, @Query() filter: DocumentFilterDto) {
		return this.correspondenceService.findAll(tenantId, { ...filter, direction: "OUTGOING" as const });
	}

	@Get("overdue")
	@ApiOperation({ summary: "Get all overdue documents" })
	@ApiResponse({
		status: 200,
		description: "List of overdue documents returned successfully",
		type: PaginatedResponseDto,
	})
	async findOverdue(@CurrentTenant() tenantId: string, @Query() filter: DocumentFilterDto) {
		return this.correspondenceService.findOverdue(tenantId, filter);
	}

	@Get("document-types")
	@ApiOperation({ summary: "Get all document types for correspondence" })
	@ApiResponse({
		status: 200,
		description: "List of document types returned successfully",
	})
	async getDocumentTypes(@CurrentTenant() tenantId: string, @Query("direction") direction?: string) {
		return this.correspondenceService.getDocumentTypes(tenantId, direction as "INCOMING" | "OUTGOING" | undefined);
	}

	@Get("employee/:employeeId")
	@ApiOperation({ summary: "Get documents concerning a specific employee" })
	@ApiResponse({
		status: 200,
		description: "List of employee documents returned successfully",
		type: PaginatedResponseDto,
	})
	async findByEmployee(
		@CurrentTenant() tenantId: string,
		@Param("employeeId") employeeId: string,
		@Query() filter: DocumentFilterDto,
	) {
		return this.correspondenceService.findByEmployee(tenantId, employeeId, filter);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a document by ID" })
	@ApiResponse({
		status: 200,
		description: "Document found",
		type: DocumentResponseDto,
	})
	@ApiResponse({ status: 404, description: "Document not found" })
	async findOne(@CurrentTenant() tenantId: string, @Param("id") id: string) {
		return this.correspondenceService.findOne(tenantId, id);
	}

	@Post()
	@ApiOperation({ summary: "Create a new document" })
	@ApiResponse({
		status: 201,
		description: "Document created successfully",
		type: DocumentResponseDto,
	})
	@ApiResponse({ status: 400, description: "Invalid input data" })
	@ApiResponse({ status: 404, description: "Document type not found" })
	async create(@CurrentTenant() tenantId: string, @CurrentUser("id") userId: string, @Body() dto: CreateDocumentDto) {
		return this.correspondenceService.create(tenantId, userId, dto);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a document" })
	@ApiResponse({
		status: 200,
		description: "Document updated successfully",
		type: DocumentResponseDto,
	})
	@ApiResponse({ status: 404, description: "Document not found" })
	async update(@CurrentTenant() tenantId: string, @Param("id") id: string, @Body() dto: UpdateDocumentDto) {
		return this.correspondenceService.update(tenantId, id, dto);
	}

	@Patch(":id/respond")
	@ApiOperation({ summary: "Mark a document as responded" })
	@ApiResponse({
		status: 200,
		description: "Document marked as responded",
		type: DocumentResponseDto,
	})
	@ApiResponse({ status: 404, description: "Document not found" })
	async markAsResponded(
		@CurrentTenant() tenantId: string,
		@Param("id") id: string,
		@Body("responseDate") responseDate?: string,
	) {
		return this.correspondenceService.markAsResponded(tenantId, id, responseDate);
	}
}
