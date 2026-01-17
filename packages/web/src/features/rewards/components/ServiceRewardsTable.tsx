import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "#web/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import { EligibilityStatusBadge } from "#web/features/rewards/components/EligibilityStatusBadge";
import { RewardStatusBadge } from "#web/features/rewards/components/RewardStatusBadge";
import type { ServiceRewardListItem } from "#web/types/rewards";

interface ServiceRewardsTableProps {
	data: ServiceRewardListItem[];
	onView?: (reward: ServiceRewardListItem) => void;
	isLoading?: boolean;
}

const ServiceRewardsTableComponent = ({ data, onView, isLoading }: ServiceRewardsTableProps): React.ReactElement => {
	const { t } = useTranslation("rewards");

	const columns = React.useMemo(
		(): ColumnDef<ServiceRewardListItem>[] => [
			{
				id: "employee",
				header: () => t("serviceRewards.employee"),
				cell: ({ row }) => (
					<div>
						<div className="font-medium">{row.original.employee?.fullName}</div>
						<div className="text-sm text-muted-foreground">{row.original.employee?.employeeId}</div>
					</div>
				),
			},
			{
				id: "milestone",
				header: () => t("serviceRewards.milestone"),
				cell: ({ row }) => (
					<div>
						<div className="font-medium">{row.original.milestone?.name}</div>
						<div className="text-sm text-muted-foreground">{row.original.milestone?.yearsOfService} years</div>
					</div>
				),
			},
			{
				accessorKey: "eligibilityStatus",
				header: () => t("serviceRewards.eligibilityStatus"),
				cell: ({ row }) => <EligibilityStatusBadge status={row.original.eligibilityStatus} />,
			},
			{
				accessorKey: "status",
				header: () => t("serviceRewards.status"),
				cell: ({ row }) => <RewardStatusBadge status={row.original.status} />,
			},
			{
				accessorKey: "eligibilityCheckDate",
				header: () => t("serviceRewards.checkDate"),
				cell: ({ row }) => format(new Date(row.getValue("eligibilityCheckDate") as string), "MMM dd, yyyy"),
			},
			{
				accessorKey: "awardDate",
				header: () => t("serviceRewards.awardDate"),
				cell: ({ row }) => {
					const date = row.getValue("awardDate") as string | undefined;
					return date ? format(new Date(date), "MMM dd, yyyy") : "-";
				},
			},
			{
				id: "actions",
				header: () => "Actions",
				cell: ({ row }) => (
					<div className="flex gap-2">
						{onView && (
							<Button variant="ghost" size="icon" onClick={() => onView(row.original)} title="View">
								<Eye className="h-4 w-4" />
							</Button>
						)}
					</div>
				),
			},
		],
		[t, onView],
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-10">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length > 0 ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No service rewards found
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};

ServiceRewardsTableComponent.displayName = "ServiceRewardsTable";

export const ServiceRewardsTable = React.memo(
	ServiceRewardsTableComponent,
	(prevProps, nextProps) =>
		prevProps.data === nextProps.data &&
		prevProps.isLoading === nextProps.isLoading &&
		prevProps.onView === nextProps.onView,
);
