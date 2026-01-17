import React from "react";
import { gregorianToEthiopian } from "#web/lib/ethiopian-calendar.ts";
import { cn } from "#web/lib/utils.ts";

interface DateDisplayProps {
	date: Date | string | null | undefined;
	format?: "dual" | "ethiopian" | "gregorian" | "ethiopian-only";
	showTime?: boolean;
	className?: string;
	ethiopianClassName?: string;
	gregorianClassName?: string;
	layout?: "inline" | "stacked";
}

const DateDisplayComponent = ({
	date,
	format = "dual",
	showTime = false,
	className,
	ethiopianClassName,
	gregorianClassName,
	layout = "inline",
}: DateDisplayProps): React.ReactElement | null => {
	const parsedDate = React.useMemo(() => {
		if (!date) return null;
		if (date instanceof Date) return date;
		const parsed = new Date(date);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}, [date]);

	const formattedGregorian = React.useMemo(() => {
		if (!parsedDate) return "";
		const options: Intl.DateTimeFormatOptions = {
			day: "2-digit",
			month: "short",
			year: "numeric",
		};
		if (showTime) {
			options.hour = "2-digit";
			options.minute = "2-digit";
		}
		return parsedDate.toLocaleDateString("en-GB", options);
	}, [parsedDate, showTime]);

	const formattedEthiopian = React.useMemo(() => {
		if (!parsedDate) return "";
		const eth = gregorianToEthiopian(parsedDate);
		let result = `${eth.day} ${eth.monthName} ${eth.year}`;
		if (showTime) {
			const timeStr = parsedDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
			result += ` ${timeStr}`;
		}
		return result;
	}, [parsedDate, showTime]);

	if (!parsedDate) {
		return <span className={cn("text-muted-foreground", className)}>-</span>;
	}

	if (format === "gregorian") {
		return <span className={cn(className, gregorianClassName)}>{formattedGregorian}</span>;
	}

	if (format === "ethiopian-only") {
		return <span className={cn(className, ethiopianClassName)}>{formattedEthiopian}</span>;
	}

	if (format === "ethiopian") {
		return (
			<span className={cn(className)}>
				<span className={ethiopianClassName}>{formattedEthiopian}</span>
				<span className={cn("text-muted-foreground text-xs ml-1", gregorianClassName)}>({formattedGregorian})</span>
			</span>
		);
	}

	if (layout === "stacked") {
		return (
			<div className={cn("flex flex-col", className)}>
				<span className={gregorianClassName}>{formattedGregorian}</span>
				<span className={cn("text-muted-foreground text-sm", ethiopianClassName)}>{formattedEthiopian}</span>
			</div>
		);
	}

	return (
		<span className={cn(className)}>
			<span className={gregorianClassName}>{formattedGregorian}</span>
			<span className={cn("text-muted-foreground text-sm ml-1", ethiopianClassName)}>({formattedEthiopian})</span>
		</span>
	);
};

const propsAreEqual = (prevProps: DateDisplayProps, nextProps: DateDisplayProps): boolean => {
	const prevDate = prevProps.date instanceof Date ? prevProps.date.getTime() : prevProps.date;
	const nextDate = nextProps.date instanceof Date ? nextProps.date.getTime() : nextProps.date;

	return (
		prevDate === nextDate &&
		prevProps.format === nextProps.format &&
		prevProps.showTime === nextProps.showTime &&
		prevProps.className === nextProps.className &&
		prevProps.layout === nextProps.layout
	);
};

export const DateDisplay = React.memo(DateDisplayComponent, propsAreEqual);
DateDisplay.displayName = "DateDisplay";
