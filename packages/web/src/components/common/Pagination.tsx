import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { Button } from "#web/components/ui/button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const PaginationComponent = ({ currentPage, totalPages, onPageChange }: PaginationProps): React.ReactElement | null => {
	const handlePrevious = React.useCallback(() => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	}, [currentPage, onPageChange]);

	const handleNext = React.useCallback(() => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	}, [currentPage, totalPages, onPageChange]);

	const pageNumbers = React.useMemo((): (number | string)[] => {
		const pages: (number | string)[] = [];
		const showPages = 5;

		if (totalPages <= showPages) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (currentPage > 3) {
				pages.push("...");
			}

			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push("...");
			}

			pages.push(totalPages);
		}

		return pages;
	}, [currentPage, totalPages]);

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex items-center justify-center gap-2">
			<Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentPage === 1}>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{pageNumbers.map((page, pageIndex) =>
				typeof page === "number" ? (
					<Button
						key={page}
						variant={currentPage === page ? "default" : "outline"}
						size="icon"
						onClick={() => onPageChange(page)}
					>
						{page}
					</Button>
				) : (
					<span key={`ellipsis-${pageIndex}-${page}`} className="px-2">
						{page}
					</span>
				),
			)}

			<Button variant="outline" size="icon" onClick={handleNext} disabled={currentPage === totalPages}>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
};

PaginationComponent.displayName = "Pagination";

export const Pagination = React.memo(
	PaginationComponent,
	(prevProps, nextProps) =>
		prevProps.currentPage === nextProps.currentPage &&
		prevProps.totalPages === nextProps.totalPages &&
		prevProps.onPageChange === nextProps.onPageChange,
);
