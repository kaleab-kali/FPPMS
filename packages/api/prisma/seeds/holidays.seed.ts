import { PrismaClient } from "@prisma/client";

const HOLIDAYS_2025 = [
	{
		name: "Ethiopian Christmas (Genna)",
		nameAm: "ገና",
		holidayDate: new Date("2025-01-07"),
		holidayType: "RELIGIOUS",
		isRecurring: true,
		recurrenceType: "ETHIOPIAN_CALENDAR",
		ethiopianMonth: 4,
		ethiopianDay: 29,
		description: "Ethiopian Orthodox Christmas celebration",
	},
	{
		name: "Timkat (Epiphany)",
		nameAm: "ጥምቀት",
		holidayDate: new Date("2025-01-19"),
		holidayType: "RELIGIOUS",
		isRecurring: true,
		recurrenceType: "ETHIOPIAN_CALENDAR",
		ethiopianMonth: 5,
		ethiopianDay: 11,
		description: "Ethiopian Orthodox Epiphany celebration",
	},
	{
		name: "Adwa Victory Day",
		nameAm: "የዓድዋ ድል ቀን",
		holidayDate: new Date("2025-03-02"),
		holidayType: "NATIONAL",
		isRecurring: true,
		recurrenceType: "GREGORIAN",
		description: "Commemoration of the Battle of Adwa victory in 1896",
	},
	{
		name: "Ethiopian Good Friday",
		nameAm: "ስቅለት",
		holidayDate: new Date("2025-04-18"),
		holidayType: "RELIGIOUS",
		isRecurring: true,
		recurrenceType: "VARIABLE",
		description: "Ethiopian Orthodox Good Friday",
	},
	{
		name: "Ethiopian Easter (Fasika)",
		nameAm: "ፋሲካ",
		holidayDate: new Date("2025-04-20"),
		holidayType: "RELIGIOUS",
		isRecurring: true,
		recurrenceType: "VARIABLE",
		description: "Ethiopian Orthodox Easter celebration",
	},
	{
		name: "International Labour Day",
		nameAm: "ዓለም አቀፍ የሰራተኞች ቀን",
		holidayDate: new Date("2025-05-01"),
		holidayType: "NATIONAL",
		isRecurring: true,
		recurrenceType: "GREGORIAN",
		description: "International Workers' Day",
	},
	{
		name: "Ethiopian Patriots Victory Day",
		nameAm: "የአርበኞች ቀን",
		holidayDate: new Date("2025-05-05"),
		holidayType: "NATIONAL",
		isRecurring: true,
		recurrenceType: "GREGORIAN",
		description: "Commemoration of liberation from Italian occupation",
	},
	{
		name: "Downfall of the Derg",
		nameAm: "የደርግ መውደቅ ቀን",
		holidayDate: new Date("2025-05-28"),
		holidayType: "NATIONAL",
		isRecurring: true,
		recurrenceType: "GREGORIAN",
		description: "End of the Derg regime",
	},
	{
		name: "Eid al-Fitr",
		nameAm: "ኢድ አል ፊጥር",
		holidayDate: new Date("2025-03-30"),
		holidayType: "RELIGIOUS",
		isRecurring: true,
		recurrenceType: "ISLAMIC_CALENDAR",
		description: "End of Ramadan celebration",
	},
	{
		name: "Eid al-Adha",
		nameAm: "ኢድ አል አድሃ",
		holidayDate: new Date("2025-06-06"),
		holidayType: "RELIGIOUS",
		isRecurring: true,
		recurrenceType: "ISLAMIC_CALENDAR",
		description: "Feast of Sacrifice",
	},
	{
		name: "Ethiopian New Year (Enkutatash)",
		nameAm: "እንቁጣጣሽ",
		holidayDate: new Date("2025-09-11"),
		holidayType: "NATIONAL",
		isRecurring: true,
		recurrenceType: "ETHIOPIAN_CALENDAR",
		ethiopianMonth: 1,
		ethiopianDay: 1,
		description: "Ethiopian New Year celebration",
	},
	{
		name: "Finding of the True Cross (Meskel)",
		nameAm: "መስቀል",
		holidayDate: new Date("2025-09-27"),
		holidayType: "RELIGIOUS",
		isRecurring: true,
		recurrenceType: "ETHIOPIAN_CALENDAR",
		ethiopianMonth: 1,
		ethiopianDay: 17,
		description: "Commemoration of finding the True Cross",
	},
	{
		name: "Mawlid (Prophet's Birthday)",
		nameAm: "መውሊድ",
		holidayDate: new Date("2025-09-04"),
		holidayType: "RELIGIOUS",
		isRecurring: true,
		recurrenceType: "ISLAMIC_CALENDAR",
		description: "Birthday of Prophet Muhammad",
	},
];

export const seedHolidays = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	for (const holiday of HOLIDAYS_2025) {
		const existing = await prisma.holiday.findFirst({
			where: { tenantId, holidayDate: holiday.holidayDate },
		});

		if (existing) {
			console.log(
				`Holiday ${holiday.name} already exists for date ${holiday.holidayDate.toISOString().split("T")[0]}, skipping...`,
			);
			continue;
		}

		await prisma.holiday.create({
			data: {
				tenantId,
				name: holiday.name,
				nameAm: holiday.nameAm,
				holidayDate: holiday.holidayDate,
				holidayType: holiday.holidayType,
				isHalfDay: false,
				isRecurring: holiday.isRecurring,
				recurrenceType: holiday.recurrenceType,
				ethiopianMonth: holiday.ethiopianMonth,
				ethiopianDay: holiday.ethiopianDay,
				appliesTo: ["ALL"],
				description: holiday.description,
			},
		});

		console.log(`Created holiday: ${holiday.name} (${holiday.holidayDate.toISOString().split("T")[0]})`);
	}
};
