import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { CommitteeFilterDto, CreateCommitteeDto, DissolveCommitteeDto, UpdateCommitteeDto } from "./dto/committee.dto";
import {
	AddCommitteeMemberDto,
	BulkAddMembersDto,
	RemoveCommitteeMemberDto,
	RenewMemberTermDto,
	TerminateMemberTermDto,
	UpdateCommitteeMemberDto,
} from "./dto/committee-member.dto";
import { CreateCommitteeTypeDto, UpdateCommitteeTypeDto } from "./dto/committee-type.dto";

@Injectable()
export class CommitteesService {
	constructor(private readonly prisma: PrismaService) {}

	// ==================== COMMITTEE TYPE METHODS ====================

	async createCommitteeType(tenantId: string, dto: CreateCommitteeTypeDto, _userId: string) {
		const existing = await this.prisma.committeeType.findUnique({
			where: { tenantId_code: { tenantId, code: dto.code } },
		});

		if (existing) {
			throw new BadRequestException(`Committee type with code ${dto.code} already exists`);
		}

		return this.prisma.committeeType.create({
			data: {
				tenantId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				descriptionAm: dto.descriptionAm,
				isPermanent: dto.isPermanent ?? false,
				requiresCenter: dto.requiresCenter ?? false,
				minMembers: dto.minMembers ?? 3,
				maxMembers: dto.maxMembers,
			},
		});
	}

	async findAllCommitteeTypes(tenantId: string, includeInactive = false) {
		const where: Prisma.CommitteeTypeWhereInput = { tenantId };
		if (!includeInactive) {
			where.isActive = true;
		}

		return this.prisma.committeeType.findMany({
			where,
			include: {
				_count: {
					select: { committees: true },
				},
			},
			orderBy: { name: "asc" },
		});
	}

	async findOneCommitteeType(tenantId: string, id: string) {
		const committeeType = await this.prisma.committeeType.findFirst({
			where: { id, tenantId },
			include: {
				_count: {
					select: { committees: true },
				},
			},
		});

		if (!committeeType) {
			throw new NotFoundException(`Committee type not found`);
		}

		return committeeType;
	}

	async updateCommitteeType(tenantId: string, id: string, dto: UpdateCommitteeTypeDto) {
		await this.findOneCommitteeType(tenantId, id);

		return this.prisma.committeeType.update({
			where: { id },
			data: dto,
		});
	}

	async deactivateCommitteeType(tenantId: string, id: string) {
		await this.findOneCommitteeType(tenantId, id);

		const activeCommittees = await this.prisma.committee.count({
			where: { committeeTypeId: id, status: "ACTIVE" },
		});

		if (activeCommittees > 0) {
			throw new BadRequestException(`Cannot deactivate committee type with ${activeCommittees} active committees`);
		}

		return this.prisma.committeeType.update({
			where: { id },
			data: { isActive: false },
		});
	}

	// ==================== COMMITTEE METHODS ====================

	async createCommittee(tenantId: string, dto: CreateCommitteeDto, userId: string) {
		await this.findOneCommitteeType(tenantId, dto.committeeTypeId);

		const existing = await this.prisma.committee.findUnique({
			where: { tenantId_code: { tenantId, code: dto.code } },
		});

		if (existing) {
			throw new BadRequestException(`Committee with code ${dto.code} already exists`);
		}

		if (dto.centerId) {
			const center = await this.prisma.center.findFirst({
				where: { id: dto.centerId, tenantId },
			});
			if (!center) {
				throw new BadRequestException(`Center not found`);
			}
		}

		const committee = await this.prisma.committee.create({
			data: {
				tenantId,
				committeeTypeId: dto.committeeTypeId,
				centerId: dto.centerId,
				code: dto.code,
				name: dto.name,
				nameAm: dto.nameAm,
				description: dto.description,
				descriptionAm: dto.descriptionAm,
				establishedDate: new Date(dto.establishedDate),
				establishedBy: userId,
			},
			include: {
				committeeType: {
					select: { id: true, code: true, name: true, nameAm: true, isPermanent: true },
				},
				center: {
					select: { id: true, code: true, name: true, nameAm: true },
				},
			},
		});

		await this.addHistoryEntry(tenantId, committee.id, "CREATED", null, committee, userId);

		return committee;
	}

	async findAllCommittees(tenantId: string, filter: CommitteeFilterDto) {
		const where: Prisma.CommitteeWhereInput = { tenantId };

		if (filter.committeeTypeId) {
			where.committeeTypeId = filter.committeeTypeId;
		}
		if (filter.centerId) {
			where.centerId = filter.centerId;
		}
		if (filter.status) {
			where.status = filter.status;
		}
		if (filter.search) {
			where.OR = [
				{ name: { contains: filter.search, mode: "insensitive" } },
				{ nameAm: { contains: filter.search, mode: "insensitive" } },
				{ code: { contains: filter.search, mode: "insensitive" } },
			];
		}

		return this.prisma.committee.findMany({
			where,
			include: {
				committeeType: {
					select: { id: true, code: true, name: true, nameAm: true, isPermanent: true },
				},
				center: {
					select: { id: true, code: true, name: true, nameAm: true },
				},
				_count: {
					select: { members: { where: { isActive: true } } },
				},
			},
			orderBy: { name: "asc" },
		});
	}

	async findOneCommittee(tenantId: string, id: string, includeMembers = false) {
		const committee = await this.prisma.committee.findFirst({
			where: { id, tenantId },
			include: {
				committeeType: {
					select: {
						id: true,
						code: true,
						name: true,
						nameAm: true,
						isPermanent: true,
						minMembers: true,
						maxMembers: true,
					},
				},
				center: {
					select: { id: true, code: true, name: true, nameAm: true },
				},
				members: includeMembers
					? {
							where: { isActive: true },
							include: {
								employee: {
									select: {
										id: true,
										employeeId: true,
										fullName: true,
										fullNameAm: true,
										position: {
											select: { id: true, name: true, nameAm: true },
										},
									},
								},
							},
							orderBy: [{ role: "asc" }, { appointedDate: "asc" }],
						}
					: false,
				_count: {
					select: { members: { where: { isActive: true } } },
				},
			},
		});

		if (!committee) {
			throw new NotFoundException(`Committee not found`);
		}

		return committee;
	}

	async updateCommittee(tenantId: string, id: string, dto: UpdateCommitteeDto, userId: string) {
		const committee = await this.findOneCommittee(tenantId, id);
		const previousValue = { name: committee.name, nameAm: committee.nameAm, description: committee.description };

		const updated = await this.prisma.committee.update({
			where: { id },
			data: dto,
			include: {
				committeeType: {
					select: { id: true, code: true, name: true, nameAm: true, isPermanent: true },
				},
				center: {
					select: { id: true, code: true, name: true, nameAm: true },
				},
			},
		});

		await this.addHistoryEntry(tenantId, id, "UPDATED", previousValue, dto, userId);

		return updated;
	}

	async suspendCommittee(tenantId: string, id: string, reason: string | undefined, userId: string) {
		const committee = await this.findOneCommittee(tenantId, id);

		if (committee.status !== "ACTIVE") {
			throw new BadRequestException(`Committee is not active`);
		}

		const updated = await this.prisma.committee.update({
			where: { id },
			data: { status: "SUSPENDED" },
		});

		await this.addHistoryEntry(
			tenantId,
			id,
			"SUSPENDED",
			{ status: committee.status },
			{ status: "SUSPENDED", reason },
			userId,
		);

		return updated;
	}

	async reactivateCommittee(tenantId: string, id: string, reason: string | undefined, userId: string) {
		const committee = await this.findOneCommittee(tenantId, id);

		if (committee.status !== "SUSPENDED") {
			throw new BadRequestException(`Committee is not suspended`);
		}

		const updated = await this.prisma.committee.update({
			where: { id },
			data: { status: "ACTIVE" },
		});

		await this.addHistoryEntry(
			tenantId,
			id,
			"REACTIVATED",
			{ status: committee.status },
			{ status: "ACTIVE", reason },
			userId,
		);

		return updated;
	}

	async dissolveCommittee(tenantId: string, id: string, dto: DissolveCommitteeDto, userId: string) {
		const committee = await this.findOneCommittee(tenantId, id, true);

		if (committee.status === "DISSOLVED") {
			throw new BadRequestException(`Committee is already dissolved`);
		}

		if (committee.committeeType.isPermanent) {
			throw new BadRequestException(`Permanent committees cannot be dissolved`);
		}

		await this.prisma.$transaction(async (tx) => {
			await tx.committeeMember.updateMany({
				where: { committeeId: id, isActive: true },
				data: {
					isActive: false,
					endDate: new Date(dto.dissolvedDate),
					removedBy: userId,
					removalReason: "Committee dissolved",
				},
			});

			await tx.committee.update({
				where: { id },
				data: {
					status: "DISSOLVED",
					isActive: false,
					dissolvedDate: new Date(dto.dissolvedDate),
					dissolvedReason: dto.dissolvedReason,
					dissolvedBy: userId,
				},
			});
		});

		await this.addHistoryEntry(
			tenantId,
			id,
			"DISSOLVED",
			{ status: committee.status },
			{ status: "DISSOLVED", dissolvedDate: dto.dissolvedDate, dissolvedReason: dto.dissolvedReason },
			userId,
		);

		return this.findOneCommittee(tenantId, id);
	}

	// ==================== COMMITTEE MEMBER METHODS ====================

	async addMember(tenantId: string, committeeId: string, dto: AddCommitteeMemberDto, userId: string) {
		const committee = await this.findOneCommittee(tenantId, committeeId, true);

		if (committee.status !== "ACTIVE") {
			throw new BadRequestException(`Cannot add members to a ${committee.status.toLowerCase()} committee`);
		}

		const employee = await this.prisma.employee.findFirst({
			where: { id: dto.employeeId, tenantId },
		});

		if (!employee) {
			throw new NotFoundException(`Employee not found`);
		}

		const existingMember = await this.prisma.committeeMember.findFirst({
			where: { committeeId, employeeId: dto.employeeId, isActive: true },
		});

		if (existingMember) {
			throw new BadRequestException(`Employee is already a member of this committee`);
		}

		if (dto.role === "CHAIRMAN") {
			const existingChairman = await this.prisma.committeeMember.findFirst({
				where: { committeeId, role: "CHAIRMAN", isActive: true },
			});
			if (existingChairman) {
				throw new BadRequestException(`Committee already has a chairman`);
			}
		}

		if (dto.role === "VICE_CHAIRMAN") {
			const existingViceChairman = await this.prisma.committeeMember.findFirst({
				where: { committeeId, role: "VICE_CHAIRMAN", isActive: true },
			});
			if (existingViceChairman) {
				throw new BadRequestException(`Committee already has a vice chairman`);
			}
		}

		if (dto.role === "SECRETARY") {
			const existingSecretary = await this.prisma.committeeMember.findFirst({
				where: { committeeId, role: "SECRETARY", isActive: true },
			});
			if (existingSecretary) {
				throw new BadRequestException(`Committee already has a secretary`);
			}
		}

		const currentMemberCount = committee._count.members;
		if (committee.committeeType.maxMembers && currentMemberCount >= committee.committeeType.maxMembers) {
			throw new BadRequestException(`Committee has reached maximum member capacity`);
		}

		const termLimitMonths = dto.termLimitMonths ?? 24;
		const startDate = new Date(dto.appointedDate);
		const endDate = new Date(startDate);
		endDate.setMonth(endDate.getMonth() + termLimitMonths);

		const result = await this.prisma.$transaction(async (tx) => {
			const member = await tx.committeeMember.create({
				data: {
					tenantId,
					committeeId,
					employeeId: dto.employeeId,
					role: dto.role,
					appointedDate: startDate,
					endDate: endDate,
					appointedBy: userId,
				},
			});

			const term = await tx.committeeMemberTerm.create({
				data: {
					tenantId,
					centerId: committee.centerId,
					committeeId,
					memberId: member.id,
					employeeId: dto.employeeId,
					termNumber: 1,
					termLimitMonths,
					startDate,
					endDate,
					status: "ACTIVE",
				},
			});

			await tx.committeeMember.update({
				where: { id: member.id },
				data: { currentTermId: term.id },
			});

			return tx.committeeMember.findUnique({
				where: { id: member.id },
				include: {
					employee: {
						select: {
							id: true,
							employeeId: true,
							fullName: true,
							fullNameAm: true,
							position: {
								select: { id: true, name: true, nameAm: true },
							},
						},
					},
					terms: {
						orderBy: { termNumber: "desc" },
						take: 1,
					},
				},
			});
		});

		await this.addHistoryEntry(
			tenantId,
			committeeId,
			"MEMBER_ADDED",
			null,
			{ employeeId: dto.employeeId, role: dto.role, appointedDate: dto.appointedDate, termLimitMonths, termEndDate: endDate.toISOString() },
			userId,
		);

		return result;
	}

	async bulkAddMembers(tenantId: string, committeeId: string, dto: BulkAddMembersDto, userId: string) {
		const results = [];
		for (const employeeId of dto.employeeIds) {
			const memberDto: AddCommitteeMemberDto = {
				employeeId,
				role: dto.role,
				appointedDate: dto.appointedDate,
				termLimitMonths: dto.termLimitMonths,
			};
			const member = await this.addMember(tenantId, committeeId, memberDto, userId);
			results.push(member);
		}
		return results;
	}

	async updateMember(
		tenantId: string,
		committeeId: string,
		memberId: string,
		dto: UpdateCommitteeMemberDto,
		userId: string,
	) {
		const member = await this.prisma.committeeMember.findFirst({
			where: { id: memberId, committeeId, tenantId, isActive: true },
		});

		if (!member) {
			throw new NotFoundException(`Committee member not found`);
		}

		if (dto.role && dto.role !== member.role) {
			if (dto.role === "CHAIRMAN") {
				const existingChairman = await this.prisma.committeeMember.findFirst({
					where: { committeeId, role: "CHAIRMAN", isActive: true, id: { not: memberId } },
				});
				if (existingChairman) {
					throw new BadRequestException(`Committee already has a chairman`);
				}
			}
			if (dto.role === "VICE_CHAIRMAN") {
				const existingViceChairman = await this.prisma.committeeMember.findFirst({
					where: { committeeId, role: "VICE_CHAIRMAN", isActive: true, id: { not: memberId } },
				});
				if (existingViceChairman) {
					throw new BadRequestException(`Committee already has a vice chairman`);
				}
			}
			if (dto.role === "SECRETARY") {
				const existingSecretary = await this.prisma.committeeMember.findFirst({
					where: { committeeId, role: "SECRETARY", isActive: true, id: { not: memberId } },
				});
				if (existingSecretary) {
					throw new BadRequestException(`Committee already has a secretary`);
				}
			}
		}

		const previousRole = member.role;
		const updated = await this.prisma.committeeMember.update({
			where: { id: memberId },
			data: dto,
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						fullNameAm: true,
						position: {
							select: { id: true, name: true, nameAm: true },
						},
					},
				},
			},
		});

		if (dto.role && dto.role !== previousRole) {
			await this.addHistoryEntry(
				tenantId,
				committeeId,
				"MEMBER_ROLE_CHANGED",
				{ memberId, previousRole },
				{ memberId, newRole: dto.role },
				userId,
			);
		}

		return updated;
	}

	async removeMember(
		tenantId: string,
		committeeId: string,
		memberId: string,
		dto: RemoveCommitteeMemberDto,
		userId: string,
	) {
		const member = await this.prisma.committeeMember.findFirst({
			where: { id: memberId, committeeId, tenantId, isActive: true },
			include: {
				employee: {
					select: { id: true, employeeId: true, fullName: true },
				},
			},
		});

		if (!member) {
			throw new NotFoundException(`Committee member not found`);
		}

		const updated = await this.prisma.committeeMember.update({
			where: { id: memberId },
			data: {
				isActive: false,
				endDate: new Date(dto.endDate),
				removedBy: userId,
				removalReason: dto.removalReason,
			},
		});

		await this.addHistoryEntry(
			tenantId,
			committeeId,
			"MEMBER_REMOVED",
			{ employeeId: member.employeeId, role: member.role },
			{ endDate: dto.endDate, removalReason: dto.removalReason },
			userId,
		);

		return updated;
	}

	async getCommitteeMembers(tenantId: string, committeeId: string, includeInactive = false) {
		await this.findOneCommittee(tenantId, committeeId);

		const where: Prisma.CommitteeMemberWhereInput = { tenantId, committeeId };
		if (!includeInactive) {
			where.isActive = true;
		}

		return this.prisma.committeeMember.findMany({
			where,
			include: {
				employee: {
					select: {
						id: true,
						employeeId: true,
						fullName: true,
						fullNameAm: true,
						position: {
							select: { id: true, name: true, nameAm: true },
						},
					},
				},
			},
			orderBy: [{ role: "asc" }, { appointedDate: "asc" }],
		});
	}

	async getEmployeeCommittees(tenantId: string, employeeId: string, includeInactive = false) {
		const where: Prisma.CommitteeMemberWhereInput = { tenantId, employeeId };
		if (!includeInactive) {
			where.isActive = true;
		}

		return this.prisma.committeeMember.findMany({
			where,
			include: {
				committee: {
					include: {
						committeeType: {
							select: { id: true, code: true, name: true, nameAm: true },
						},
						center: {
							select: { id: true, code: true, name: true, nameAm: true },
						},
					},
				},
				terms: {
					orderBy: { termNumber: "desc" },
				},
			},
			orderBy: { appointedDate: "desc" },
		});
	}

	// ==================== TERM MANAGEMENT METHODS ====================

	async renewMemberTerm(
		tenantId: string,
		committeeId: string,
		memberId: string,
		dto: RenewMemberTermDto,
		userId: string,
	) {
		const member = await this.prisma.committeeMember.findFirst({
			where: { id: memberId, committeeId, tenantId, isActive: true },
			include: {
				committee: true,
				terms: {
					where: { status: "ACTIVE" },
					orderBy: { termNumber: "desc" },
					take: 1,
				},
			},
		});

		if (!member) {
			throw new NotFoundException(`Committee member not found`);
		}

		const currentTerm = member.terms[0];
		if (!currentTerm) {
			throw new BadRequestException(`No active term found for this member`);
		}

		const termLimitMonths = dto.termLimitMonths ?? currentTerm.termLimitMonths;
		const newStartDate = new Date(dto.newTermStartDate);
		const newEndDate = new Date(newStartDate);
		newEndDate.setMonth(newEndDate.getMonth() + termLimitMonths);

		const result = await this.prisma.$transaction(async (tx) => {
			await tx.committeeMemberTerm.update({
				where: { id: currentTerm.id },
				data: {
					status: "RENEWED",
					renewedBy: userId,
					renewedDate: new Date(),
					notes: dto.notes,
				},
			});

			const newTerm = await tx.committeeMemberTerm.create({
				data: {
					tenantId,
					centerId: member.committee.centerId,
					committeeId,
					memberId,
					employeeId: member.employeeId,
					termNumber: currentTerm.termNumber + 1,
					termLimitMonths,
					startDate: newStartDate,
					endDate: newEndDate,
					status: "ACTIVE",
					renewedFromTermId: currentTerm.id,
				},
			});

			await tx.committeeMember.update({
				where: { id: memberId },
				data: {
					currentTermId: newTerm.id,
					endDate: newEndDate,
				},
			});

			return tx.committeeMember.findUnique({
				where: { id: memberId },
				include: {
					employee: {
						select: {
							id: true,
							employeeId: true,
							fullName: true,
							fullNameAm: true,
						},
					},
					terms: {
						orderBy: { termNumber: "desc" },
					},
				},
			});
		});

		await this.addHistoryEntry(
			tenantId,
			committeeId,
			"MEMBER_TERM_RENEWED",
			{ termNumber: currentTerm.termNumber, endDate: currentTerm.endDate },
			{ newTermNumber: currentTerm.termNumber + 1, newEndDate: newEndDate.toISOString(), termLimitMonths },
			userId,
			dto.notes,
		);

		return result;
	}

	async terminateMemberTerm(
		tenantId: string,
		committeeId: string,
		memberId: string,
		dto: TerminateMemberTermDto,
		userId: string,
	) {
		const member = await this.prisma.committeeMember.findFirst({
			where: { id: memberId, committeeId, tenantId, isActive: true },
			include: {
				terms: {
					where: { status: "ACTIVE" },
					orderBy: { termNumber: "desc" },
					take: 1,
				},
			},
		});

		if (!member) {
			throw new NotFoundException(`Committee member not found`);
		}

		const currentTerm = member.terms[0];
		if (!currentTerm) {
			throw new BadRequestException(`No active term found for this member`);
		}

		const terminatedDate = new Date(dto.terminatedDate);

		const result = await this.prisma.$transaction(async (tx) => {
			await tx.committeeMemberTerm.update({
				where: { id: currentTerm.id },
				data: {
					status: "TERMINATED",
					terminatedDate,
					terminatedReason: dto.terminatedReason,
					terminatedBy: userId,
				},
			});

			await tx.committeeMember.update({
				where: { id: memberId },
				data: {
					isActive: false,
					endDate: terminatedDate,
					removedBy: userId,
					removalReason: dto.terminatedReason,
				},
			});

			return tx.committeeMember.findUnique({
				where: { id: memberId },
				include: {
					employee: {
						select: {
							id: true,
							employeeId: true,
							fullName: true,
							fullNameAm: true,
						},
					},
					terms: {
						orderBy: { termNumber: "desc" },
					},
				},
			});
		});

		await this.addHistoryEntry(
			tenantId,
			committeeId,
			"MEMBER_TERM_TERMINATED",
			{ termNumber: currentTerm.termNumber, originalEndDate: currentTerm.endDate },
			{ terminatedDate: dto.terminatedDate, terminatedReason: dto.terminatedReason },
			userId,
		);

		return result;
	}

	async getExpiringTerms(tenantId: string, daysUntilExpiry = 30, centerId?: string) {
		const expiryDate = new Date();
		expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

		const where: Prisma.CommitteeMemberTermWhereInput = {
			tenantId,
			status: "ACTIVE",
			endDate: { lte: expiryDate },
		};

		if (centerId) {
			where.centerId = centerId;
		}

		return this.prisma.committeeMemberTerm.findMany({
			where,
			include: {
				member: {
					include: {
						employee: {
							select: {
								id: true,
								employeeId: true,
								fullName: true,
								fullNameAm: true,
							},
						},
					},
				},
				committee: {
					select: {
						id: true,
						code: true,
						name: true,
						nameAm: true,
						committeeType: {
							select: { id: true, code: true, name: true, nameAm: true },
						},
					},
				},
				center: {
					select: { id: true, code: true, name: true, nameAm: true },
				},
			},
			orderBy: { endDate: "asc" },
		});
	}

	async getMemberTermHistory(tenantId: string, memberId: string) {
		return this.prisma.committeeMemberTerm.findMany({
			where: { tenantId, memberId },
			include: {
				committee: {
					select: {
						id: true,
						code: true,
						name: true,
						nameAm: true,
					},
				},
				center: {
					select: { id: true, code: true, name: true, nameAm: true },
				},
				renewedFromTerm: {
					select: { id: true, termNumber: true, startDate: true, endDate: true },
				},
			},
			orderBy: { termNumber: "desc" },
		});
	}

	async getEmployeeTermHistory(tenantId: string, employeeId: string) {
		return this.prisma.committeeMemberTerm.findMany({
			where: { tenantId, employeeId },
			include: {
				committee: {
					select: {
						id: true,
						code: true,
						name: true,
						nameAm: true,
						committeeType: {
							select: { id: true, code: true, name: true, nameAm: true },
						},
					},
				},
				center: {
					select: { id: true, code: true, name: true, nameAm: true },
				},
			},
			orderBy: [{ startDate: "desc" }, { termNumber: "desc" }],
		});
	}

	// ==================== HISTORY METHODS ====================

	async getCommitteeHistory(tenantId: string, committeeId: string) {
		await this.findOneCommittee(tenantId, committeeId);

		return this.prisma.committeeHistory.findMany({
			where: { tenantId, committeeId },
			orderBy: { performedAt: "desc" },
		});
	}

	private async addHistoryEntry(
		tenantId: string,
		committeeId: string,
		action: string,
		previousValue: unknown,
		newValue: unknown,
		performedBy: string,
		notes?: string,
	) {
		return this.prisma.committeeHistory.create({
			data: {
				tenantId,
				committeeId,
				action,
				previousValue: previousValue ? (previousValue as Prisma.InputJsonValue) : Prisma.JsonNull,
				newValue: newValue ? (newValue as Prisma.InputJsonValue) : Prisma.JsonNull,
				performedBy,
				notes,
			},
		});
	}
}
