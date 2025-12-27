export interface CenterStatistics {
	centerId: string;
	centerName: string;
	totalEmployees: number;
	activeComplaints: number;
	activeCommittees: number;
	pendingAppeals: number;
}

export interface ComplaintStatusCount {
	status: string;
	count: number;
}

export interface HqDashboardData {
	totalEmployees: number;
	totalCenters: number;
	totalCommittees: number;
	totalComplaints: number;
	complaintsAwaitingHqDecision: number;
	pendingAppeals: number;
	expiringTerms: number;
	complaintsByStatus: ComplaintStatusCount[];
	centerStatistics: CenterStatistics[];
}
