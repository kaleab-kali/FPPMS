import { useQuery } from "@tanstack/react-query";
import { employeeTransferApi } from "#web/api/employees/employee-transfer.api.ts";
import type { TransferStatus } from "#web/types/employee-transfer.ts";

export const employeeTransferKeys = {
	all: ["employee-transfer"] as const,
	transfers: () => [...employeeTransferKeys.all, "transfers"] as const,
	transfersList: (status?: TransferStatus) => [...employeeTransferKeys.transfers(), { status }] as const,
	transfer: (id: string) => [...employeeTransferKeys.transfers(), id] as const,
	history: (employeeId: string) => [...employeeTransferKeys.all, "history", employeeId] as const,
	pendingForCenter: (centerId: string) => [...employeeTransferKeys.all, "pending", centerId] as const,
	outgoingForCenter: (centerId: string) => [...employeeTransferKeys.all, "outgoing", centerId] as const,
	departures: () => [...employeeTransferKeys.all, "departures"] as const,
	departure: (employeeId: string) => [...employeeTransferKeys.departures(), employeeId] as const,
	departureById: (departureId: string) => [...employeeTransferKeys.departures(), "byId", departureId] as const,
} as const;

export const useTransferById = (transferId: string, enabled = true) =>
	useQuery({
		queryKey: employeeTransferKeys.transfer(transferId),
		queryFn: () => employeeTransferApi.getTransferById(transferId),
		enabled: enabled && !!transferId,
	});

export const useTransferHistory = (employeeId: string) =>
	useQuery({
		queryKey: employeeTransferKeys.history(employeeId),
		queryFn: () => employeeTransferApi.getTransferHistory(employeeId),
		enabled: !!employeeId,
	});

export const usePendingTransfersForCenter = (centerId: string, enabled = true) =>
	useQuery({
		queryKey: employeeTransferKeys.pendingForCenter(centerId),
		queryFn: () => employeeTransferApi.getPendingTransfersForCenter(centerId),
		enabled: enabled && !!centerId,
	});

export const useOutgoingTransfersForCenter = (centerId: string, enabled = true) =>
	useQuery({
		queryKey: employeeTransferKeys.outgoingForCenter(centerId),
		queryFn: () => employeeTransferApi.getOutgoingTransfersForCenter(centerId),
		enabled: enabled && !!centerId,
	});

export const useAllTransfers = (status?: TransferStatus) =>
	useQuery({
		queryKey: employeeTransferKeys.transfersList(status),
		queryFn: () => employeeTransferApi.getAllTransfers(status),
	});

export const useDeparture = (employeeId: string, enabled = true) =>
	useQuery({
		queryKey: employeeTransferKeys.departure(employeeId),
		queryFn: () => employeeTransferApi.getDeparture(employeeId),
		enabled: enabled && !!employeeId,
	});

export const useDepartureById = (departureId: string, enabled = true) =>
	useQuery({
		queryKey: employeeTransferKeys.departureById(departureId),
		queryFn: () => employeeTransferApi.getDepartureById(departureId),
		enabled: enabled && !!departureId,
	});

export const useAllDepartures = () =>
	useQuery({
		queryKey: employeeTransferKeys.departures(),
		queryFn: () => employeeTransferApi.getAllDepartures(),
	});
