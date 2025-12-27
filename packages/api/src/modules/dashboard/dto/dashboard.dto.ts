import { ApiProperty } from "@nestjs/swagger";

export class CenterStatistics {
	@ApiProperty({ description: "Center ID" })
	centerId: string;

	@ApiProperty({ description: "Center name" })
	centerName: string;

	@ApiProperty({ description: "Total employees in center" })
	totalEmployees: number;

	@ApiProperty({ description: "Active complaints in center" })
	activeComplaints: number;

	@ApiProperty({ description: "Active committees in center" })
	activeCommittees: number;

	@ApiProperty({ description: "Pending appeals in center" })
	pendingAppeals: number;
}

export class ComplaintStatusCount {
	@ApiProperty({ description: "Complaint status" })
	status: string;

	@ApiProperty({ description: "Count of complaints" })
	count: number;
}

export class HqDashboardResponseDto {
	@ApiProperty({ description: "Total employees across all centers" })
	totalEmployees: number;

	@ApiProperty({ description: "Total active centers" })
	totalCenters: number;

	@ApiProperty({ description: "Total active committees" })
	totalCommittees: number;

	@ApiProperty({ description: "Total active complaints" })
	totalComplaints: number;

	@ApiProperty({ description: "Complaints forwarded to HQ awaiting decision" })
	complaintsAwaitingHqDecision: number;

	@ApiProperty({ description: "Pending appeals across all centers" })
	pendingAppeals: number;

	@ApiProperty({ description: "Committee member terms expiring within 30 days" })
	expiringTerms: number;

	@ApiProperty({ description: "Complaints by status", type: [ComplaintStatusCount] })
	complaintsByStatus: ComplaintStatusCount[];

	@ApiProperty({ description: "Statistics per center", type: [CenterStatistics] })
	centerStatistics: CenterStatistics[];
}
