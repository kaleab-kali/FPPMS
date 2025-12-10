const ETHIOPIAN_MONTHS = [
	"Meskerem",
	"Tikimt",
	"Hidar",
	"Tahsas",
	"Tir",
	"Yekatit",
	"Megabit",
	"Miazia",
	"Ginbot",
	"Sene",
	"Hamle",
	"Nehase",
	"Pagume",
] as const;

export const gregorianToEthiopian = (
	gregorianDate: Date,
): { year: number; month: number; day: number; monthName: string } => {
	const jdn = gregorianToJdn(gregorianDate);
	return jdnToEthiopian(jdn);
};

export const ethiopianToGregorian = (year: number, month: number, day: number): Date => {
	const jdn = ethiopianToJdn(year, month, day);
	return jdnToGregorian(jdn);
};

const gregorianToJdn = (date: Date): number => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	const a = Math.floor((14 - month) / 12);
	const y = year + 4800 - a;
	const m = month + 12 * a - 3;

	return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
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

const jdnToEthiopian = (jdn: number): { year: number; month: number; day: number; monthName: string } => {
	const r = (jdn - 1723856) % 1461;
	const n = (r % 365) + 365 * Math.floor(r / 1460);

	const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
	const month = Math.floor(n / 30) + 1;
	const day = (n % 30) + 1;

	return {
		year,
		month,
		day,
		monthName: ETHIOPIAN_MONTHS[month - 1] || "Unknown",
	};
};

const ethiopianToJdn = (year: number, month: number, day: number): number => {
	return 1723856 + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day - 1;
};

export const formatEthiopianDate = (gregorianDate: Date): string => {
	const eth = gregorianToEthiopian(gregorianDate);
	return `${eth.day} ${eth.monthName} ${eth.year}`;
};

export const getEthiopianMonths = (): readonly string[] => ETHIOPIAN_MONTHS;
