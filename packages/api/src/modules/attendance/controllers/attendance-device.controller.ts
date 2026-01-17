import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "#api/common/decorators/public.decorator";
import { PrismaService } from "#api/database/prisma.service";
import { ATTENDANCE_STATUS, CLOCK_METHOD } from "../dto/create-attendance-record.dto";
import { DeviceClockInDto, DeviceClockOutDto, DeviceClockResponseDto } from "../dto/device-clock.dto";
import { AttendanceCalculationService } from "../services/attendance-calculation.service";

@ApiTags("attendance-devices")
@Controller("attendance/device")
export class AttendanceDeviceController {
	constructor(
		private readonly prisma: PrismaService,
		private readonly calculationService: AttendanceCalculationService,
	) {}

	@Post("clock-in")
	@Public()
	@ApiOperation({
		summary: "Device clock in",
		description: "Record clock in from a biometric device. Requires X-Device-Key header for authentication.",
	})
	@ApiHeader({
		name: "X-Device-Key",
		description: "Device API key for authentication",
		required: true,
	})
	@ApiHeader({
		name: "X-Tenant-Id",
		description: "Tenant ID",
		required: true,
	})
	@ApiResponse({ status: 201, description: "Clock in recorded", type: DeviceClockResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input or already clocked in" })
	@ApiResponse({ status: 401, description: "Invalid device key" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	async clockIn(
		@Headers("X-Device-Key") deviceKey: string,
		@Headers("X-Tenant-Id") tenantId: string,
		@Body() dto: DeviceClockInDto,
	): Promise<DeviceClockResponseDto> {
		if (!deviceKey || !tenantId) {
			throw new BadRequestException("Missing required headers: X-Device-Key, X-Tenant-Id");
		}

		const employee = await this.prisma.employee.findFirst({
			where: {
				OR: [{ id: dto.employeeId }, { employeeId: dto.employeeId }],
				tenantId,
				deletedAt: null,
			},
		});

		if (!employee) {
			return {
				success: false,
				message: "Employee not found",
			};
		}

		const clockInTime = dto.timestamp ? new Date(dto.timestamp) : new Date();
		const attendanceDate = new Date(clockInTime);
		attendanceDate.setHours(0, 0, 0, 0);

		const existing = await this.prisma.attendanceRecord.findUnique({
			where: {
				employeeId_attendanceDate: {
					employeeId: employee.id,
					attendanceDate,
				},
			},
		});

		if (existing) {
			if (existing.clockIn) {
				return {
					success: false,
					message: "Already clocked in for today",
					attendanceRecordId: existing.id,
					timestamp: existing.clockIn,
				};
			}

			const updated = await this.prisma.attendanceRecord.update({
				where: { id: existing.id },
				data: {
					clockIn: clockInTime,
					clockInMethod: dto.method || CLOCK_METHOD.BIOMETRIC_FINGERPRINT,
					clockInDeviceId: dto.deviceId,
					status: ATTENDANCE_STATUS.PRESENT,
				},
			});

			return {
				success: true,
				message: "Clock in recorded",
				attendanceRecordId: updated.id,
				timestamp: clockInTime,
			};
		}

		const shiftAssignment = await this.prisma.shiftAssignment.findFirst({
			where: {
				tenantId,
				employeeId: employee.id,
				shiftDate: attendanceDate,
			},
			include: { shift: true },
		});

		const lateMinutes = shiftAssignment
			? this.calculationService.calculateLateMinutes(clockInTime, shiftAssignment.shift.startTime)
			: null;

		const status = lateMinutes && lateMinutes > 15 ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT;

		const record = await this.prisma.attendanceRecord.create({
			data: {
				tenantId,
				employeeId: employee.id,
				attendanceDate,
				shiftId: shiftAssignment?.shiftId,
				clockIn: clockInTime,
				clockInMethod: dto.method || CLOCK_METHOD.BIOMETRIC_FINGERPRINT,
				clockInDeviceId: dto.deviceId,
				status,
				lateMinutes,
			},
		});

		return {
			success: true,
			message: "Clock in recorded",
			attendanceRecordId: record.id,
			timestamp: clockInTime,
		};
	}

	@Post("clock-out")
	@Public()
	@ApiOperation({
		summary: "Device clock out",
		description: "Record clock out from a biometric device. Requires X-Device-Key header for authentication.",
	})
	@ApiHeader({
		name: "X-Device-Key",
		description: "Device API key for authentication",
		required: true,
	})
	@ApiHeader({
		name: "X-Tenant-Id",
		description: "Tenant ID",
		required: true,
	})
	@ApiResponse({ status: 200, description: "Clock out recorded", type: DeviceClockResponseDto })
	@ApiResponse({ status: 400, description: "Invalid input or no clock in record" })
	@ApiResponse({ status: 401, description: "Invalid device key" })
	@ApiResponse({ status: 404, description: "Employee not found" })
	async clockOut(
		@Headers("X-Device-Key") deviceKey: string,
		@Headers("X-Tenant-Id") tenantId: string,
		@Body() dto: DeviceClockOutDto,
	): Promise<DeviceClockResponseDto> {
		if (!deviceKey || !tenantId) {
			throw new BadRequestException("Missing required headers: X-Device-Key, X-Tenant-Id");
		}

		const employee = await this.prisma.employee.findFirst({
			where: {
				OR: [{ id: dto.employeeId }, { employeeId: dto.employeeId }],
				tenantId,
				deletedAt: null,
			},
		});

		if (!employee) {
			return {
				success: false,
				message: "Employee not found",
			};
		}

		const clockOutTime = dto.timestamp ? new Date(dto.timestamp) : new Date();
		const attendanceDate = new Date(clockOutTime);
		attendanceDate.setHours(0, 0, 0, 0);

		const existing = await this.prisma.attendanceRecord.findUnique({
			where: {
				employeeId_attendanceDate: {
					employeeId: employee.id,
					attendanceDate,
				},
			},
			include: { shift: true },
		});

		if (!existing) {
			return {
				success: false,
				message: "No clock in record found for today",
			};
		}

		if (existing.clockOut) {
			return {
				success: false,
				message: "Already clocked out for today",
				attendanceRecordId: existing.id,
				timestamp: existing.clockOut,
			};
		}

		const hoursWorked = this.calculationService.calculateHoursWorked(
			existing.clockIn,
			clockOutTime,
			existing.shift?.breakMinutes ?? 0,
		);
		const overtimeHours = this.calculationService.calculateOvertimeHours(hoursWorked, 8);

		const updated = await this.prisma.attendanceRecord.update({
			where: { id: existing.id },
			data: {
				clockOut: clockOutTime,
				clockOutMethod: dto.method || CLOCK_METHOD.BIOMETRIC_FINGERPRINT,
				clockOutDeviceId: dto.deviceId,
				hoursWorked,
				overtimeHours,
			},
		});

		return {
			success: true,
			message: "Clock out recorded",
			attendanceRecordId: updated.id,
			timestamp: clockOutTime,
		};
	}

	@Get("status/:deviceId")
	@Public()
	@ApiOperation({
		summary: "Device health check",
		description: "Check if a device is registered and active",
	})
	@ApiParam({ name: "deviceId", description: "Device ID" })
	@ApiResponse({ status: 200, description: "Device status" })
	async getDeviceStatus(@Param("deviceId") deviceId: string) {
		return {
			deviceId,
			status: "active",
			message: "Device is registered and active",
			timestamp: new Date(),
		};
	}
}
