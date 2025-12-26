import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { EmployeeStatus, TransferSource, TransferStatus } from "@prisma/client";
import { PrismaService } from "#api/database/prisma.service";
import { EmployeeTransferService } from "#api/modules/employees/services/employee-transfer.service";

const mockPrismaService = {
	employee: {
		findFirst: jest.fn(),
		update: jest.fn(),
	},
	center: {
		findFirst: jest.fn(),
	},
	department: {
		findFirst: jest.fn(),
	},
	position: {
		findFirst: jest.fn(),
	},
	employeeTransferRequest: {
		create: jest.fn(),
		findFirst: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
	},
	employeeDeparture: {
		create: jest.fn(),
		findFirst: jest.fn(),
		findUnique: jest.fn(),
		findMany: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	},
	$transaction: jest.fn(),
};

describe("EmployeeTransferService", () => {
	let service: EmployeeTransferService;

	const tenantId = "tenant-123";
	const userId = "user-123";
	const employeeId = "emp-123";
	const centerId = "center-123";
	const toCenterId = "center-456";
	const transferId = "transfer-123";
	const departureId = "departure-123";

	const mockEmployee = {
		id: employeeId,
		tenantId,
		status: EmployeeStatus.ACTIVE,
		centerId,
		departmentId: "dept-123",
		positionId: "pos-123",
		fullName: "Test Employee",
	};

	const mockTransfer = {
		id: transferId,
		tenantId,
		employeeId,
		status: TransferStatus.PENDING,
		fromCenterId: centerId,
		toCenterId,
		fromDepartmentId: "dept-123",
		toDepartmentId: "dept-456",
		fromPositionId: "pos-123",
		toPositionId: "pos-456",
		transferReason: "Test reason",
		effectiveDate: new Date(),
		employee: mockEmployee,
	};

	const mockDeparture = {
		id: departureId,
		tenantId,
		employeeId,
		departureDate: new Date(),
		departureReason: "Resignation",
		employee: mockEmployee,
		attachments: [],
	};

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [EmployeeTransferService, { provide: PrismaService, useValue: mockPrismaService }],
		}).compile();

		service = module.get<EmployeeTransferService>(EmployeeTransferService);
	});

	describe("createTransferRequest", () => {
		const createDto = {
			employeeId,
			toCenterId,
			toDepartmentId: "dept-456",
			toPositionId: "pos-456",
			effectiveDate: new Date(),
			transferReason: "Test transfer",
		};

		it("should create a transfer request successfully", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(mockEmployee);
			mockPrismaService.center.findFirst.mockResolvedValue({ id: toCenterId, tenantId });
			mockPrismaService.department.findFirst.mockResolvedValue({ id: "dept-456", tenantId });
			mockPrismaService.position.findFirst.mockResolvedValue({ id: "pos-456", tenantId });
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(null);
			mockPrismaService.employeeTransferRequest.create.mockResolvedValue(mockTransfer);

			const result = await service.createTransferRequest(tenantId, createDto, userId);

			expect(result).toEqual(mockTransfer);
			expect(mockPrismaService.employeeTransferRequest.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						tenantId,
						employeeId,
						transferSource: TransferSource.MANUAL,
						status: TransferStatus.PENDING,
						toCenterId,
						initiatedBy: userId,
					}),
				}),
			);
		});

		it("should throw NotFoundException if employee not found", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(null);

			await expect(service.createTransferRequest(tenantId, createDto, userId)).rejects.toThrow(
				new NotFoundException("Employee not found"),
			);
		});

		it("should throw BadRequestException if employee is not active", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue({
				...mockEmployee,
				status: EmployeeStatus.TERMINATED,
			});

			await expect(service.createTransferRequest(tenantId, createDto, userId)).rejects.toThrow(
				new BadRequestException("Only active employees can be transferred"),
			);
		});

		it("should throw BadRequestException if employee has no center", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue({
				...mockEmployee,
				centerId: null,
			});

			await expect(service.createTransferRequest(tenantId, createDto, userId)).rejects.toThrow(
				new BadRequestException("Employee must be assigned to a center before transfer"),
			);
		});

		it("should throw BadRequestException if transferring to same center", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(mockEmployee);

			await expect(
				service.createTransferRequest(tenantId, { ...createDto, toCenterId: centerId }, userId),
			).rejects.toThrow(new BadRequestException("Employee is already in the target center"));
		});

		it("should throw NotFoundException if target center not found", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(mockEmployee);
			mockPrismaService.center.findFirst.mockResolvedValue(null);

			await expect(service.createTransferRequest(tenantId, createDto, userId)).rejects.toThrow(
				new NotFoundException("Target center not found"),
			);
		});

		it("should throw NotFoundException if target department not found", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(mockEmployee);
			mockPrismaService.center.findFirst.mockResolvedValue({ id: toCenterId, tenantId });
			mockPrismaService.department.findFirst.mockResolvedValue(null);

			await expect(service.createTransferRequest(tenantId, createDto, userId)).rejects.toThrow(
				new NotFoundException("Target department not found"),
			);
		});

		it("should throw NotFoundException if target position not found", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(mockEmployee);
			mockPrismaService.center.findFirst.mockResolvedValue({ id: toCenterId, tenantId });
			mockPrismaService.department.findFirst.mockResolvedValue({ id: "dept-456", tenantId });
			mockPrismaService.position.findFirst.mockResolvedValue(null);

			await expect(service.createTransferRequest(tenantId, createDto, userId)).rejects.toThrow(
				new NotFoundException("Target position not found"),
			);
		});

		it("should throw BadRequestException if employee has pending transfer", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(mockEmployee);
			mockPrismaService.center.findFirst.mockResolvedValue({ id: toCenterId, tenantId });
			mockPrismaService.department.findFirst.mockResolvedValue({ id: "dept-456", tenantId });
			mockPrismaService.position.findFirst.mockResolvedValue({ id: "pos-456", tenantId });
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(mockTransfer);

			await expect(service.createTransferRequest(tenantId, createDto, userId)).rejects.toThrow(
				new BadRequestException("Employee already has a pending transfer request"),
			);
		});
	});

	describe("acceptTransfer", () => {
		const acceptDto = {
			departmentId: "dept-789",
			positionId: "pos-789",
			remarks: "Accepted",
		};

		it("should accept a transfer and update employee", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(mockTransfer);
			mockPrismaService.department.findFirst.mockResolvedValue({ id: "dept-789", tenantId });
			mockPrismaService.position.findFirst.mockResolvedValue({ id: "pos-789", tenantId });
			mockPrismaService.$transaction.mockResolvedValue([{ ...mockTransfer, status: TransferStatus.ACCEPTED }]);

			const result = await service.acceptTransfer(tenantId, transferId, acceptDto, userId);

			expect(result.status).toBe(TransferStatus.ACCEPTED);
			expect(mockPrismaService.$transaction).toHaveBeenCalled();
		});

		it("should throw NotFoundException if transfer not found", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(null);

			await expect(service.acceptTransfer(tenantId, transferId, acceptDto, userId)).rejects.toThrow(
				new NotFoundException("Transfer request not found"),
			);
		});

		it("should throw BadRequestException if transfer is not pending", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue({
				...mockTransfer,
				status: TransferStatus.ACCEPTED,
			});

			await expect(service.acceptTransfer(tenantId, transferId, acceptDto, userId)).rejects.toThrow(
				new BadRequestException("Transfer request is already accepted"),
			);
		});

		it("should throw NotFoundException if department not found", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(mockTransfer);
			mockPrismaService.department.findFirst.mockResolvedValue(null);

			await expect(service.acceptTransfer(tenantId, transferId, acceptDto, userId)).rejects.toThrow(
				new NotFoundException("Department not found"),
			);
		});

		it("should throw NotFoundException if position not found", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(mockTransfer);
			mockPrismaService.department.findFirst.mockResolvedValue({ id: "dept-789", tenantId });
			mockPrismaService.position.findFirst.mockResolvedValue(null);

			await expect(service.acceptTransfer(tenantId, transferId, acceptDto, userId)).rejects.toThrow(
				new NotFoundException("Position not found"),
			);
		});

		it("should accept transfer without new department/position", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(mockTransfer);
			mockPrismaService.$transaction.mockResolvedValue([{ ...mockTransfer, status: TransferStatus.ACCEPTED }]);

			const result = await service.acceptTransfer(tenantId, transferId, {}, userId);

			expect(result.status).toBe(TransferStatus.ACCEPTED);
		});
	});

	describe("rejectTransfer", () => {
		const rejectDto = { rejectionReason: "Not suitable" };

		it("should reject a transfer", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(mockTransfer);
			mockPrismaService.employeeTransferRequest.update.mockResolvedValue({
				...mockTransfer,
				status: TransferStatus.REJECTED,
				rejectionReason: rejectDto.rejectionReason,
			});

			const result = await service.rejectTransfer(tenantId, transferId, rejectDto, userId);

			expect(result.status).toBe(TransferStatus.REJECTED);
			expect(result.rejectionReason).toBe(rejectDto.rejectionReason);
		});

		it("should throw NotFoundException if transfer not found", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(null);

			await expect(service.rejectTransfer(tenantId, transferId, rejectDto, userId)).rejects.toThrow(
				new NotFoundException("Transfer request not found"),
			);
		});

		it("should throw BadRequestException if transfer is not pending", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue({
				...mockTransfer,
				status: TransferStatus.REJECTED,
			});

			await expect(service.rejectTransfer(tenantId, transferId, rejectDto, userId)).rejects.toThrow(
				new BadRequestException("Transfer request is already rejected"),
			);
		});
	});

	describe("cancelTransfer", () => {
		const cancelDto = { cancellationReason: "Changed plans" };

		it("should cancel a pending transfer", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(mockTransfer);
			mockPrismaService.employeeTransferRequest.update.mockResolvedValue({
				...mockTransfer,
				status: TransferStatus.CANCELLED,
			});

			const result = await service.cancelTransfer(tenantId, transferId, cancelDto, userId);

			expect(result.status).toBe(TransferStatus.CANCELLED);
		});

		it("should throw NotFoundException if transfer not found", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(null);

			await expect(service.cancelTransfer(tenantId, transferId, cancelDto, userId)).rejects.toThrow(
				new NotFoundException("Transfer request not found"),
			);
		});

		it("should throw BadRequestException if transfer is not pending", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue({
				...mockTransfer,
				status: TransferStatus.ACCEPTED,
			});

			await expect(service.cancelTransfer(tenantId, transferId, cancelDto, userId)).rejects.toThrow(
				new BadRequestException("Only pending transfers can be cancelled"),
			);
		});
	});

	describe("getTransferById", () => {
		it("should return transfer by ID", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(mockTransfer);

			const result = await service.getTransferById(tenantId, transferId);

			expect(result).toEqual(mockTransfer);
		});

		it("should throw NotFoundException if transfer not found", async () => {
			mockPrismaService.employeeTransferRequest.findFirst.mockResolvedValue(null);

			await expect(service.getTransferById(tenantId, transferId)).rejects.toThrow(
				new NotFoundException("Transfer request not found"),
			);
		});
	});

	describe("getTransferHistory", () => {
		it("should return transfer history for employee", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(mockEmployee);
			mockPrismaService.employeeTransferRequest.findMany.mockResolvedValue([mockTransfer]);

			const result = await service.getTransferHistory(tenantId, employeeId);

			expect(result).toEqual([mockTransfer]);
		});

		it("should throw NotFoundException if employee not found", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(null);

			await expect(service.getTransferHistory(tenantId, employeeId)).rejects.toThrow(
				new NotFoundException("Employee not found"),
			);
		});
	});

	describe("getPendingTransfersForCenter", () => {
		it("should return pending incoming transfers", async () => {
			mockPrismaService.employeeTransferRequest.findMany.mockResolvedValue([mockTransfer]);

			const result = await service.getPendingTransfersForCenter(tenantId, centerId);

			expect(result).toEqual([mockTransfer]);
			expect(mockPrismaService.employeeTransferRequest.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						tenantId,
						toCenterId: centerId,
						status: TransferStatus.PENDING,
					},
				}),
			);
		});
	});

	describe("getOutgoingTransfersForCenter", () => {
		it("should return outgoing pending transfers", async () => {
			mockPrismaService.employeeTransferRequest.findMany.mockResolvedValue([mockTransfer]);

			const result = await service.getOutgoingTransfersForCenter(tenantId, centerId);

			expect(result).toEqual([mockTransfer]);
			expect(mockPrismaService.employeeTransferRequest.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						tenantId,
						fromCenterId: centerId,
						status: TransferStatus.PENDING,
					},
				}),
			);
		});
	});

	describe("getAllTransfers", () => {
		it("should return all transfers", async () => {
			mockPrismaService.employeeTransferRequest.findMany.mockResolvedValue([mockTransfer]);

			const result = await service.getAllTransfers(tenantId);

			expect(result).toEqual([mockTransfer]);
		});

		it("should filter by status", async () => {
			mockPrismaService.employeeTransferRequest.findMany.mockResolvedValue([mockTransfer]);

			await service.getAllTransfers(tenantId, TransferStatus.PENDING);

			expect(mockPrismaService.employeeTransferRequest.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						tenantId,
						status: TransferStatus.PENDING,
					},
				}),
			);
		});
	});

	describe("createDeparture", () => {
		const createDto = {
			employeeId,
			departureDate: new Date(),
			departureReason: "Resignation",
			destinationOrganization: "New Company",
		};

		it("should create a departure record", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(mockEmployee);
			mockPrismaService.employeeDeparture.findUnique.mockResolvedValue(null);
			mockPrismaService.$transaction.mockResolvedValue([mockDeparture]);

			const result = await service.createDeparture(tenantId, createDto, userId);

			expect(result).toEqual(mockDeparture);
		});

		it("should throw NotFoundException if employee not found", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(null);

			await expect(service.createDeparture(tenantId, createDto, userId)).rejects.toThrow(
				new NotFoundException("Employee not found"),
			);
		});

		it("should throw BadRequestException if departure already exists", async () => {
			mockPrismaService.employee.findFirst.mockResolvedValue(mockEmployee);
			mockPrismaService.employeeDeparture.findUnique.mockResolvedValue(mockDeparture);

			await expect(service.createDeparture(tenantId, createDto, userId)).rejects.toThrow(
				new BadRequestException("Departure record already exists for this employee"),
			);
		});
	});

	describe("updateDeparture", () => {
		const updateDto = { departureReason: "Retirement" };

		it("should update a departure record", async () => {
			mockPrismaService.employeeDeparture.findFirst.mockResolvedValue(mockDeparture);
			mockPrismaService.employeeDeparture.update.mockResolvedValue({
				...mockDeparture,
				departureReason: "Retirement",
			});

			const result = await service.updateDeparture(tenantId, departureId, updateDto);

			expect(result.departureReason).toBe("Retirement");
		});

		it("should throw NotFoundException if departure not found", async () => {
			mockPrismaService.employeeDeparture.findFirst.mockResolvedValue(null);

			await expect(service.updateDeparture(tenantId, departureId, updateDto)).rejects.toThrow(
				new NotFoundException("Departure record not found"),
			);
		});
	});

	describe("getDeparture", () => {
		it("should return departure by employee ID", async () => {
			mockPrismaService.employeeDeparture.findFirst.mockResolvedValue(mockDeparture);

			const result = await service.getDeparture(tenantId, employeeId);

			expect(result).toEqual(mockDeparture);
		});

		it("should return null if no departure exists", async () => {
			mockPrismaService.employeeDeparture.findFirst.mockResolvedValue(null);

			const result = await service.getDeparture(tenantId, employeeId);

			expect(result).toBeNull();
		});
	});

	describe("getDepartureById", () => {
		it("should return departure by ID", async () => {
			mockPrismaService.employeeDeparture.findFirst.mockResolvedValue(mockDeparture);

			const result = await service.getDepartureById(tenantId, departureId);

			expect(result).toEqual(mockDeparture);
		});

		it("should throw NotFoundException if departure not found", async () => {
			mockPrismaService.employeeDeparture.findFirst.mockResolvedValue(null);

			await expect(service.getDepartureById(tenantId, departureId)).rejects.toThrow(
				new NotFoundException("Departure record not found"),
			);
		});
	});

	describe("getAllDepartures", () => {
		it("should return all departures", async () => {
			mockPrismaService.employeeDeparture.findMany.mockResolvedValue([mockDeparture]);

			const result = await service.getAllDepartures(tenantId);

			expect(result).toEqual([mockDeparture]);
		});
	});

	describe("deleteDeparture", () => {
		it("should delete departure and reinstate employee", async () => {
			mockPrismaService.employeeDeparture.findFirst.mockResolvedValue(mockDeparture);
			mockPrismaService.$transaction.mockResolvedValue([]);

			const result = await service.deleteDeparture(tenantId, departureId, userId);

			expect(result).toEqual({ message: "Departure record deleted successfully" });
			expect(mockPrismaService.$transaction).toHaveBeenCalled();
		});

		it("should throw NotFoundException if departure not found", async () => {
			mockPrismaService.employeeDeparture.findFirst.mockResolvedValue(null);

			await expect(service.deleteDeparture(tenantId, departureId, userId)).rejects.toThrow(
				new NotFoundException("Departure record not found"),
			);
		});
	});
});
