export const ETHIOPIAN_MONTHS = [
	{ english: "Meskerem", amharic: "መስከረም", days: 30 },
	{ english: "Tikimt", amharic: "ጥቅምት", days: 30 },
	{ english: "Hidar", amharic: "ኅዳር", days: 30 },
	{ english: "Tahsas", amharic: "ታኅሣሥ", days: 30 },
	{ english: "Tir", amharic: "ጥር", days: 30 },
	{ english: "Yekatit", amharic: "የካቲት", days: 30 },
	{ english: "Megabit", amharic: "መጋቢት", days: 30 },
	{ english: "Miazia", amharic: "ሚያዝያ", days: 30 },
	{ english: "Ginbot", amharic: "ግንቦት", days: 30 },
	{ english: "Sene", amharic: "ሰኔ", days: 30 },
	{ english: "Hamle", amharic: "ሐምሌ", days: 30 },
	{ english: "Nehase", amharic: "ነሐሴ", days: 30 },
	{ english: "Pagume", amharic: "ጳጉሜ", days: 5 },
] as const;

export const ETHIOPIAN_DAYS = [
	{ english: "Sunday", amharic: "እሁድ", short: "እሁ" },
	{ english: "Monday", amharic: "ሰኞ", short: "ሰኞ" },
	{ english: "Tuesday", amharic: "ማክሰኞ", short: "ማክ" },
	{ english: "Wednesday", amharic: "ረቡዕ", short: "ረቡ" },
	{ english: "Thursday", amharic: "ሐሙስ", short: "ሐሙ" },
	{ english: "Friday", amharic: "ዓርብ", short: "ዓር" },
	{ english: "Saturday", amharic: "ቅዳሜ", short: "ቅዳ" },
] as const;

export interface EthiopianDate {
	year: number;
	month: number;
	day: number;
}

export interface FormattedEthiopianDate extends EthiopianDate {
	monthName: string;
	monthNameAm: string;
	dayName: string;
	dayNameAm: string;
}

const gregorianToJdn = (date: Date): number => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	const a = Math.floor((14 - month) / 12);
	const y = year + 4800 - a;
	const m = month + 12 * a - 3;

	return (
		day +
		Math.floor((153 * m + 2) / 5) +
		365 * y +
		Math.floor(y / 4) -
		Math.floor(y / 100) +
		Math.floor(y / 400) -
		32045
	);
};

const jdnToGregorian = (jdn: number): Date => {
	const a = jdn + 32044;
	const b = Math.floor((4 * a + 3) / 146097);
	const c = a - Math.floor((146097 * b) / 4);
	const d = Math.floor((4 * c + 3) / 1461);
	const e = c - Math.floor((1461 * d) / 4);
	const m = Math.floor((5 * e + 2) / 153);

	const day = e - Math.floor((153 * m + 2) / 5) + 1;
	const month = m + 3 - 12 * Math.floor(m / 10);
	const year = 100 * b + d - 4800 + Math.floor(m / 10);

	return new Date(year, month - 1, day);
};

const jdnToEthiopian = (jdn: number): EthiopianDate => {
	const r = (jdn - 1723856) % 1461;
	const n = (r % 365) + 365 * Math.floor(r / 1460);

	const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
	const month = Math.floor(n / 30) + 1;
	const day = (n % 30) + 1;

	return { year, month, day };
};

const ethiopianToJdn = (year: number, month: number, day: number): number => {
	return 1723856 + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day - 1;
};

export const gregorianToEthiopian = (gregorianDate: Date): FormattedEthiopianDate => {
	const jdn = gregorianToJdn(gregorianDate);
	const eth = jdnToEthiopian(jdn);
	const dayOfWeek = gregorianDate.getDay();

	return {
		...eth,
		monthName: ETHIOPIAN_MONTHS[eth.month - 1]?.english ?? "Unknown",
		monthNameAm: ETHIOPIAN_MONTHS[eth.month - 1]?.amharic ?? "",
		dayName: ETHIOPIAN_DAYS[dayOfWeek]?.english ?? "Unknown",
		dayNameAm: ETHIOPIAN_DAYS[dayOfWeek]?.amharic ?? "",
	};
};

export const ethiopianToGregorian = (year: number, month: number, day: number): Date => {
	const jdn = ethiopianToJdn(year, month, day);
	return jdnToGregorian(jdn);
};

export const isEthiopianLeapYear = (ethiopianYear: number): boolean => {
	return ethiopianYear % 4 === 3;
};

export const getDaysInEthiopianMonth = (ethiopianYear: number, month: number): number => {
	if (month === 13) {
		return isEthiopianLeapYear(ethiopianYear) ? 6 : 5;
	}
	return 30;
};

export const isValidEthiopianDate = (year: number, month: number, day: number): boolean => {
	if (year < 1) return false;
	if (month < 1 || month > 13) return false;
	if (day < 1) return false;
	const maxDays = getDaysInEthiopianMonth(year, month);
	return day <= maxDays;
};

export const formatEthiopianDate = (
	gregorianDate: Date,
	options: { format?: "short" | "long" | "full"; language?: "en" | "am" } = {},
): string => {
	const { format = "long", language = "en" } = options;
	const eth = gregorianToEthiopian(gregorianDate);

	if (format === "short") {
		return `${eth.day}/${eth.month}/${eth.year}`;
	}

	if (format === "full") {
		if (language === "am") {
			return `${eth.dayNameAm} ${eth.day} ${eth.monthNameAm} ${eth.year}`;
		}
		return `${eth.dayName} ${eth.day} ${eth.monthName} ${eth.year}`;
	}

	if (language === "am") {
		return `${eth.day} ${eth.monthNameAm} ${eth.year}`;
	}
	return `${eth.day} ${eth.monthName} ${eth.year}`;
};

export const formatDualDate = (
	gregorianDate: Date,
	options: { separator?: string; gregorianFormat?: "short" | "long" } = {},
): string => {
	const { separator = " | ", gregorianFormat = "short" } = options;
	const eth = gregorianToEthiopian(gregorianDate);

	const gregorianStr =
		gregorianFormat === "short"
			? gregorianDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
			: gregorianDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

	const ethiopianStr = `${eth.day} ${eth.monthName} ${eth.year}`;

	return `${gregorianStr}${separator}${ethiopianStr}`;
};

export const parseEthiopianDateString = (dateString: string): EthiopianDate | null => {
	const parts = dateString.split("/").map((p) => Number.parseInt(p.trim(), 10));
	if (parts.length !== 3 || parts.some(Number.isNaN)) return null;

	const [day, month, year] = parts;
	if (!isValidEthiopianDate(year, month, day)) return null;

	return { year, month, day };
};

export const getCurrentEthiopianDate = (): FormattedEthiopianDate => {
	return gregorianToEthiopian(new Date());
};

export const getEthiopianYear = (gregorianDate: Date = new Date()): number => {
	return gregorianToEthiopian(gregorianDate).year;
};

export const getEthiopianMonthName = (month: number, language: "en" | "am" = "en"): string => {
	const monthData = ETHIOPIAN_MONTHS[month - 1];
	if (!monthData) return "Unknown";
	return language === "am" ? monthData.amharic : monthData.english;
};

export const addDaysToEthiopian = (ethiopianDate: EthiopianDate, days: number): EthiopianDate => {
	const gregorian = ethiopianToGregorian(ethiopianDate.year, ethiopianDate.month, ethiopianDate.day);
	gregorian.setDate(gregorian.getDate() + days);
	const result = gregorianToEthiopian(gregorian);
	return { year: result.year, month: result.month, day: result.day };
};

export const addMonthsToEthiopian = (ethiopianDate: EthiopianDate, months: number): EthiopianDate => {
	let { year, month, day } = ethiopianDate;

	month += months;
	while (month > 13) {
		month -= 13;
		year++;
	}
	while (month < 1) {
		month += 13;
		year--;
	}

	const maxDay = getDaysInEthiopianMonth(year, month);
	if (day > maxDay) {
		day = maxDay;
	}

	return { year, month, day };
};

export const getEthiopianMonthRange = (
	year: number,
	month: number,
): { start: Date; end: Date; startEth: EthiopianDate; endEth: EthiopianDate } => {
	const startEth: EthiopianDate = { year, month, day: 1 };
	const daysInMonth = getDaysInEthiopianMonth(year, month);
	const endEth: EthiopianDate = { year, month, day: daysInMonth };

	return {
		start: ethiopianToGregorian(year, month, 1),
		end: ethiopianToGregorian(year, month, daysInMonth),
		startEth,
		endEth,
	};
};

export const getEthiopianYearRange = (year: number): { start: Date; end: Date } => {
	return {
		start: ethiopianToGregorian(year, 1, 1),
		end: ethiopianToGregorian(year, 13, getDaysInEthiopianMonth(year, 13)),
	};
};

export const compareEthiopianDates = (a: EthiopianDate, b: EthiopianDate): number => {
	if (a.year !== b.year) return a.year - b.year;
	if (a.month !== b.month) return a.month - b.month;
	return a.day - b.day;
};

export const ethiopianDateToISOString = (eth: EthiopianDate): string => {
	const gregorian = ethiopianToGregorian(eth.year, eth.month, eth.day);
	return gregorian.toISOString().split("T")[0];
};

export const getFirstDayOfEthiopianMonth = (year: number, month: number): number => {
	const gregorian = ethiopianToGregorian(year, month, 1);
	return gregorian.getDay();
};

export const generateEthiopianMonthGrid = (year: number, month: number): (number | null)[][] => {
	const firstDay = getFirstDayOfEthiopianMonth(year, month);
	const daysInMonth = getDaysInEthiopianMonth(year, month);

	const weeks: (number | null)[][] = [];
	let currentWeek: (number | null)[] = [];

	for (let i = 0; i < firstDay; i++) {
		currentWeek.push(null);
	}

	for (let day = 1; day <= daysInMonth; day++) {
		currentWeek.push(day);
		if (currentWeek.length === 7) {
			weeks.push(currentWeek);
			currentWeek = [];
		}
	}

	if (currentWeek.length > 0) {
		while (currentWeek.length < 7) {
			currentWeek.push(null);
		}
		weeks.push(currentWeek);
	}

	return weeks;
};

export const getEthiopianYearOptions = (range = 100): number[] => {
	const currentYear = getEthiopianYear();
	const years: number[] = [];
	for (let i = currentYear - range; i <= currentYear + 10; i++) {
		years.push(i);
	}
	return years;
};

export const getDaysBetweenDates = (startDate: Date, endDate: Date): number => {
	const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isSameEthiopianDay = (date1: Date, date2: Date): boolean => {
	const eth1 = gregorianToEthiopian(date1);
	const eth2 = gregorianToEthiopian(date2);
	return eth1.year === eth2.year && eth1.month === eth2.month && eth1.day === eth2.day;
};

export const isSameEthiopianMonth = (date1: Date, date2: Date): boolean => {
	const eth1 = gregorianToEthiopian(date1);
	const eth2 = gregorianToEthiopian(date2);
	return eth1.year === eth2.year && eth1.month === eth2.month;
};

export const isToday = (date: Date): boolean => {
	return isSameEthiopianDay(date, new Date());
};
