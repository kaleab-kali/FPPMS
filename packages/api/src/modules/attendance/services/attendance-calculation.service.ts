import { Injectable } from "@nestjs/common";
import { Decimal } from "@prisma/client/runtime/client";
import { ATTENDANCE_STATUS } from "../dto/create-attendance-record.dto";

interface ShiftTimes {
	startTime: string;
	endTime: string;
	breakMinutes: number;
	isOvernight: boolean;
}

@Injectable()
export class AttendanceCalculationService {
	calculateHoursWorked(clockIn: Date | null, clockOut: Date | null, breakMinutes = 0): Decimal | null {
		if (!clockIn || !clockOut) {
			return null;
		}

		const diffMs = clockOut.getTime() - clockIn.getTime();
		const diffHours = diffMs / (1000 * 60 * 60);
		const breakHours = breakMinutes / 60;
		const netHours = Math.max(0, diffHours - breakHours);

		return new Decimal(netHours.toFixed(2));
	}

	calculateOvertimeHours(hoursWorked: Decimal | null, standardHours = 8): Decimal | null {
		if (!hoursWorked) {
			return null;
		}

		const worked = hoursWorked.toNumber();
		const overtime = Math.max(0, worked - standardHours);

		return overtime > 0 ? new Decimal(overtime.toFixed(2)) : null;
	}

	calculateLateMinutes(clockIn: Date | null, shiftStartTime: string | null): number | null {
		if (!clockIn || !shiftStartTime) {
			return null;
		}

		const [hours, minutes] = shiftStartTime.split(":").map(Number);
		const expectedTime = new Date(clockIn);
		expectedTime.setHours(hours, minutes, 0, 0);

		const diffMs = clockIn.getTime() - expectedTime.getTime();
		const diffMinutes = Math.floor(diffMs / (1000 * 60));

		return diffMinutes > 0 ? diffMinutes : 0;
	}

	determineStatus(
		clockIn: Date | null,
		clockOut: Date | null,
		shift: ShiftTimes | null,
		lateThresholdMinutes = 15,
	): string {
		if (!clockIn && !clockOut) {
			return ATTENDANCE_STATUS.ABSENT;
		}

		if (!clockIn || !clockOut) {
			return ATTENDANCE_STATUS.HALF_DAY;
		}

		if (shift) {
			const lateMinutes = this.calculateLateMinutes(clockIn, shift.startTime);
			if (lateMinutes && lateMinutes > lateThresholdMinutes) {
				return ATTENDANCE_STATUS.LATE;
			}
		}

		const hoursWorked = this.calculateHoursWorked(clockIn, clockOut, shift?.breakMinutes ?? 0);
		if (hoursWorked && hoursWorked.toNumber() < 4) {
			return ATTENDANCE_STATUS.HALF_DAY;
		}

		return ATTENDANCE_STATUS.PRESENT;
	}

	calculateShiftWorkingHours(shift: ShiftTimes): number {
		const [startHours, startMinutes] = shift.startTime.split(":").map(Number);
		const [endHours, endMinutes] = shift.endTime.split(":").map(Number);

		let totalMinutes: number;

		if (shift.isOvernight) {
			const minutesToMidnight = (24 - startHours) * 60 - startMinutes;
			const minutesFromMidnight = endHours * 60 + endMinutes;
			totalMinutes = minutesToMidnight + minutesFromMidnight;
		} else {
			totalMinutes = (endHours - startHours) * 60 + (endMinutes - startMinutes);
		}

		const netMinutes = Math.max(0, totalMinutes - shift.breakMinutes);
		return netMinutes / 60;
	}

	parseTimeString(timeStr: string): { hours: number; minutes: number } {
		const [hours, minutes] = timeStr.split(":").map(Number);
		return { hours, minutes };
	}

	formatHoursMinutes(totalMinutes: number): string {
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return `${hours}h ${minutes}m`;
	}

	isWithinShiftTime(timestamp: Date, shift: ShiftTimes, toleranceMinutes = 30): boolean {
		const { hours: startH, minutes: startM } = this.parseTimeString(shift.startTime);
		const { hours: endH, minutes: endM } = this.parseTimeString(shift.endTime);

		const checkTime = timestamp.getHours() * 60 + timestamp.getMinutes();
		const shiftStart = startH * 60 + startM - toleranceMinutes;
		const shiftEnd = endH * 60 + endM + toleranceMinutes;

		if (shift.isOvernight) {
			return checkTime >= shiftStart || checkTime <= shiftEnd;
		}

		return checkTime >= shiftStart && checkTime <= shiftEnd;
	}

	getWorkingDaysInRange(startDate: Date, endDate: Date, excludeWeekends = true): number {
		let count = 0;
		const current = new Date(startDate);

		while (current <= endDate) {
			const dayOfWeek = current.getDay();
			if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
				count++;
			}
			current.setDate(current.getDate() + 1);
		}

		return count;
	}
}
