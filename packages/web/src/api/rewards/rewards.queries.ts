import { useQuery } from "@tanstack/react-query";
import type { EligibilityFilter, ServiceRewardFilter } from "#web/types/rewards";
import { eligibilityApi, rewardMilestonesApi, rewardReportsApi, serviceRewardsApi } from "./rewards.api";

export const rewardKeys = {
	all: ["rewards"] as const,
	milestones: () => [...rewardKeys.all, "milestones"] as const,
	milestone: (id: string) => [...rewardKeys.milestones(), id] as const,
	milestoneStats: () => [...rewardKeys.milestones(), "stats"] as const,
	rewards: () => [...rewardKeys.all, "service-rewards"] as const,
	rewardsList: (filters?: ServiceRewardFilter) => [...rewardKeys.rewards(), "list", filters] as const,
	reward: (id: string) => [...rewardKeys.rewards(), id] as const,
	rewardTimeline: (id: string) => [...rewardKeys.reward(id), "timeline"] as const,
	employeeRewards: (employeeId: string) => [...rewardKeys.rewards(), "employee", employeeId] as const,
	eligibility: () => [...rewardKeys.all, "eligibility"] as const,
	eligibilitySummary: () => [...rewardKeys.eligibility(), "summary"] as const,
	approachingMilestones: (filters?: EligibilityFilter) =>
		[...rewardKeys.eligibility(), "approaching", filters] as const,
	checkEligibility: (employeeId: string, milestoneId: string) =>
		[...rewardKeys.eligibility(), "check", employeeId, milestoneId] as const,
	reports: () => [...rewardKeys.all, "reports"] as const,
	upcomingReport: (monthsAhead?: number, centerId?: string) =>
		[...rewardKeys.reports(), "upcoming", monthsAhead, centerId] as const,
	awardedReport: (year?: number) => [...rewardKeys.reports(), "awarded", year] as const,
	milestoneReport: () => [...rewardKeys.reports(), "by-milestone"] as const,
} as const;

export const useMilestones = (includeInactive = false) =>
	useQuery({
		queryKey: [...rewardKeys.milestones(), includeInactive],
		queryFn: () => rewardMilestonesApi.getAll(includeInactive),
	});

export const useMilestone = (id: string) =>
	useQuery({
		queryKey: rewardKeys.milestone(id),
		queryFn: () => rewardMilestonesApi.getById(id),
		enabled: !!id,
	});

export const useMilestoneStats = () =>
	useQuery({
		queryKey: rewardKeys.milestoneStats(),
		queryFn: () => rewardMilestonesApi.getStats(),
	});

export const useServiceRewards = (filters?: ServiceRewardFilter) =>
	useQuery({
		queryKey: rewardKeys.rewardsList(filters),
		queryFn: () => serviceRewardsApi.getAll(filters),
	});

export const useServiceReward = (id: string) =>
	useQuery({
		queryKey: rewardKeys.reward(id),
		queryFn: () => serviceRewardsApi.getById(id),
		enabled: !!id,
	});

export const useServiceRewardTimeline = (id: string) =>
	useQuery({
		queryKey: rewardKeys.rewardTimeline(id),
		queryFn: () => serviceRewardsApi.getTimeline(id),
		enabled: !!id,
	});

export const useEmployeeRewards = (employeeId: string) =>
	useQuery({
		queryKey: rewardKeys.employeeRewards(employeeId),
		queryFn: () => serviceRewardsApi.getByEmployee(employeeId),
		enabled: !!employeeId,
	});

export const useEligibilitySummary = () =>
	useQuery({
		queryKey: rewardKeys.eligibilitySummary(),
		queryFn: () => eligibilityApi.getSummary(),
	});

export const useApproachingMilestones = (filters?: EligibilityFilter) =>
	useQuery({
		queryKey: rewardKeys.approachingMilestones(filters),
		queryFn: () => eligibilityApi.getApproachingMilestones(filters),
	});

export const useCheckEligibility = (employeeId: string, milestoneId: string, enabled = false) =>
	useQuery({
		queryKey: rewardKeys.checkEligibility(employeeId, milestoneId),
		queryFn: () => eligibilityApi.checkEligibility(employeeId, milestoneId),
		enabled: enabled && !!employeeId && !!milestoneId,
	});

export const useUpcomingReport = (monthsAhead?: number, centerId?: string) =>
	useQuery({
		queryKey: rewardKeys.upcomingReport(monthsAhead, centerId),
		queryFn: () => rewardReportsApi.getUpcoming(monthsAhead, centerId),
	});

export const useAwardedReport = (year?: number) =>
	useQuery({
		queryKey: rewardKeys.awardedReport(year),
		queryFn: () => rewardReportsApi.getAwarded(year),
	});

export const useMilestoneReport = () =>
	useQuery({
		queryKey: rewardKeys.milestoneReport(),
		queryFn: () => rewardReportsApi.getByMilestone(),
	});
