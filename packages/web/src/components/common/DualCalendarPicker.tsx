import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Button } from "#web/components/ui/button.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "#web/components/ui/popover.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#web/components/ui/tabs.tsx";
import {
	ETHIOPIAN_MONTHS,
	ethiopianToGregorian,
	getDaysInEthiopianMonth,
	getEthiopianYear,
	gregorianToEthiopian,
	isValidEthiopianDate,
} from "#web/lib/ethiopian-calendar.ts";
import { cn } from "#web/lib/utils.ts";

interface DualCalendarPickerProps {
	value?: Date;
	onChange?: (date: Date | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	minDate?: Date;
	maxDate?: Date;
}

const GREGORIAN_MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

const GregorianCalendarGrid = React.memo(
	({
		selectedDate,
		onSelect,
		displayYear,
		displayMonth,
		onMonthChange,
		onYearChange,
	}: {
		selectedDate: Date | undefined;
		onSelect: (date: Date) => void;
		displayYear: number;
		displayMonth: number;
		onMonthChange: (month: number) => void;
		onYearChange: (year: number) => void;
	}) => {
		const daysInMonth = React.useMemo(() => {
			return new Date(displayYear, displayMonth + 1, 0).getDate();
		}, [displayYear, displayMonth]);

		const firstDayOfMonth = React.useMemo(() => {
			return new Date(displayYear, displayMonth, 1).getDay();
		}, [displayYear, displayMonth]);

		const handlePrevMonth = React.useCallback(() => {
			if (displayMonth === 0) {
				onYearChange(displayYear - 1);
				onMonthChange(11);
			} else {
				onMonthChange(displayMonth - 1);
			}
		}, [displayMonth, displayYear, onMonthChange, onYearChange]);

		const handleNextMonth = React.useCallback(() => {
			if (displayMonth === 11) {
				onYearChange(displayYear + 1);
				onMonthChange(0);
			} else {
				onMonthChange(displayMonth + 1);
			}
		}, [displayMonth, displayYear, onMonthChange, onYearChange]);

		const handleDayClick = React.useCallback(
			(day: number) => {
				const newDate = new Date(displayYear, displayMonth, day);
				onSelect(newDate);
			},
			[displayYear, displayMonth, onSelect],
		);

		const years = React.useMemo(() => {
			const currentYear = new Date().getFullYear();
			const result: number[] = [];
			for (let i = currentYear - 50; i <= currentYear + 10; i++) {
				result.push(i);
			}
			return result;
		}, []);

		const days = React.useMemo(() => {
			const result: (number | null)[] = [];
			for (let i = 0; i < firstDayOfMonth; i++) {
				result.push(null);
			}
			for (let i = 1; i <= daysInMonth; i++) {
				result.push(i);
			}
			return result;
		}, [firstDayOfMonth, daysInMonth]);

		const isSelected = React.useCallback(
			(day: number) => {
				if (!selectedDate) return false;
				return (
					selectedDate.getFullYear() === displayYear &&
					selectedDate.getMonth() === displayMonth &&
					selectedDate.getDate() === day
				);
			},
			[selectedDate, displayYear, displayMonth],
		);

		return (
			<div className="p-3">
				<div className="flex items-center justify-between mb-4">
					<Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="flex gap-2">
						<Select value={String(displayMonth)} onValueChange={(v) => onMonthChange(Number(v))}>
							<SelectTrigger className="w-[120px] h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{GREGORIAN_MONTHS.map((month, idx) => (
									<SelectItem key={month} value={String(idx)}>
										{month}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={String(displayYear)} onValueChange={(v) => onYearChange(Number(v))}>
							<SelectTrigger className="w-[80px] h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{years.map((year) => (
									<SelectItem key={year} value={String(year)}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>

				<div className="grid grid-cols-7 gap-1 mb-2">
					{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
						<div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
							{day}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7 gap-1">
					{days.map((day, idx) => (
						<div key={`greg-${displayYear}-${displayMonth}-${day ?? `empty-${idx}`}`} className="aspect-square">
							{day !== null ? (
								<Button
									variant={isSelected(day) ? "default" : "ghost"}
									size="sm"
									className={cn(
										"h-full w-full p-0 font-normal",
										isSelected(day) && "bg-primary text-primary-foreground",
									)}
									onClick={() => handleDayClick(day)}
								>
									{day}
								</Button>
							) : null}
						</div>
					))}
				</div>
			</div>
		);
	},
);
GregorianCalendarGrid.displayName = "GregorianCalendarGrid";

const EthiopianCalendarGrid = React.memo(
	({
		selectedDate,
		onSelect,
		displayYear,
		displayMonth,
		onMonthChange,
		onYearChange,
	}: {
		selectedDate: Date | undefined;
		onSelect: (date: Date) => void;
		displayYear: number;
		displayMonth: number;
		onMonthChange: (month: number) => void;
		onYearChange: (year: number) => void;
	}) => {
		const selectedEth = React.useMemo(() => {
			return selectedDate ? gregorianToEthiopian(selectedDate) : null;
		}, [selectedDate]);

		const daysInMonth = React.useMemo(() => {
			return getDaysInEthiopianMonth(displayYear, displayMonth);
		}, [displayYear, displayMonth]);

		const firstDayOfMonth = React.useMemo(() => {
			const gregDate = ethiopianToGregorian(displayYear, displayMonth, 1);
			return gregDate.getDay();
		}, [displayYear, displayMonth]);

		const handlePrevMonth = React.useCallback(() => {
			if (displayMonth === 1) {
				onYearChange(displayYear - 1);
				onMonthChange(13);
			} else {
				onMonthChange(displayMonth - 1);
			}
		}, [displayMonth, displayYear, onMonthChange, onYearChange]);

		const handleNextMonth = React.useCallback(() => {
			if (displayMonth === 13) {
				onYearChange(displayYear + 1);
				onMonthChange(1);
			} else {
				onMonthChange(displayMonth + 1);
			}
		}, [displayMonth, displayYear, onMonthChange, onYearChange]);

		const handleDayClick = React.useCallback(
			(day: number) => {
				if (isValidEthiopianDate(displayYear, displayMonth, day)) {
					const gregDate = ethiopianToGregorian(displayYear, displayMonth, day);
					onSelect(gregDate);
				}
			},
			[displayYear, displayMonth, onSelect],
		);

		const years = React.useMemo(() => {
			const currentYear = getEthiopianYear();
			const result: number[] = [];
			for (let i = currentYear - 50; i <= currentYear + 10; i++) {
				result.push(i);
			}
			return result;
		}, []);

		const days = React.useMemo(() => {
			const result: (number | null)[] = [];
			for (let i = 0; i < firstDayOfMonth; i++) {
				result.push(null);
			}
			for (let i = 1; i <= daysInMonth; i++) {
				result.push(i);
			}
			return result;
		}, [firstDayOfMonth, daysInMonth]);

		const isSelected = React.useCallback(
			(day: number) => {
				return selectedEth?.year === displayYear && selectedEth?.month === displayMonth && selectedEth?.day === day;
			},
			[selectedEth, displayYear, displayMonth],
		);

		return (
			<div className="p-3">
				<div className="flex items-center justify-between mb-4">
					<Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="flex gap-2">
						<Select value={String(displayMonth)} onValueChange={(v) => onMonthChange(Number(v))}>
							<SelectTrigger className="w-[120px] h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ETHIOPIAN_MONTHS.map((month, idx) => (
									<SelectItem key={month.english} value={String(idx + 1)}>
										{month.english}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={String(displayYear)} onValueChange={(v) => onYearChange(Number(v))}>
							<SelectTrigger className="w-[80px] h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{years.map((year) => (
									<SelectItem key={year} value={String(year)}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>

				<div className="grid grid-cols-7 gap-1 mb-2">
					{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
						<div key={day} className="text-center text-xs text-muted-foreground font-medium py-1">
							{day}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7 gap-1">
					{days.map((day, idx) => (
						<div key={`eth-${displayYear}-${displayMonth}-${day ?? `empty-${idx}`}`} className="aspect-square">
							{day !== null ? (
								<Button
									variant={isSelected(day) ? "default" : "ghost"}
									size="sm"
									className={cn(
										"h-full w-full p-0 font-normal",
										isSelected(day) && "bg-primary text-primary-foreground",
									)}
									onClick={() => handleDayClick(day)}
								>
									{day}
								</Button>
							) : null}
						</div>
					))}
				</div>
			</div>
		);
	},
);
EthiopianCalendarGrid.displayName = "EthiopianCalendarGrid";

const DualCalendarPickerComponent = ({
	value,
	onChange,
	placeholder = "Select date",
	disabled = false,
	className,
}: DualCalendarPickerProps): React.ReactElement => {
	const [open, setOpen] = React.useState(false);
	const [activeTab, setActiveTab] = React.useState<string>("gregorian");

	const currentEth = React.useMemo(() => {
		return value ? gregorianToEthiopian(value) : gregorianToEthiopian(new Date());
	}, [value]);

	const currentGreg = React.useMemo(() => {
		return value ?? new Date();
	}, [value]);

	const [ethYear, setEthYear] = React.useState(currentEth.year);
	const [ethMonth, setEthMonth] = React.useState(currentEth.month);
	const [gregYear, setGregYear] = React.useState(currentGreg.getFullYear());
	const [gregMonth, setGregMonth] = React.useState(currentGreg.getMonth());

	React.useEffect(() => {
		if (value) {
			const eth = gregorianToEthiopian(value);
			setEthYear(eth.year);
			setEthMonth(eth.month);
			setGregYear(value.getFullYear());
			setGregMonth(value.getMonth());
		}
	}, [value]);

	const handleSelect = React.useCallback(
		(date: Date | undefined) => {
			onChange?.(date);
			if (date) {
				setOpen(false);
			}
		},
		[onChange],
	);

	const displayValue = React.useMemo(() => {
		if (!value) return "";
		const eth = gregorianToEthiopian(value);
		const gregStr = format(value, "dd MMM yyyy");
		const ethStr = `${eth.day} ${eth.monthName} ${eth.year}`;
		return `${gregStr} | ${ethStr}`;
	}, [value]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
					disabled={disabled}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value ? displayValue : placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="gregorian">Gregorian</TabsTrigger>
						<TabsTrigger value="ethiopian">Ethiopian</TabsTrigger>
					</TabsList>
					<TabsContent value="gregorian" className="mt-0">
						<GregorianCalendarGrid
							selectedDate={value}
							onSelect={handleSelect}
							displayYear={gregYear}
							displayMonth={gregMonth}
							onMonthChange={setGregMonth}
							onYearChange={setGregYear}
						/>
					</TabsContent>
					<TabsContent value="ethiopian" className="mt-0">
						<EthiopianCalendarGrid
							selectedDate={value}
							onSelect={handleSelect}
							displayYear={ethYear}
							displayMonth={ethMonth}
							onMonthChange={setEthMonth}
							onYearChange={setEthYear}
						/>
					</TabsContent>
				</Tabs>
				{value && (
					<div className="border-t p-2 text-center text-sm text-muted-foreground">Selected: {displayValue}</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

const propsAreEqual = (prevProps: DualCalendarPickerProps, nextProps: DualCalendarPickerProps): boolean => {
	const prevValue = prevProps.value?.getTime();
	const nextValue = nextProps.value?.getTime();
	return (
		prevValue === nextValue &&
		prevProps.disabled === nextProps.disabled &&
		prevProps.placeholder === nextProps.placeholder &&
		prevProps.className === nextProps.className
	);
};

export const DualCalendarPicker = React.memo(DualCalendarPickerComponent, propsAreEqual);
DualCalendarPicker.displayName = "DualCalendarPicker";
